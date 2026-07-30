# Real IAP Implementation Complete ✅

## What I Just Did

### 1. Installed react-native-iap ✅
```bash
npm install react-native-iap
```

### 2. Updated src/services/iap.ts ✅
Replaced mock implementation with **real Apple/Google IAP**:
- ✅ Connects to App Store/Play Store
- ✅ Fetches real subscription products
- ✅ Processes actual purchases
- ✅ Handles restore purchases
- ✅ Fallback to mock data if store unavailable

## Next Steps: YOU NEED TO DO THESE

### Step 1: Rebuild Your Dev Client (REQUIRED)

Native libraries require a rebuild. Run this:

```bash
cd /d/Spanish/lengua
npx expo prebuild --clean
eas build --profile development --platform ios
```

This will take ~10-15 minutes. Once done, install the new dev build on your device.

### Step 2: Configure Products in App Store Connect (REQUIRED)

Your code is looking for these product IDs:
- `lengua_monthly` - Monthly subscription
- `lengua_annual` - Annual subscription

**How to Configure:**

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Select your app
3. Go to **Features** → **In-App Purchases**
4. Click **+** → **Auto-Renewable Subscription**
5. Create subscription group (e.g., "Premium")

**Product 1: Monthly**
- Reference Name: `Lengua Premium Monthly`
- Product ID: `lengua_monthly`
- Subscription Duration: 1 Month
- Price: $4.99 USD
- Free Trial: 7 days (optional)

**Product 2: Annual**
- Reference Name: `Lengua Premium Annual`
- Product ID: `lengua_annual`
- Subscription Duration: 1 Year
- Price: $29.99 USD
- Free Trial: 7 days (optional)

**Important:** You don't need to submit for review yet - products work in sandbox mode immediately.

### Step 3: Create Sandbox Test Account

1. Go to App Store Connect → **Users and Access** → **Sandbox Testers**
2. Click **+** to add tester
3. Create test Apple ID (e.g., `test@yourdomain.com`)
4. Remember the password

### Step 4: Test on Device

**After rebuilding and installing new dev client:**

1. **Sign out of App Store** on your device:
   - Settings → [Your Name] → Media & Purchases → Sign Out

2. **Launch your app**

3. **Complete 2 lessons** to trigger paywall

4. **Tap "Start 7-Day Free Trial"**

5. **Sign in with sandbox account** when prompted

6. **Complete purchase flow**

7. **Verify premium granted**

## What Happens Now

### Before Products Are Configured:
If you launch the app before configuring products in App Store Connect:
- ✅ Paywall will show fallback mock pricing
- ✅ App won't crash
- ⚠️ Purchase button will fail with "No products available"

### After Products Are Configured:
- ✅ Real pricing from App Store
- ✅ Real purchase flow
- ✅ Actual Apple subscriptions
- ✅ 7-day free trial (if configured)
- ✅ Sandbox testing (no real charges)

## Code Changes Made

### iap.ts - Now Uses Real IAP:
```typescript
// Initialize connection to store
await RNIap.initConnection();

// Fetch real products from App Store
const subscriptions = await RNIap.getSubscriptions({ skus });

// Process real purchase
const purchase = await RNIap.requestSubscription({ sku: productId });

// Restore real purchases
const purchases = await RNIap.getAvailablePurchases();
```

## Troubleshooting

### "No products found"
- Products not configured in App Store Connect
- Product IDs don't match
- App not signed with correct bundle ID

### "Cannot connect to iTunes Store"
- Need to rebuild dev client
- Wrong environment (needs sandbox account)
- Network issues

### "Purchase failed"
- Not signed out of real App Store
- Sandbox account not working
- Products in wrong state in App Store Connect

## Summary

✅ **Code Updated** - Real IAP implementation
⏳ **Need to Rebuild** - Native library requires rebuild
⏳ **Need to Configure** - Products in App Store Connect
⏳ **Need to Test** - With sandbox account

**Your next command:**
```bash
cd /d/Spanish/lengua
npx expo prebuild --clean
eas build --profile development --platform ios
```

Let me know when the build completes and I'll help you test!
