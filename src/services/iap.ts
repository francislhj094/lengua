import { Platform } from 'react-native';
import * as RNIap from 'react-native-iap';
import {
  Product,
  ProductPurchase,
  PurchaseError,
  ProductSubscription,
} from 'react-native-iap';

// Product IDs from App Store Connect / Google Play Console
const PRODUCT_IDS = {
  monthly: Platform.OS === 'ios' ? 'lengua.premium.monthly' : 'lengua.premium.monthly',
  annual: Platform.OS === 'ios' ? 'lengua.premium.yearly' : 'lengua.premium.yearly',
};

const skus = [PRODUCT_IDS.monthly, PRODUCT_IDS.annual];

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
}

export interface PurchaseResult {
  success: boolean;
  isPremium: boolean;
  error?: string;
}

/**
 * Native IAP Service using react-native-iap
 * Connects directly to Apple App Store / Google Play Store
 */
export class IAPService {
  private static isInitialized = false;

  static async initialize(): Promise<void> {
    try {
      console.log('[IAP] Initializing connection to store...');
      await RNIap.initConnection();
      this.isInitialized = true;
      console.log('[IAP] Successfully connected to store');

      // Set up purchase listener
      RNIap.purchaseUpdatedListener((purchase: ProductPurchase) => {
        console.log('[IAP] Purchase updated:', purchase);
      });

      RNIap.purchaseErrorListener((error: PurchaseError) => {
        console.warn('[IAP] Purchase error:', error);
      });
    } catch (error) {
      console.error('[IAP] Failed to initialize:', error);
      throw error;
    }
  }

  static async getOfferings(): Promise<IAPPackage[]> {
    try {
      console.log('[IAP] Fetching subscriptions from store...');

      if (!this.isInitialized) {
        try {
          await this.initialize();
        } catch (initError) {
          console.warn('[IAP] Store not available, using mock data');
          return this.getMockOfferings();
        }
      }

      // Use fetchProducts with subscription type in v15+
      const result = await RNIap.fetchProducts({
        skus,
        type: 'subscription',
      });

      console.log('[IAP] Received products:', result);
      const products = result.products || [];
      console.log('[IAP] Product count:', products.length);

      if (products.length === 0) {
        console.warn('[IAP] No subscriptions found - check App Store Connect configuration');
        return this.getMockOfferings();
      }

      const packages: IAPPackage[] = products.map((product: ProductSubscription) => {
        const isAnnual =
          product.productId.toLowerCase().includes('yearly') ||
          product.productId.toLowerCase().includes('annual') ||
          product.productId.toLowerCase().includes('year');

        return {
          identifier: product.productId,
          title: isAnnual ? '12 Months' : '1 Month',
          priceString: product.localizedPrice || '$0.00',
          isPopular: isAnnual,
          period: isAnnual ? '/year' : '/mo',
          badge: isAnnual ? 'SAVE 50%' : undefined,
          billingText: product.description || (isAnnual ? 'Billed yearly' : 'Billed monthly'),
          freeTrialText: product.introductoryPrice
            ? `${product.introductoryPrice} free trial`
            : null,
          productId: product.productId,
        };
      });

      console.log('[IAP] Mapped packages:', packages);
      return packages;
    } catch (error) {
      console.error('[IAP] Error fetching offerings:', error);
      throw error;
    }
  }

  static async purchasePackage(pkg: IAPPackage): Promise<PurchaseResult> {
    try {
      console.log('[IAP] Requesting purchase for:', pkg.productId);

      await RNIap.requestPurchase({
        request: {
          apple: { sku: pkg.productId },
          google: { skus: [pkg.productId] },
        },
        type: 'subscription',
      });

      console.log('[IAP] Purchase request sent');

      // The purchase will be handled by the listener
      // Return success immediately
      return {
        success: true,
        isPremium: true,
      };
    } catch (error: any) {
      // User cancelled purchase
      if (error.code === 'E_USER_CANCELLED') {
        console.log('[IAP] User cancelled purchase');
        return {
          success: false,
          isPremium: false,
          error: 'Purchase cancelled',
        };
      }

      console.error('[IAP] Purchase failed:', error);
      return {
        success: false,
        isPremium: false,
        error: error.message || 'Purchase failed',
      };
    }
  }

  static async checkPremiumStatus(): Promise<boolean> {
    try {
      console.log('[IAP] Checking premium status...');

      const purchases = await RNIap.getAvailablePurchases();
      console.log('[IAP] Found', purchases.length, 'purchases');

      // Check if any of our subscription products are in the purchases
      const hasPremium = purchases.some(
        (purchase) =>
          purchase.productId === PRODUCT_IDS.monthly ||
          purchase.productId === PRODUCT_IDS.annual
      );

      console.log('[IAP] Premium status:', hasPremium);
      return hasPremium;
    } catch (error) {
      console.error('[IAP] Error checking premium status:', error);
      return false;
    }
  }

  static async restorePurchases(): Promise<PurchaseResult> {
    try {
      console.log('[IAP] Restoring purchases...');

      const purchases = await RNIap.getAvailablePurchases();
      console.log('[IAP] Restored', purchases.length, 'purchases');

      // Check if any of our subscription products are in the restored purchases
      const hasPremium = purchases.some(
        (purchase) =>
          purchase.productId === PRODUCT_IDS.monthly ||
          purchase.productId === PRODUCT_IDS.annual
      );

      return {
        success: true,
        isPremium: hasPremium,
      };
    } catch (error: any) {
      console.error('[IAP] Restore failed:', error);
      return {
        success: false,
        isPremium: false,
        error: error.message || 'Restore failed',
      };
    }
  }

  static async loginUser(uid: string): Promise<void> {
    console.log('[IAP] User login:', uid);
    // Store user ID if needed for backend receipt validation
  }

  static async logout(): Promise<void> {
    console.log('[IAP] User logout');
    // Clear any cached purchase data if needed
  }

  static async manageSubscription(): Promise<void> {
    try {
      console.log('[IAP] Opening subscription management...');

      if (Platform.OS === 'ios') {
        // iOS: Open App Store subscription settings
        const { Linking } = require('react-native');
        await Linking.openURL('https://apps.apple.com/account/subscriptions');
      } else {
        // For Android, you'd typically open the Play Store subscriptions page
        const { Linking } = require('react-native');
        await Linking.openURL('https://play.google.com/store/account/subscriptions');
      }
    } catch (error) {
      console.error('[IAP] Error opening subscription management:', error);
    }
  }

  static async endConnection(): Promise<void> {
    try {
      await RNIap.endConnection();
      this.isInitialized = false;
      console.log('[IAP] Connection closed');
    } catch (error) {
      console.error('[IAP] Error closing connection:', error);
    }
  }

  private static getMockOfferings(): IAPPackage[] {
    console.log('[IAP] Using mock offerings');
    return [
      {
        identifier: PRODUCT_IDS.monthly,
        title: '1 Month',
        priceString: '$4.99',
        isPopular: false,
        period: '/mo',
        billingText: 'Billed monthly',
        freeTrialText: '7-day free trial',
        productId: PRODUCT_IDS.monthly,
      },
      {
        identifier: PRODUCT_IDS.annual,
        title: '12 Months',
        priceString: '$29.99',
        isPopular: true,
        period: '/year',
        badge: 'SAVE 50%',
        billingText: 'Billed yearly',
        freeTrialText: '7-day free trial',
        productId: PRODUCT_IDS.annual,
      },
    ];
  }
}
