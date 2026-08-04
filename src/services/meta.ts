import { AppState, Platform } from 'react-native';
import { AppEventsLogger, Settings } from 'react-native-fbsdk-next';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';

/**
 * iOS only presents the ATT prompt while the app is in the active state.
 * Asking while inactive resolves with the current status and never shows the
 * dialog, leaving permission "undetermined" for every user - which is what
 * Events Manager reports as "No Rate Displayed" for the ATE True Status Rate.
 *
 * Resolves on a timeout too, so a backgrounded launch can never hang init.
 */
function waitUntilActive(timeoutMs = 5000): Promise<void> {
  if (AppState.currentState === 'active') return Promise.resolve();

  return new Promise((resolve) => {
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      subscription.remove();
      clearTimeout(timer);
      resolve();
    };

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') finish();
    });
    const timer = setTimeout(finish, timeoutMs);
  });
}

/**
 * Meta (Facebook) attribution service.
 * Reports installs + subscription conversions back to Meta so ad campaigns
 * can be optimised against real revenue.
 */
export class MetaService {
  private static isInitialized = false;
  private static trackingAuthorized = false;

  /**
   * Requests ATT, then boots the SDK.
   *
   * app.json leaves isAutoInitEnabled/autoLogAppEventsEnabled off so that this
   * sequence owns the ordering end to end. The order below is load-bearing:
   * ATT has to resolve before the advertiser-tracking flag is set, and that
   * flag has to be set before initializeSDK(), or the SDK boots with the wrong
   * privacy state and the install is reported with no advertising identifier.
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      if (Platform.OS === 'ios') {
        // The dialog silently no-ops unless the app is active.
        await waitUntilActive();

        const { status } = await requestTrackingPermissionsAsync();
        this.trackingAuthorized = status === 'granted';
        console.log('[Meta] Tracking permission:', status, '| AppState', AppState.currentState);
      } else {
        this.trackingAuthorized = true;
      }

      // 1. Privacy state first.
      await Settings.setAdvertiserTrackingEnabled(this.trackingAuthorized);

      // 2. Then boot the SDK.
      Settings.initializeSDK();

      // 3. Auto-logging is disabled in app.json, so turn it on here - without
      //    this the SDK never emits the install event campaigns are counted on.
      Settings.setAutoLogAppEventsEnabled(true);

      this.isInitialized = true;
      console.log('[Meta] SDK initialized (tracking:', this.trackingAuthorized, ')');

      // 4. Belt and braces: fire the activation event explicitly.
      this.logAppOpen();
    } catch (error) {
      // Attribution must never block app start.
      console.error('[Meta] Initialization failed:', error);
    }
  }

  /**
   * `fb_mobile_activate_app` is the event Meta counts as an install/activation.
   * Auto-logging normally emits it, but sending it explicitly guarantees it
   * lands even if auto-logging is misconfigured on the dashboard side.
   */
  static logAppOpen(): void {
    try {
      AppEventsLogger.logEvent('fb_mobile_activate_app');
      AppEventsLogger.flush();
      console.log('[Meta] App activation logged');
    } catch (error) {
      console.error('[Meta] Failed to log app activation:', error);
    }
  }

  static isTrackingAuthorized(): boolean {
    return this.trackingAuthorized;
  }

  /**
   * Anonymous ID is what RevenueCat forwards to Meta so a subscription that
   * renews weeks later can still be tied back to the original campaign.
   */
  static async getAnonymousId(): Promise<string | null> {
    try {
      return await AppEventsLogger.getAnonymousID();
    } catch (error) {
      console.error('[Meta] Failed to read anonymous ID:', error);
      return null;
    }
  }

  static setUserId(uid: string | null): void {
    try {
      AppEventsLogger.setUserID(uid);
    } catch (error) {
      console.error('[Meta] Failed to set user ID:', error);
    }
  }

  static logPurchase(amount: number, currency: string, productId?: string): void {
    try {
      console.log('[Meta] Logging purchase:', amount, currency, productId);
      AppEventsLogger.logPurchase(amount, currency, productId ? { productId } : undefined);
    } catch (error) {
      console.error('[Meta] Failed to log purchase:', error);
    }
  }

  static logStartTrial(productId: string, amount: number, currency: string): void {
    try {
      console.log('[Meta] Logging trial start:', productId);
      AppEventsLogger.logEvent('StartTrial', {
        productId,
        currency,
        valueToSum: amount,
      });
    } catch (error) {
      console.error('[Meta] Failed to log trial start:', error);
    }
  }

  static logCompletedRegistration(method: string): void {
    try {
      AppEventsLogger.logEvent('CompleteRegistration', { registrationMethod: method });
    } catch (error) {
      console.error('[Meta] Failed to log registration:', error);
    }
  }

  static logViewedPaywall(): void {
    try {
      AppEventsLogger.logEvent('ViewContent', { contentType: 'paywall' });
    } catch (error) {
      console.error('[Meta] Failed to log paywall view:', error);
    }
  }

  /**
   * Fires once, when the user finishes their very first lesson.
   *
   * This is the campaign optimisation event. Purchase and StartTrial are too
   * sparse at low daily budgets to ever exit Meta's learning phase (~50 events
   * a week), whereas roughly half of installs reach lesson one - enough volume
   * to train on, while still filtering out installs that never opened the app.
   */
  static logCompleteTutorial(): void {
    try {
      AppEventsLogger.logEvent('CompleteTutorial', { contentType: 'lesson_1' });
      AppEventsLogger.flush();
      console.log('[Meta] First lesson completion logged');
    } catch (error) {
      console.error('[Meta] Failed to log tutorial completion:', error);
    }
  }

  /**
   * Plan selected on the paywall but not purchased - the mid-funnel signal
   * between ViewContent and StartTrial. Currently unwired; call from the
   * paywall's plan-select handler to fill the eighth AEM slot.
   */
  static logAddToCart(productId: string, amount: number, currency: string): void {
    try {
      AppEventsLogger.logEvent('AddToCart', {
        productId,
        currency,
        valueToSum: amount,
      });
    } catch (error) {
      console.error('[Meta] Failed to log plan selection:', error);
    }
  }

  static flush(): void {
    try {
      AppEventsLogger.flush();
    } catch (error) {
      console.error('[Meta] Failed to flush events:', error);
    }
  }
}
