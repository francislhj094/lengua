import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import * as logger from 'firebase-functions/logger';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

initializeApp();
const db = getFirestore();

/**
 * Shared secret echoed by RevenueCat in the Authorization header. Configure the
 * identical value in RevenueCat under Project Settings -> Integrations ->
 * Webhooks -> Authorization header.
 */
const WEBHOOK_SECRET = defineSecret('REVENUECAT_WEBHOOK_SECRET');

/**
 * RevenueCat *secret* REST key (sk_...), not the public appl_ SDK key. Used to
 * re-read authoritative customer state rather than trusting the event body.
 */
const REVENUECAT_API_KEY = defineSecret('REVENUECAT_API_KEY');

const ENTITLEMENT_ID = 'premium';

/** Events that carry no entitlement change worth persisting. */
const IGNORED_EVENT_TYPES = new Set(['TEST', 'SUBSCRIBER_ALIAS']);

interface RevenueCatEvent {
  type?: string;
  app_user_id?: string;
  original_app_user_id?: string;
  aliases?: string[];
}

/**
 * Timing-safe-ish comparison. Node's timingSafeEqual needs equal lengths, so
 * length is checked first and leaks only the length, not the contents.
 */
function secretsMatch(provided: string, expected: string): boolean {
  if (provided.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < provided.length; i += 1) {
    mismatch |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Candidate app user IDs for one event. RevenueCat's own guidance is to match
 * on the full alias set - original_app_user_id means "first ID seen", not
 * "the real user", so matching on it alone silently misses aliased customers.
 */
function candidateUserIds(event: RevenueCatEvent): string[] {
  const ids = [
    event.app_user_id,
    event.original_app_user_id,
    ...(event.aliases ?? []),
  ].filter((id): id is string => typeof id === 'string' && id.length > 0);

  return [...new Set(ids)];
}

/** Anonymous RevenueCat IDs are not Firebase UIDs and own no user document. */
function isAnonymousId(id: string): boolean {
  return id.startsWith('$RCAnonymousID:');
}

interface EntitlementState {
  isPremium: boolean;
  expiresAt: string | null;
  productId: string | null;
  store: string | null;
  willRenew: boolean;
}

/**
 * Reads current entitlement state from the RevenueCat API. The webhook body
 * describes a single transition; the API describes the truth after it, which
 * is what should be persisted.
 */
async function fetchEntitlementState(
  appUserId: string,
  apiKey: string,
): Promise<EntitlementState | null> {
  const response = await fetch(
    `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(appUserId)}`,
    { headers: { Authorization: `Bearer ${apiKey}` } },
  );

  if (!response.ok) {
    logger.error('RevenueCat API lookup failed', {
      appUserId,
      status: response.status,
    });
    return null;
  }

  const body = (await response.json()) as {
    subscriber?: {
      entitlements?: Record<string, {
        expires_date?: string | null;
        product_identifier?: string;
      }>;
      subscriptions?: Record<string, {
        store?: string;
        unsubscribe_detected_at?: string | null;
        expires_date?: string | null;
      }>;
    };
  };

  const entitlement = body.subscriber?.entitlements?.[ENTITLEMENT_ID];
  if (!entitlement) {
    return { isPremium: false, expiresAt: null, productId: null, store: null, willRenew: false };
  }

  const expiresAt = entitlement.expires_date ?? null;
  // A null expiry means a lifetime/non-expiring grant.
  const isActive = expiresAt === null || new Date(expiresAt).getTime() > Date.now();
  const productId = entitlement.product_identifier ?? null;
  const subscription = productId ? body.subscriber?.subscriptions?.[productId] : undefined;

  return {
    isPremium: isActive,
    expiresAt,
    productId,
    store: subscription?.store ?? null,
    willRenew: isActive && !subscription?.unsubscribe_detected_at,
  };
}

/** Resolves which Firebase user document this event belongs to. */
async function resolveUserId(candidates: string[]): Promise<string | null> {
  const realIds = candidates.filter((id) => !isAnonymousId(id));

  for (const id of realIds) {
    const snapshot = await db.collection('users').doc(id).get();
    if (snapshot.exists) return id;
  }

  // No document yet - the purchase may have landed before the profile write.
  // Fall back to the first non-anonymous ID so entitlement is not dropped.
  return realIds[0] ?? null;
}

export const revenuecatWebhook = onRequest(
  { secrets: [WEBHOOK_SECRET, REVENUECAT_API_KEY], region: 'us-central1' },
  async (request, response) => {
    if (request.method !== 'POST') {
      response.status(405).send('Method Not Allowed');
      return;
    }

    const authHeader = request.get('Authorization') ?? '';
    if (!secretsMatch(authHeader, WEBHOOK_SECRET.value())) {
      logger.warn('Rejected webhook with bad Authorization header');
      response.status(401).send('Unauthorized');
      return;
    }

    const event: RevenueCatEvent = request.body?.event ?? {};
    const eventType = event.type ?? 'UNKNOWN';

    if (IGNORED_EVENT_TYPES.has(eventType)) {
      response.status(200).send('Ignored');
      return;
    }

    const candidates = candidateUserIds(event);
    if (candidates.length === 0) {
      logger.warn('Webhook carried no app user id', { eventType });
      // 200 so RevenueCat does not retry something that can never succeed.
      response.status(200).send('No user id');
      return;
    }

    try {
      const uid = await resolveUserId(candidates);
      if (!uid) {
        logger.info('Event belongs to an anonymous customer only; skipping', {
          eventType,
          candidates,
        });
        response.status(200).send('Anonymous only');
        return;
      }

      const state = await fetchEntitlementState(
        event.app_user_id ?? uid,
        REVENUECAT_API_KEY.value(),
      );

      if (!state) {
        // Transient upstream failure - 500 asks RevenueCat to retry.
        response.status(500).send('Lookup failed');
        return;
      }

      await db.collection('users').doc(uid).set(
        {
          entitlement: {
            ...state,
            lastEventType: eventType,
            updatedAt: FieldValue.serverTimestamp(),
          },
        },
        { merge: true },
      );

      logger.info('Entitlement synced', { uid, eventType, isPremium: state.isPremium });
      response.status(200).send('OK');
    } catch (error) {
      logger.error('Webhook processing failed', { eventType, error });
      response.status(500).send('Internal error');
    }
  },
);
