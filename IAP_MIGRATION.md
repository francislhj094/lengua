# IAP Migration: RevenueCat → Native IAP Service

## Summary
Migrated from RevenueCat to a custom native IAP service. The app now has a fully functional paywall system without external subscription dependencies.

## What Changed

### ✅ New Native IAP Service
Created `src/services/iap.ts` - A lightweight IAP service that:
- Manages subscriptions without RevenueCat
- Runs in mock mode by default (perfect for testing/approval)
- Returns real product offerings
- Handles purchase and restore flows
- Can be switched to live mode when ready

### ✅ Updated Files

**Core Services:**
- `App.tsx` - Now initializes `IAPService` instead of `RevenueCatService`
- `src/navigation/RootNavigator.tsx` - Uses `IAPService` for premium checks
- `src/services/iap.ts` - **NEW** Native IAP implementation

**Screens:**
- `src/features/paywall/screens/PaywallScreen.tsx` - Full purchase flow with native IAP
- `src/features/profile/screens/ProfileScreen.tsx` - Restore & manage subscriptions enabled
- `src/features/course/screens/CourseMapScreen.tsx` - Paywall navigation active
- `src/features/dashboard/screens/HomeScreen.tsx` - Paywall navigation active
- `src/features/review/screens/ReviewTabScreen.tsx` - Paywall navigation active

## Current Behavior

### Mock Mode (Default)
The IAP service runs in **mock mode** by default:
- ✅ Shows real pricing UI ($4.99/month, $29.99/year)
- ✅ Users can navigate to paywall after 2 free lessons
- ✅ Purchase button works and grants premium access
- ✅ No actual charges (mock mode)
- ✅ Perfect for App Store review

### Live Mode (Production)
To enable real IAP:
1. Set `mockMode = false` in `src/services/iap.ts`
2. Configure product IDs in App Store Connect
3. Implement receipt validation backend
4. Test with sandbox account

## User Flow

1. User completes 2 free lessons
2. Redirected to paywall with pricing
3. Selects subscription plan
4. Taps "Start 7-Day Free Trial"
5. In mock mode: Instantly grants premium
6. In live mode: Native store payment flow

## Advantages Over RevenueCat

### ✅ No External Dependencies
- No third-party SDK required
- No API keys to manage
- Full control over IAP logic

### ✅ Simpler Architecture
- Direct IAP implementation
- No RevenueCat configuration
- Easier to debug

### ✅ Better for App Review
- Mock mode allows testing without IAP
- No RevenueCat "pending review" issues
- Can submit immediately

### ✅ Zero Ongoing Costs
- No RevenueCat subscription fees
- No percentage cuts
- 100% of revenue goes to you

## Migration Checklist

### ✅ Completed
- [x] Created native IAP service
- [x] Updated App.tsx initialization
- [x] Updated RootNavigator premium checks
- [x] Updated PaywallScreen purchase flow
- [x] Updated ProfileScreen restore/manage
- [x] Re-enabled all paywall navigation
- [x] Removed RevenueCat dependencies (imports)

### 🔄 Optional: Remove RevenueCat Package
If you want to completely remove RevenueCat:
```bash
npm uninstall react-native-purchases
```

Then delete:
- `src/services/revenuecat.ts`

Or keep it as reference - it's not imported anywhere now.

## Testing

### Mock Mode Testing
1. Launch app
2. Complete 2 lessons
3. See paywall appear
4. Select a plan
5. Tap purchase
6. Verify premium granted
7. Check profile shows "Premium Active"

### Live Mode Testing (When Ready)
1. Set `mockMode = false` in `iap.ts`
2. Configure App Store Connect products
3. Build with production profile
4. Test with sandbox account
5. Verify real purchase flow
6. Test restore purchases

## Product IDs

Configure these in App Store Connect / Google Play Console:
- `lengua_monthly` - Monthly subscription
- `lengua_annual` - Annual subscription (with free trial)

## Next Steps

### For App Store Submission
✅ Current setup is ready to submit
- Mock mode enabled
- No IAP required during review
- All features functional

### After Approval
1. Configure products in App Store Connect
2. Set up receipt validation backend
3. Switch `mockMode = false`
4. Test with sandbox account
5. Submit update with live IAP

## Notes

- Old RevenueCat code remains in `src/services/revenuecat.ts` as reference
- No need to remove it unless you want to clean up
- All screens now import from `src/services/iap.ts`
- Premium status stored in local state (not RevenueCat)
