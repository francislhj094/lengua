import Purchases, { PurchasesPackage, CustomerInfo, LOG_LEVEL } from 'react-native-purchases';
import { Platform } from 'react-native';

// Fetch from Expo environment variables
const API_KEYS = {
  apple: process.env.EXPO_PUBLIC_RC_APPLE_KEY || '',
  google: process.env.EXPO_PUBLIC_RC_GOOGLE_KEY || '',
};

export class RevenueCatService {
  static async initialize() {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    
    if (Platform.OS === 'ios') {
      Purchases.configure({ apiKey: API_KEYS.apple });
    } else if (Platform.OS === 'android') {
      Purchases.configure({ apiKey: API_KEYS.google });
    }
  }

  static async getOfferings() {
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current !== null) {
        // Return available packages (e.g. Monthly, Annual, Lifetime)
        return offerings.current.availablePackages;
      }
    } catch (e) {
      console.error('Error fetching offerings:', e);
    }
    return [];
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
