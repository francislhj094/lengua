# App Store Submission Checklist - Lengua

## Issues to Fix

### ❌ Issue 1: Products Failed to Load Error
Apple reviewer saw: "Products failed to load. Please restart the app and try again."

**Root Cause:** RevenueCat/StoreKit configuration issue

**Fix Required:**

#### 1. App Store Connect - In-App Purchases
Go to: App Store Connect → Lengua → Monetization → In-App Purchases

**Verify BOTH subscription products exist and are configured:**

- **Product 1: Monthly Subscription**
  - Product ID: `com.launchfast.lengua.monthly` (or similar)
  - Type: Auto-Renewable Subscription
  - Subscription Group: Create one if it doesn't exist (e.g., "Premium")
  - Price: $4.99/month
  - Free Trial: 7 days
  - Status: **Ready to Submit** or **Approved**
  - ✅ "Cleared for Sale" is ON

- **Product 2: Annual Subscription**
  - Product ID: `com.launchfast.lengua.annual` (or similar)
  - Type: Auto-Renewable Subscription
  - Subscription Group: Same as Monthly
  - Price: $29.99/year
  - Free Trial: 7 days
  - Status: **Ready to Submit** or **Approved**
  - ✅ "Cleared for Sale" is ON

**Important:** Both products MUST be submitted WITH the app binary (same submission).

#### 2. RevenueCat Dashboard Setup
Go to: https://app.revenuecat.com → Lengua Project

**Step 1: Verify Products**
- Projects → Lengua → Products
- Ensure BOTH products are added:
  - Monthly: `com.launchfast.lengua.monthly`
  - Annual: `com.launchfast.lengua.annual`
- Product IDs must EXACTLY match App Store Connect

**Step 2: Create Offering**
- Projects → Lengua → Offerings
- Create an offering called "default" (or any name)
- Add BOTH packages:
  - Package 1: Identifier = `$rc_monthly`, Product = monthly subscription
  - Package 2: Identifier = `$rc_annual`, Product = annual subscription
- Set this offering as **CURRENT**

**Step 3: Verify API Key**
- Settings → API Keys
- Copy the Apple API Key
- Should match `.env` file: `EXPO_PUBLIC_RC_APPLE_KEY=appl_AVdkjjDrANdQXdQmwFHhCVHVJNK` ✅

#### 3. Test in Sandbox
- Create sandbox test account in App Store Connect
- Sign out of real Apple ID on test device
- Sign in with sandbox account in Settings → App Store
- Open Lengua app
- Tap paywall
- Products should load (no error)
- Complete purchase flow
- Verify subscription activates

---

### ❌ Issue 2: Free Trial Disclosure Not Clear Enough
Apple says: "The app offers a free trial but does not make it clear that a payment will be automatically initiated."

**Fix Applied:** ✅
- Added prominent disclosure text: "Free for 7 days, then $4.99/month" (or $29.99/year)
- Text appears ABOVE the "Cancel anytime" message
- Font size increased to 15px, bold weight
- Shows BEFORE user taps the button

---

## Code Changes Made

### 1. ✅ PaywallScreen.tsx
- Added `isLoadingProducts` state to prevent premature error alerts
- Improved error handling with retry option
- Added clear trial disclosure: "Free for 7 days, then $X.XX/period"
- Made disclosure text larger and bolder (15px, 700 weight)

### 2. ✅ RevenueCat Service
- Improved error logging
- Better handling when no offerings available
- Re-throws errors for UI to handle

### 3. ✅ App Configuration
- Build number incremented to 2
- All lessons unlocked by default
- Developer tools hidden in production (`__DEV__` check)

---

## Testing Before Resubmission

### Local Testing (Required)
1. **Clean build:**
   ```bash
   cd d:\Spanish\lengua
   rm -rf node_modules ios/Pods
   npm install
   cd ios && pod install && cd ..
   ```

2. **Test on real iPad with sandbox account:**
   - Sign in with sandbox test account
   - Clear app data
   - Launch app
   - Navigate to paywall
   - **VERIFY:** Products load without error
   - **VERIFY:** Free trial text shows: "Free for 7 days, then $4.99/month"
   - Tap "Start 7-Day Free Trial"
   - Complete purchase
   - **VERIFY:** Premium unlocks

3. **Take screen recording:**
   - Record full purchase flow for App Review
   - Show products loading successfully
   - Show clear pricing disclosure
   - Show successful purchase

---

## Build & Submit

### 1. Build Production Version
```bash
cd d:\Spanish\lengua
eas build --platform ios --profile production
```

### 2. After Build Completes (~15-20 min)
```bash
eas submit --platform ios --latest
```

### 3. Reply to App Review
In App Store Connect, reply to the rejection message:

**Message Template:**
```
Hello,

Thank you for the feedback. I have resolved both issues:

1. IAP Products Loading Error:
   - Verified all In-App Purchase products are configured correctly
   - Tested purchase flow in sandbox environment
   - Attached screen recording showing successful purchase on iPad

2. Free Trial Disclosure:
   - Added clear disclosure text above the CTA button
   - Now shows: "Free for 7 days, then $4.99/month" (or $29.99/year)
   - Users can see pricing BEFORE tapping the purchase button

The new build (version 1.0, build 3) includes all fixes and has been tested on iPad Air 11-inch with iOS 26.5.2.

Please let me know if you need any additional information.

Best regards
```

Attach: Screen recording of successful purchase flow

---

## Common Issues & Solutions

### "Products failed to load" still appears
- ✅ Check App Store Connect: Both products are "Ready to Submit"
- ✅ Check RevenueCat: Offering is set as CURRENT
- ✅ Check Product IDs match exactly (case-sensitive)
- ✅ Verify Paid Apps Agreement is signed
- ✅ Test with NEW sandbox account (old ones can be buggy)

### RevenueCat returns empty offerings
- The offering must be set as "Current" in RevenueCat dashboard
- Products must be added to the offering as packages
- API key must have correct permissions

### Sandbox purchase doesn't work
- Make sure you're signed in with sandbox account in Settings → App Store
- Do NOT sign in inside the app
- Sandbox account must be created in App Store Connect (not a real Apple ID)

---

## Current Status

- ✅ Code fixed
- ✅ Build number incremented to 2
- ✅ Free trial disclosure added
- ⏳ Need to verify RevenueCat dashboard setup
- ⏳ Need to test in sandbox
- ⏳ Need to record screen for App Review
- ⏳ Ready to rebuild and resubmit

---

## Next Steps

1. **Go to RevenueCat dashboard** and verify offerings are configured
2. **Test in sandbox** with iPad + sandbox Apple ID
3. **Record successful purchase flow**
4. **Build new version:**
   ```bash
   eas build --platform ios --profile production
   ```
5. **Submit to App Store:**
   ```bash
   eas submit --platform ios --latest
   ```
6. **Reply to App Review** with screen recording
