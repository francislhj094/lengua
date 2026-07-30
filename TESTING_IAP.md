# Testing Native IAP Without RevenueCat

## Current Status
✅ RevenueCat completely removed
✅ Mock IAP service active
✅ No rebuild needed for current testing

## Testing Options

### Option 1: Test Mock Mode (RIGHT NOW - No Rebuild)
Your current implementation works **immediately** without rebuilding:

**What You Can Test:**
✅ Paywall appears after 2 free lessons
✅ Pricing displays correctly ($4.99/month, $29.99/year)
✅ Plan selection works
✅ Purchase button functionality
✅ Premium access granted instantly
✅ Profile shows "Premium Active"
✅ Restore purchases UI
✅ Navigation flows

**How to Test:**
1. Open your Expo dev client (already running)
2. Reload the app (shake device → Reload)
3. Complete 2 lessons
4. See paywall appear
5. Tap "Start 7-Day Free Trial"
6. Premium granted instantly (mock)

**This is perfect for:**
- Testing UI/UX
- Testing navigation flows
- Demo to stakeholders
- App Store submission

---

### Option 2: Test Real IAP (REQUIRES REBUILD)

To test **actual Apple/Google subscriptions**, you need:

#### Step 1: Install react-native-iap
```bash
cd /d/Spanish/lengua
npm install react-native-iap
```

#### Step 2: Rebuild Dev Client
```bash
npx expo prebuild --clean
eas build --profile development --platform ios
# Install the new dev build on your device
```

#### Step 3: Update src/services/iap.ts

Replace the mock implementation with real IAP calls using `react-native-iap`:

```typescript
import * as RNIap from 'react-native-iap';

static async initialize(): Promise<void> {
  await RNIap.initConnection();
}

static async getOfferings(): Promise<IAPPackage[]> {
  const skus = ['lengua_monthly', 'lengua_annual'];
  const products = await RNIap.getSubscriptions({ skus });
  return products.map(p => ({
    identifier: p.productId,
    title: p.productId.includes('annual') ? '12 Months' : '1 Month',
    priceString: p.localizedPrice,
    // ... map other fields
  }));
}

static async purchasePackage(pkg: IAPPackage): Promise<PurchaseResult> {
  const purchase = await RNIap.requestSubscription({ sku: pkg.productId });
  await RNIap.finishTransaction({ purchase, isConsumable: false });
  return { success: true, isPremium: true };
}
```

#### Step 4: Configure Products in App Store Connect
1. Go to App Store Connect
2. Create subscriptions: `lengua_monthly`, `lengua_annual`
3. Set pricing: $4.99/month, $29.99/year
4. Add 7-day free trial
5. Save (no need to submit for review yet)

#### Step 5: Test with Sandbox Account
1. Sign out of App Store on device
2. Launch your app
3. Make test purchase
4. Sign in with sandbox tester account
5. Complete purchase flow

---

## My Recommendation

### For Now: Test Mock Mode ✅
**You don't need to rebuild** to verify your paywall works properly. The mock mode lets you test:
- All UI elements
- Navigation flows
- User experience
- Purchase button behavior
- Premium access granting
- Restore functionality

### After App Store Approval: Add Real IAP
Once Apple approves your app with mock mode:
1. Install `react-native-iap`
2. Rebuild with real IAP implementation
3. Configure products in App Store Connect
4. Test with sandbox account
5. Submit update

---

## What to Test Right Now (No Rebuild)

1. **Open your running Expo dev client**
2. **Complete 2 lessons** to trigger paywall
3. **Check paywall displays correctly**
   - Two pricing options shown
   - Monthly: $4.99/mo
   - Annual: $29.99/year (with "SAVE 50%" badge)
   - "Start 7-Day Free Trial" button

4. **Test purchase flow**
   - Select monthly plan
   - Tap purchase button
   - Should grant premium instantly (mock)
   - No actual charge occurs

5. **Check premium features**
   - Navigate to Profile
   - Should show "Premium Active"
   - Subscription management available

6. **Test restore purchases**
   - Tap "Restore Purchases" in Profile
   - Should show "No purchases found" (expected in mock)

7. **Test paywall navigation**
   - Try to access lesson 3
   - Should redirect to paywall

---

## Summary

**Your app is already testable without rebuilding.**

The current mock implementation:
- ✅ Shows real pricing
- ✅ Grants premium access
- ✅ Works for App Store submission
- ✅ No actual charges
- ✅ Perfect for testing UI/UX

**You only need to rebuild when you want real Apple/Google IAP.**

Want me to help you test the mock mode right now? Or do you want to proceed with adding real IAP (which requires rebuild)?
