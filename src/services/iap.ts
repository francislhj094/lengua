import { Platform } from 'react-native';
import Purchases, {
  PurchasesPackage,
  CustomerInfo,
  LOG_LEVEL,
} from 'react-native-purchases';
import { MetaService } from './meta';

const API_KEYS = {
  apple: process.env.EXPO_PUBLIC_RC_APPLE_KEY || '',
  google: process.env.EXPO_PUBLIC_RC_GOOGLE_KEY || '',
};

// Entitlement identifier configured in the RevenueCat dashboard.
const ENTITLEMENT_ID = 'premium';

const PERIOD_UNIT_LABELS: Record<string, string> = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year',
};

function periodUnitLabel(unit?: string): string {
  return PERIOD_UNIT_LABELS[String(unit).toUpperCase()] ?? 'day';
}

/** "7 days", "1 week" - for inline sentences. */
function formatDuration(count?: number, unit?: string): string {
  const n = count ?? 0;
  const label = periodUnitLabel(unit);
  return `${n} ${n === 1 ? label : `${label}s`}`;
}

/** "7-Day", "1-Week" - for title-cased button copy. */
function formatDurationTitle(count?: number, unit?: string): string {
  const label = periodUnitLabel(unit);
  return `${count ?? 0}-${label.charAt(0).toUpperCase()}${label.slice(1)}`;
}

export interface IAPPackage {
  identifier: string;
  title: string;
  priceString: string;
  isPopular: boolean;
  period: string;
  /** 'year' | 'month' - used to build billing copy. */
  periodLabel: string;
  badge?: string;
  billingText: string;
  freeTrialText?: string | null;
  /** e.g. "7-Day Free Trial". Null when the product has no free trial. */
  trialLabel?: string | null;
  /**
   * The full terms shown next to the CTA. Derived from what the store actually
   * returns rather than hardcoded, because this is a binding claim about what
   * the user will be charged.
   */
  priceDisclosure: string;
  productId: string;
  price?: number;
  currencyCode?: string;
}

export interface PurchaseResult {
  success: boolean;
  isPremium: boolean;
  error?: string;
}

/**
 * IAP service backed by RevenueCat.
 *
 * The public surface is deliberately unchanged from the previous
 * react-native-iap implementation so screens don't need to be touched.
 */
export class IAPService {
  private static isInitialized = false;

  /**
   * Live RevenueCat packages, keyed by identifier. purchasePackage() resolves
   * through this map, so a placeholder/mock package rendered by the paywall can
   * never reach the store - that mismatch is what produced the
   * "Products failed to load" error App Review hit.
   */
  private static packageCache = new Map<string, PurchasesPackage>();

  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    const apiKey = Platform.OS === 'ios' ? API_KEYS.apple : API_KEYS.google;

    if (!apiKey) {
      console.error(`[IAP] Missing RevenueCat API key for ${Platform.OS}`);
      throw new Error('RevenueCat API key is not configured');
    }

    try {
      console.log('[IAP] Configuring RevenueCat...');
      Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR);
      Purchases.configure({ apiKey });
      this.isInitialized = true;

      // Link RevenueCat to Meta so renewals are attributed to the original
      // campaign. Non-fatal: purchases still work without it.
      await this.refreshAttribution();

