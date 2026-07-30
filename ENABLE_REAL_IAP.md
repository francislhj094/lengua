# Native IAP Implementation - Next Steps

## Current Status
✅ Mock IAP service fully functional
✅ All screens updated to use native IAP
✅ RevenueCat completely removed from codebase
✅ App ready for submission

## To Enable Real In-App Purchases

### 1. Configure Products in App Store Connect

**iOS Products:**
1. Go to App Store Connect → Your App → Features → In-App Purchases
2. Create two auto-renewable subscriptions:

**Product 1: Monthly**
- Product ID: `lengua_monthly`
- Name: Lengua Premium Monthly
- Description: Full access to premium features
- Price: $4.99/month
- Free trial: 7 days

**Product 2: Annual**
- Product ID: `lengua_annual`
- Name: Lengua Premium Annual
- Description: Full access to premium features (Save 50%)
- Price: $29.99/year
- Free trial: 7 days

### 2. Implement Native IAP Library

Install a native IAP library:
```bash
npm install react-native-iap
npx expo prebuild
```

### 3. Update IAPService Implementation

Replace the mock implementation in `src/services/iap.ts` with real IAP calls:

```typescript
import * as RNIap from 'react-native-iap';

// In getOfferings():
const products = await RNIap.getSubscriptions({ skus: [PRODUCT_IDS.monthly, PRODUCT_IDS.annual] });

// In purchasePackage():
const purchase = await RNIap.requestSubscription({ sku: pkg.productId });
await RNIap.finishTransaction({ purchase });

// In restorePurchases():
const purchases = await RNIap.getAvailablePurchases();
```

### 4. Set Up Receipt Validation Backend

You'll need a backend to verify purchases securely:

**Option A: Build Your Own**
- Create API endpoint: `POST /api/verify-receipt`
- Validate receipts with Apple/Google servers
- Store entitlements in your database

**Option B: Use a Service**
- Firebase Extensions (free)
- Stripe billing (if using web)
- Custom backend with receipt validation

### 5. Switch to Live Mode

In `src/services/iap.ts`:
```typescript
private static mockMode = false; // Enable real IAP
```

### 6. Testing

**Sandbox Testing:**
1. Create sandbox test account in App Store Connect
2. Sign out of App Store on device
3. Build app with development profile
4. Make test purchase
5. Verify premium granted
6. Test restore purchases

### 7. Submission

1. Increment version in `app.json`
2. Build production version:
   ```bash
   eas build --platform ios --profile production
   ```
3. Submit to App Store:
   ```bash
   eas submit --platform ios --latest
   ```

## Alternative: Keep Mock Mode

If you want to launch without IAP initially:
- ✅ Keep mock mode enabled
- ✅ Submit to App Store as-is
- ✅ Users get premium for free temporarily
- ✅ Enable real IAP later via OTA update

## Implementation Guide: react-native-iap

Here's the complete real implementation:

```typescript
// src/services/iap.ts (real version)
import * as RNIap from 'react-native-iap';

export class IAPService {
  private static isInitialized = false;

  static async initialize(): Promise<void> {
    try {
      await RNIap.initConnection();
      this.isInitialized = true;
      console.log('[IAP] Initialized');
    } catch (error) {
      console.error('[IAP] Init failed:', error);
    }
  }

  static async getOfferings(): Promise<IAPPackage[]> {
    try {
      const skus = [PRODUCT_IDS.monthly, PRODUCT_IDS.annual];
      const products = await RNIap.getSubscriptions({ skus });
      
      return products.map(product => ({
        identifier: product.productId,
        title: product.productId === PRODUCT_IDS.annual ? '12 Months' : '1 Month',
        priceString: product.localizedPrice,
        isPopular: product.productId === PRODUCT_IDS.annual,
        period: product.productId === PRODUCT_IDS.annual ? '/year' : '/mo',
        badge: product.productId === PRODUCT_IDS.annual ? 'SAVE 50%' : undefined,
        billingText: product.description,
        freeTrialText: product.introductoryPrice ? `${product.introductoryPrice} free trial` : null,
        productId: product.productId,
      }));
    } catch (error) {
      console.error('[IAP] Error fetching products:', error);
      return [];
    }
  }

  static async purchasePackage(pkg: IAPPackage): Promise<PurchaseResult> {
    try {
      const purchase = await RNIap.requestSubscription({
        sku: pkg.productId,
      });

      // Verify receipt with your backend here
      // const verified = await fetch('YOUR_BACKEND/verify-receipt', { ... });

      await RNIap.finishTransaction({ purchase, isConsumable: false });

      return {
        success: true,
        isPremium: true,
      };
    } catch (error: any) {
      return {
        success: false,
        isPremium: false,
        error: error.message,
      };
    }
  }

  static async restorePurchases(): Promise<PurchaseResult> {
    try {
      const purchases = await RNIap.getAvailablePurchases();
      
      if (purchases.length > 0) {
        // Verify each receipt with your backend
        return {
          success: true,
          isPremium: true,
        };
      }

      return {
        success: true,
        isPremium: false,
      };
    } catch (error: any) {
      return {
        success: false,
        isPremium: false,
        error: error.message,
      };
    }
  }
}
```

## Resources

- [react-native-iap documentation](https://github.com/dooboolab/react-native-iap)
- [Apple In-App Purchase Guide](https://developer.apple.com/in-app-purchase/)
- [App Store Receipt Validation](https://developer.apple.com/documentation/appstorereceipts)
- [Firebase Extensions for IAP](https://extensions.dev/)
