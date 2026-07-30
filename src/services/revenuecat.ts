import Purchases, { PurchasesPackage, CustomerInfo, LOG_LEVEL } from 'react-native-purchases';
import { Platform } from 'react-native';

// Fetch from Expo environment variables
const API_KEYS = {
  apple: process.env.EXPO_PUBLIC_RC_APPLE_KEY || '',
  google: process.env.EXPO_PUBLIC_RC_GOOGLE_KEY || '',
};

export class RevenueCatService {
  static async initialize() {
    try {
      console.log('[RevenueCat] Initializing SDK...');
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);

      const apiKey = Platform.OS === 'ios' ? API_KEYS.apple : API_KEYS.google;

      if (!apiKey) {
        console.error('[RevenueCat] API key is missing!', {
          platform: Platform.OS,
          hasAppleKey: !!API_KEYS.apple,
          hasGoogleKey: !!API_KEYS.google,
          env: process.env.EXPO_PUBLIC_RC_APPLE_KEY ? 'SET' : 'NOT SET',
        });
        // Don't throw - let the app continue without IAP
        console.warn('[RevenueCat] Continuing without RevenueCat - IAP will not work');
        return;
      }

      console.log('[RevenueCat] Configuring with API key:', apiKey.substring(0, 10) + '...');

      if (Platform.OS === 'ios') {
        Purchases.configure({ apiKey: API_KEYS.apple });
      } else if (Platform.OS === 'android') {
        Purchases.configure({ apiKey: API_KEYS.google });
      }

      console.log('[RevenueCat] SDK initialized successfully');
    } catch (error) {
      console.error('[RevenueCat] Initialization failed:', error);
      // Don't throw - let the app continue
      console.warn('[RevenueCat] Continuing without RevenueCat - IAP will not work');
    }
  }

  static async getOfferings() {
    try {
      console.log('[RevenueCat] Fetching offerings...');
      const offerings = await Purchases.getOfferings();

      console.log('[RevenueCat] Offerings response:', {
        hasCurrent: !!offerings.current,
        currentId: offerings.current?.identifier,
        packagesCount: offerings.current?.availablePackages?.length || 0,
        allOfferingsCount: Object.keys(offerings.all).length,
      });

      if (__DEV__) {
        console.log('[RevenueCat] Full offerings:', JSON.stringify(offerings, null, 2));
      }

      if (offerings.current !== null && offerings.current.availablePackages.length > 0) {
        console.log('[RevenueCat] Returning packages:', offerings.current.availablePackages.map(p => ({
          id: p.identifier,
          type: p.packageType,
          price: p.product.priceString,
        })));
        return offerings.current.availablePackages;
      } else {
        console.error('[RevenueCat] No current offering or packages available', {
          hasOfferings: Object.keys(offerings.all).length > 0,
          offeringIds: Object.keys(offerings.all),
        });
        return [];
      }
    } catch (e) {
      console.error('[RevenueCat] Error fetching offerings:', e);
      console.error('[RevenueCat] Error stack:', e instanceof Error ? e.stack : 'No stack');
      throw e;
    }
  }

  static async purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo | null> {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      return customerInfo;
    } catch (e: any) {
      if (!e.userCancelled) {
        console.error('Purchase failed:', e);
      }
    }
    return null;
  }

  static async checkPremiumStatus(): Promise<boolean> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      // "premium" is the entitlement identifier in RevenueCat dashboard
      return typeof customerInfo.entitlements.active['premium'] !== 'undefined';
    } catch (e) {
      console.error('Error checking premium status:', e);
      return false;
    }
  }

  static async restorePurchases(): Promise<CustomerInfo | null> {
    try {
      return await Purchases.restorePurchases();
    } catch (e) {
      console.error('Error restoring purchases:', e);
      return null;
    }
  }

  static async loginUser(uid: string): Promise<void> {
    try {
      await Purchases.logIn(uid);
    } catch (e) {
      console.error('Error logging into RevenueCat:', e);
    }
  }

  static async logout(): Promise<void> {
    try {
      await Purchases.logOut();
    } catch (e) {
      console.error('Error logging out of RevenueCat:', e);
    }
  }

  static async manageSubscription(): Promise<void> {
    try {
      if (Platform.OS === 'ios') {
        // Use RevenueCat's built-in manage subscriptions UI if available
        await Purchases.showManageSubscriptions();
      } else {
        // Google Play handles it via the deep link below
        await Purchases.showManageSubscriptions();
      }
    } catch (e) {
      console.error('Error opening subscription management:', e);
    }
  }
}
