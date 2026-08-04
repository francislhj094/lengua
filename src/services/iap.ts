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

export interface IAPPackage {
  identifier: string;
  title: string;
  priceString: string;
  isPopular: boolean;
  period: string;
  badge?: string;
  billingText: string;
  freeTrialText?: string | null;
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

      return available.map((pkg) => {
        this.packageCache.set(pkg.identifier, pkg);

        const { product } = pkg;
        const isAnnual = pkg.packageType === 'ANNUAL';

        return {
          identifier: pkg.identifier,
          title: isAnnual ? '12 Months' : '1 Month',
          priceString: product.priceString,
          isPopular: isAnnual,
          period: isAnnual ? '/year' : '/mo',
          badge: isAnnual ? 'SAVE 50%' : undefined,
          billingText: isAnnual ? 'Billed yearly' : 'Billed monthly',
          freeTrialText: this.describeTrial(product),
          productId: product.identifier,
          price: product.price,
          currencyCode: product.currencyCode,
        };
      });
    } catch (error) {
      console.error('[IAP] Error fetching offerings:', error);
      throw error;
    }
  }

  private static describeTrial(product: PurchasesPackage['product']): string | null {
    const intro = product.introPrice;
    if (!intro) return null;

    const unit = intro.periodUnit?.toLowerCase() ?? 'day';
    const count = intro.periodNumberOfUnits ?? 0;
    const plural = count === 1 ? unit : `${unit}s`;

    return `${count} ${plural} free, then ${product.priceString}`;
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
