# RevenueCat Setup Checklist for App Store Review

## Issue
App rejected with error: "Products failed to load. Please restart the app and try again."

## Root Causes Fixed

### 1. Environment Variables in Production Builds ✅
- **Problem**: `.env` file only works in local development, not in EAS production builds
- **Fix**: Added `EXPO_PUBLIC_RC_APPLE_KEY` to `eas.json` production build config
- **File**: `eas.json` line 36-38

### 2. Purchase Button Active Without Valid Products ✅
- **Problem**: Users could tap purchase button even when products failed to load
- **Fix**: Added validation to block purchases when `productsLoadError` is set
- **File**: `src/features/paywall/screens/PaywallScreen.tsx` line 105-120

### 3. Missing Error Logging ✅
- **Problem**: No visibility into why products were failing to load
- **Fix**: Added comprehensive logging throughout RevenueCat service and paywall
- **Files**: 
  - `src/services/revenuecat.ts` (all methods)
  - `src/features/paywall/screens/PaywallScreen.tsx` (loadProducts)

### 4. Visual Feedback for Errors ✅
- **Problem**: Users saw generic "Products failed to load" dialog
- **Fix**: Added error banner with retry button directly in the UI
- **File**: `src/features/paywall/screens/PaywallScreen.tsx` line 213-223

## RevenueCat Dashboard Configuration Checklist

⚠️ **CRITICAL**: Verify these settings in your RevenueCat dashboard

### Step 1: Verify Entitlements
1. Log in to [RevenueCat Dashboard](https://app.revenuecat.com)
2. Go to your project → **Entitlements**
3. Confirm you have an entitlement with identifier: **`premium`**
4. This must match the code in `src/services/revenuecat.ts` line 57

### Step 2: Verify Products
1. Go to **Products** tab
2. Confirm you have added your App Store Connect products:
   - Monthly subscription product ID
   - Annual subscription product ID
3. Product IDs must **exactly match** what's in App Store Connect

### Step 3: Verify Offerings
1. Go to **Offerings** tab
2. You must have a **current offering** (marked with star)
3. The current offering should contain:
   - **Monthly** package (packageType: MONTHLY)
   - **Annual** package (packageType: ANNUAL)
4. Each package must be:
   - Attached to the correct product
   - Attached to the `premium` entitlement

### Step 4: Verify App Configuration
1. Go to **Apps** → Select your iOS app
2. Verify:
   - Bundle ID matches: `com.launchfast.lengua`
   - App Store Connect integration is enabled
   - Sandbox testing is enabled

## App Store Connect Configuration Checklist

### Step 1: Verify In-App Purchases Created
1. Log in to [App Store Connect](https://appstoreconnect.apple.com)
2. Go to your app → **Monetization** → **Subscriptions**
3. Verify subscription group exists: **Lengua Premium**
4. Verify both subscriptions exist:
   - **Monthly Plan**
   - **Yearly Plan**

### Step 2: Verify Subscription Status
1. Each subscription must be in **"Ready to Submit"** or **"Waiting for Review"** status
2. Required metadata for each:
   - ✅ Subscription Display Name
   - ✅ Description
   - ✅ Pricing
   - ✅ App Store Screenshot (showing the subscription in your app)

### Step 3: Submit Subscriptions with App
1. When submitting a new app version, you must:
   - Check the box to submit subscriptions for review
   - Provide screenshots showing the paywall in your app
2. Subscriptions are rejected WITH the app version they're attached to

### Step 4: Verify Paid Apps Agreement
1. Go to **Agreements, Tax, and Banking**
2. Verify **Paid Apps Agreement** is:
   - ✅ Active
   - ✅ Signed by Account Holder
3. If not active, subscriptions cannot be tested in Sandbox

## Testing in Sandbox

### Before Submitting to App Review:

1. **Create a Sandbox Test Account**:
   - App Store Connect → Users and Access → Sandbox Testers
   - Create a new test account with a unique email

2. **Test on Physical Device**:
   ```bash
   # Build a TestFlight or development build
   eas build --profile preview --platform ios
   ```

3. **Sign Out of Real Apple ID**:
   - Settings → App Store → Sign Out
   - Do NOT sign in with sandbox account here

4. **Launch Your App**:
   - Navigate to paywall
   - Tap "Start 7-Day Free Trial"
   - When prompted, sign in with sandbox test account

5. **Verify**:
   - ✅ Products load (no error)
   - ✅ Purchase completes
   - ✅ Premium features unlock
   - ✅ Restore purchases works

## Common Failure Scenarios

### Scenario 1: No Products Load
**Symptoms**: Error banner shows "⚠️ Products unavailable"

**Logs to check**:
```
[RevenueCat] Offerings response: {
  hasCurrent: false,
  packagesCount: 0
}
```

**Solution**:
- No "current offering" in RevenueCat dashboard
- Go to Offerings tab → mark an offering as current (star icon)

### Scenario 2: Products Load But Purchase Fails
**Symptoms**: Products show prices, but tapping purchase shows error

**Logs to check**:
```
[RevenueCat] Error fetching offerings: [error message]
```

**Solution**:
- Product IDs don't match between RevenueCat and App Store Connect
- Verify product IDs are identical in both systems

### Scenario 3: Environment Variable Not Found
**Symptoms**: App crashes or shows "API key not configured" in logs

**Logs to check**:
```
[RevenueCat] API key is missing!
```

**Solution**:
- For local dev: Add to `.env` file
- For EAS builds: Add to `eas.json` env section (already done)

## Build and Submit Commands

### 1. Increment Build Number
```bash
# Edit app.json and increment ios.buildNumber
# Current: 4 → Next: 5
```

### 2. Build for Production
```bash
eas build --profile production --platform ios
```

### 3. Test in TestFlight First (Recommended)
```bash
# Submit to TestFlight
eas submit --profile production --platform ios --latest

# Wait for TestFlight processing
# Install and test the exact build that will go to review
```

### 4. Submit to App Review
- Go to App Store Connect
- Select the build from TestFlight
- Click "Submit for Review"
- **IMPORTANT**: Check the box to include In-App Purchases

## Debug Logs for App Review Response

If still rejected, check these logs:

1. **RevenueCat initialization**:
```
[RevenueCat] Initializing SDK...
[RevenueCat] Configuring with API key: appl_AVdkj...
[RevenueCat] SDK initialized successfully
```

2. **Offerings fetch**:
```
[RevenueCat] Fetching offerings...
[RevenueCat] Offerings response: {
  hasCurrent: true,
  currentId: "default",
  packagesCount: 2
}
```

3. **Products loaded**:
```
[PaywallScreen] Successfully loaded products
```

If any of these logs show errors, that's your issue.

## Support Resources

- RevenueCat Docs: https://www.revenuecat.com/docs
- App Store Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- RevenueCat Community: https://community.revenuecat.com/
- File a ticket with RevenueCat support if offerings aren't loading

## Next Steps

1. ✅ Code changes complete
2. ⚠️ Verify RevenueCat dashboard configuration (all steps above)
3. ⚠️ Test in sandbox with physical device
4. ⚠️ Increment build number to 5
5. ⚠️ Build production IPA with `eas build`
6. ⚠️ Test in TestFlight before submitting
7. ⚠️ Submit to App Review with IAPs checked