      console.log('[IAP] RevenueCat configured');
    } catch (error) {
      console.error('[IAP] Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * Pushes the Meta identifiers into RevenueCat. Run again after the ATT
   * prompt is granted, since the advertising identifier only becomes readable
   * at that point.
   */
  static async refreshAttribution(): Promise<void> {
    try {
      const anonymousId = await MetaService.getAnonymousId();
      if (anonymousId) {
        await Purchases.setFBAnonymousID(anonymousId);
      }
      if (MetaService.isTrackingAuthorized()) {
        await Purchases.collectDeviceIdentifiers();
      }
    } catch (error) {
      console.error('[IAP] Meta attribution setup failed:', error);
    }
  }

  static async getOfferings(): Promise<IAPPackage[]> {
    try {
      if (!this.isInitialized) await this.initialize();

      console.log('[IAP] Fetching offerings...');
      const offerings = await Purchases.getOfferings();
      const available = offerings.current?.availablePackages ?? [];

      console.log('[IAP] Package count:', available.length);

      if (available.length === 0) {
        console.warn('[IAP] No packages in current offering - check that the RevenueCat offering is marked Current and products are attached');
        return [];
      }

      this.packageCache.clear();

      const packages = available.map((pkg) => {
        this.packageCache.set(pkg.identifier, pkg);

        const { product } = pkg;
        const isAnnual = pkg.packageType === 'ANNUAL';
        const periodLabel = isAnnual ? 'year' : 'month';

        const intro = product.introPrice;
        // introPrice covers both free trials and paid introductory offers -
        // only a zero price is actually a free trial.
        const isFreeTrial = !!intro && intro.price === 0;
        const introDuration = intro
          ? formatDuration(intro.periodNumberOfUnits, intro.periodUnit)
          : null;

        return {
          identifier: pkg.identifier,
          title: isAnnual ? '12 Months' : '1 Month',
          priceString: product.priceString,
          isPopular: isAnnual,
          period: isAnnual ? '/year' : '/mo',
          periodLabel,
          billingText: isAnnual ? 'Billed yearly' : 'Billed monthly',
          freeTrialText: isFreeTrial && introDuration
            ? `${introDuration} free`
            : intro && introDuration
              ? `${intro.priceString} for ${introDuration}`
              : null,
          trialLabel: isFreeTrial && intro
            ? `${formatDurationTitle(intro.periodNumberOfUnits, intro.periodUnit)} Free Trial`
            : null,
          priceDisclosure: isFreeTrial && introDuration
            ? `Free for ${introDuration}, then ${product.priceString}/${periodLabel}`
            : intro && introDuration
              ? `${intro.priceString} for ${introDuration}, then ${product.priceString}/${periodLabel}`
              : `${product.priceString}/${periodLabel}`,
          productId: product.identifier,
          price: product.price,
          currencyCode: product.currencyCode,
        };
      });

      this.applySavingsBadge(packages);
      return packages;
    } catch (error) {
      console.error('[IAP] Error fetching offerings:', error);
      throw error;
    }
  }

  /**
   * Annual savings are calculated against the real monthly price rather than
   * asserted, so the badge stays truthful if prices change or a storefront
   * uses a different tier ratio. Mutates the annual package in place.
   */
  private static applySavingsBadge(packages: IAPPackage[]): void {
    const monthly = packages.find((p) => !p.isPopular);
    const annual = packages.find((p) => p.isPopular);

    if (!annual) return;

    // Comparing across currencies would be meaningless.
    const comparable =
      monthly?.price &&
      annual.price &&
      monthly.currencyCode === annual.currencyCode;

    if (!comparable) {
      annual.badge = undefined;
      return;
    }

    const percent = Math.round((1 - annual.price! / (monthly!.price! * 12)) * 100);
    annual.badge = percent > 0 ? `SAVE ${percent}%` : undefined;
  }

  static async purchasePackage(pkg: IAPPackage): Promise<PurchaseResult> {
    const rcPackage = this.packageCache.get(pkg.identifier);

    if (!rcPackage) {
      console.error('[IAP] No live RevenueCat package for identifier:', pkg.identifier);
      return {
        success: false,
        isPremium: false,
        error: 'This subscription is not available right now. Please try again in a moment.',
      };
    }

    try {
      console.log('[IAP] Purchasing:', rcPackage.product.identifier);
      const { customerInfo } = await Purchases.purchasePackage(rcPackage);
      const isPremium = this.hasEntitlement(customerInfo);

      if (isPremium) {
        const amount = rcPackage.product.price;
        const currency = rcPackage.product.currencyCode;

        if (rcPackage.product.introPrice) {
          MetaService.logStartTrial(rcPackage.product.identifier, amount, currency);
        } else {
          MetaService.logPurchase(amount, currency, rcPackage.product.identifier);
        }

        // Conversions are the events campaigns optimise against - send them
        // immediately rather than waiting on the SDK's batch timer.
        MetaService.flush();
      }

      return { success: true, isPremium };
    } catch (error: any) {
      if (error?.userCancelled) {
        console.log('[IAP] User cancelled purchase');
        return { success: false, isPremium: false, error: 'Purchase cancelled' };
      }

      console.error('[IAP] Purchase failed:', error);
      return {
        success: false,
        isPremium: false,
        error: error?.message || 'Purchase failed',
      };
    }
  }

  static async checkPremiumStatus(): Promise<boolean> {
    try {
      if (!this.isInitialized) await this.initialize();

      const customerInfo = await Purchases.getCustomerInfo();
      const isPremium = this.hasEntitlement(customerInfo);
      console.log('[IAP] Premium status:', isPremium);
      return isPremium;
    } catch (error) {
      console.error('[IAP] Error checking premium status:', error);
      return false;
    }
  }

  static async restorePurchases(): Promise<PurchaseResult> {
    try {
      if (!this.isInitialized) await this.initialize();

      console.log('[IAP] Restoring purchases...');
      const customerInfo = await Purchases.restorePurchases();
      return { success: true, isPremium: this.hasEntitlement(customerInfo) };
    } catch (error: any) {
      console.error('[IAP] Restore failed:', error);
      return {
        success: false,
        isPremium: false,
        error: error?.message || 'Restore failed',
      };
    }
  }

  static async loginUser(uid: string): Promise<void> {
    try {
      if (!this.isInitialized) await this.initialize();

      console.log('[IAP] Logging in RevenueCat user:', uid);
      await Purchases.logIn(uid);
      MetaService.setUserId(uid);
    } catch (error) {
      console.error('[IAP] Error logging in:', error);
    }
  }

  static async logout(): Promise<void> {
    try {
      if (!this.isInitialized) return;

      await Purchases.logOut();
      MetaService.setUserId(null);
      this.packageCache.clear();
      console.log('[IAP] Logged out');
    } catch (error) {
      console.error('[IAP] Error logging out:', error);
    }
  }

  static async manageSubscription(): Promise<void> {
    try {
      await Purchases.showManageSubscriptions();
    } catch (error) {
      console.error('[IAP] Error opening subscription management:', error);
    }
  }

  private static hasEntitlement(customerInfo: CustomerInfo): boolean {
    return typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
  }
}
