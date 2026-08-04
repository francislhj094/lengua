import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Linking, Platform, StatusBar, Alert, useWindowDimensions } from 'react-native';
import { theme } from '../../../core/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Zap, BookOpen, Plane, Mic, Globe, CheckCircle2 } from 'lucide-react-native';
import { IAPService, IAPPackage } from '../../../services/iap';
import { MetaService } from '../../../services/meta';
import { useUserStore } from '../../../store/useUserStore';
import Animated, { FadeInDown, FadeInUp, FadeIn, withRepeat, withTiming, useSharedValue, useAnimatedStyle, withSequence } from 'react-native-reanimated';
import auth from '@react-native-firebase/auth';
import { useAuthStore } from '../../../store/useAuthStore';

// Placeholder rows so the paywall has structure while offerings load or after
// they fail. Prices are intentionally blank rather than invented - showing a
// hardcoded USD figure to a shopper in another storefront misstates the terms.
const MOCK_PACKAGES: IAPPackage[] = [
  { identifier: 'monthly', title: '1 Month', priceString: '—', isPopular: false, period: '/mo', periodLabel: 'month', billingText: 'Billed monthly', hasFreeTrial: false, priceDisclosure: '', productId: '' },
  { identifier: 'annual', title: '12 Months', priceString: '—', isPopular: true, period: '/year', periodLabel: 'year', billingText: 'Billed yearly', hasFreeTrial: false, priceDisclosure: '', productId: '' },
];

const FEATURES = [
  { text: 'Full A1–B2 grammar curriculum', icon: BookOpen, color: '#3b82f6' },
  { text: 'Offline mode for travel', icon: Plane, color: '#10b981' },
  { text: 'Advanced pronunciation coaching', icon: Mic, color: '#f59e0b' },
  { text: '500+ real-world cultural scenarios', icon: Globe, color: '#8b5cf6' }
];

export const PaywallScreen = ({ navigation }: any) => {
  const [packages, setPackages] = useState<IAPPackage[]>([]);
  const [selectedId, setSelectedId] = useState<string>('annual');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productsLoadError, setProductsLoadError] = useState<string | null>(null);
  const { setPremium } = useUserStore();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  // Pulse animation for the CTA button
  const pulseScale = useSharedValue(1);
  

  useEffect(() => {
    const loadProducts = async () => {
      try {
        console.log('[PaywallScreen] Loading IAP offerings...');
        const pkgs = await IAPService.getOfferings();
        console.log('[PaywallScreen] Received packages:', pkgs?.length || 0);

        if (!pkgs || pkgs.length === 0) {
          console.error('[PaywallScreen] No packages returned from IAP');
          setIsLoadingProducts(false);
          setProductsLoadError('No products available');
          setPackages(MOCK_PACKAGES);
          return;
        }

        setPackages(pkgs);
        const annual = pkgs.find((p: IAPPackage) => p.isPopular);
        if (annual) setSelectedId(annual.identifier);
        setIsLoadingProducts(false);
        setProductsLoadError(null);
        console.log('[PaywallScreen] Successfully loaded products');
      } catch (error: any) {
        console.error('[PaywallScreen] Error loading IAP offerings:', error);
        setIsLoadingProducts(false);
        setProductsLoadError(error?.message || 'Failed to load products');
        setPackages(MOCK_PACKAGES);
      }
    };

    loadProducts();

    // Mid-funnel signal: without it Meta only sees installs and purchases, and
    // campaigns can't optimise against paywall reach.
    MetaService.logViewedPaywall();

    // Start subtle pulse animation
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1, // infinite
      true
    );
  }, []);

  const animatedButtonProps = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }]
  }));

  const selectedPackage = packages.find(p => p.identifier === selectedId);

  const ctaLabel = isLoadingProducts
    ? 'Loading...'
    : isLoading
      ? 'Processing...'
      : selectedPackage?.trialLabel
        ? `Start ${selectedPackage.trialLabel}`
        : 'Continue';

  /**
   * Guarantees the session has a stable user ID that RevenueCat is logged in
   * as. Users who skipped email get a Firebase anonymous account so their
   * purchase still lands on a durable cloud profile.
   */
  const ensureIdentified = async (): Promise<void> => {
    if (auth().currentUser) return;

    const userCredential = await auth().signInAnonymously();
    if (!userCredential.user) return;

    useAuthStore.getState().setUser({
      uid: userCredential.user.uid,
      email: null,
      displayName: 'Anonymous Learner',
    });
    await IAPService.loginUser(userCredential.user.uid);
  };

  const handlePurchase = async () => {
    if (isLoadingProducts || productsLoadError) {
      Alert.alert(
        'Products Not Available',
        productsLoadError || 'Subscription products are still loading. Please wait a moment and try again.',
        [{ text: 'OK' }]
      );
      return;
    }

    const selectedPackage = packages.find(p => p.identifier === selectedId);

    if (!selectedPackage) {
      console.error('[PaywallScreen] Attempted purchase without valid package');
      Alert.alert(
        'Product Not Available',
        'The selected subscription product is not available. This may be a configuration issue.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsLoading(true);

    try {
      // Identity must exist before the transaction, not after. Purchasing while
      // anonymous attributes the receipt to a throwaway RevenueCat user that
      // then has to be aliased, which splits one customer across two IDs and
      // makes webhook reconciliation unreliable.
      await ensureIdentified();

      const result = await IAPService.purchasePackage(selectedPackage);

      if (result.success && result.isPremium) {
        setPremium(true);
        navigation.replace('Main');
      } else {
        Alert.alert('Purchase Failed', result.error || 'We could not process your purchase at this time.');
      }
    } catch (e: any) {
      console.error('Purchase failed', e);
      Alert.alert('Purchase Failed', e.message || 'We could not process your purchase at this time.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    setIsLoading(true);
    try {
      const result = await IAPService.restorePurchases();
      if (result.success && result.isPremium) {
        setPremium(true);
        navigation.replace('Main');
      } else {
        Alert.alert('Restore Failed', 'No active subscription was found on this account.');
      }
    } catch (e: any) {
      console.error('Restore failed', e);
      Alert.alert('Restore Failed', e.message || 'We could not restore your purchases at this time.');
    } finally {
      setIsLoading(false);
    }
  };

  const openTerms = () => Linking.openURL('https://lengua.store/terms');
  const openPrivacy = () => Linking.openURL('https://lengua.store/privacy');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Premium Background Elements */}
      <View style={styles.backgroundGlow} />
      <View style={styles.backgroundGlow2} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            isTablet && styles.scrollContentTablet
          ]}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          
          {/* Top Bar */}
          <Animated.View entering={FadeIn.duration(400)} style={styles.topRow}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.replace('Main')}
              hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
            >
              <X color={theme.colors.textPrimary} size={24} />
            </TouchableOpacity>
          </Animated.View>

          {/* Hero Section */}
          <Animated.View entering={FadeInDown.duration(700).springify()} style={styles.header}>
            <Text style={styles.title}>Unlock Fluent Spanish</Text>
            <Text style={styles.subtitle}>Master the language faster with unlimited access to premium tools.</Text>
          </Animated.View>

          {/* Dynamic Feature List */}
          <Animated.View entering={FadeInUp.duration(700).delay(100).springify()} style={styles.featuresContainer}>
            {FEATURES.map((feat, i) => (
              <View key={i} style={styles.featureItem}>
                <View style={[styles.iconBox, { backgroundColor: `${feat.color}20` }]}>
                  <feat.icon size={20} color={feat.color} strokeWidth={2.5} />
                </View>
                <Text style={styles.featureText}>{feat.text}</Text>
              </View>
            ))}
          </Animated.View>

          {/* Pricing Cards */}
          <Animated.View entering={FadeInDown.duration(700).delay(300).springify()} style={styles.plansContainer}>
            {productsLoadError && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>⚠️ Products unavailable</Text>
                <TouchableOpacity
                  onPress={() => {
                    setIsLoadingProducts(true);
                    setProductsLoadError(null);
                    const loadProducts = async () => {
                      try {
                        const pkgs = await IAPService.getOfferings();
                        setPackages(pkgs);
                        setIsLoadingProducts(false);
                        setProductsLoadError(null);
                      } catch (error: any) {
                        setIsLoadingProducts(false);
                        setProductsLoadError(error?.message || 'Failed to load products');
                      }
                    };
                    loadProducts();
                  }}
                  style={styles.retryButton}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}
            {packages.map((pkg) => {
              const isSelected = selectedId === pkg.identifier;
              
              return (
                <TouchableOpacity
                  key={pkg.identifier}
                  activeOpacity={0.9}
                  onPress={() => setSelectedId(pkg.identifier)}
                  style={[
                    styles.planCard,
                    isSelected && styles.planCardSelected
                  ]}
                >
                  <LinearGradient
                    colors={isSelected ? ['rgba(193, 39, 45, 0.05)', 'rgba(193, 39, 45, 0.02)'] : [theme.colors.surfaceDark, theme.colors.surfaceDark]}
                    style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
                  />
                  {pkg.isPopular && (
                    <LinearGradient
                      colors={['#FF416C', '#FF4B2B']}
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 0}}
                      style={styles.popularBadge}
                    >
                      <Text style={styles.popularText}>{pkg.badge}</Text>
                    </LinearGradient>
                  )}
                    <Text style={[styles.durationText, isSelected && styles.planTitleSelected]}>
                      {pkg.title}
                    </Text>
                    <View style={styles.priceRow}>
                      <Text
                        style={[styles.priceText, isSelected && styles.priceTextSelected]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                      >
                        {pkg.priceString}
                      </Text>
                    </View>
                    <Text style={[styles.billingText, isSelected && styles.billingTextSelected]}>{pkg.billingText}</Text>
                    {pkg.freeTrialText && (
                      <Text style={[styles.freeTrialText, isSelected && styles.freeTrialTextSelected]}>
                        {pkg.freeTrialText}
                      </Text>
                    )}
                    {isSelected && (
                      <View style={styles.selectionCheck}>
                        <CheckCircle2 color={theme.colors.accentPrimary} size={20} fill="#FFF" />
                      </View>
                    )}
                  </TouchableOpacity>
              );
            })}
          </Animated.View>

        </ScrollView>

        {/* STICKY CTA FOOTER (Now true flexbox at bottom) */}
        <Animated.View entering={FadeInUp.duration(700).delay(450).springify()} style={[styles.stickyFooter, isTablet && styles.stickyFooterTablet]}>

          <View style={[styles.stickyFooterContent, isTablet && styles.stickyFooterContentTablet]}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handlePurchase}
              disabled={isLoading || isLoadingProducts}
              style={{ width: '100%' }}
            >
              <Animated.View style={[styles.mainButtonContainer, animatedButtonProps, (isLoading || isLoadingProducts) && { opacity: 0.7 }]}>
                <LinearGradient
                  colors={['#FFC043', theme.colors.accentPrimary]}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.mainButtonGradient}
                >
                  <Zap size={20} color={theme.colors.primaryDark} fill={theme.colors.primaryDark} style={{marginRight: 6}} />
                  <Text style={styles.mainButtonText}>
                    {ctaLabel}
                  </Text>
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>

            {!!selectedPackage?.priceDisclosure && (
              <Text style={styles.trialDisclosure}>
                {selectedPackage.priceDisclosure}
              </Text>
            )}
            <Text style={styles.cancelSubtext}>Cancel anytime. Secure checkout.</Text>
            
            <View style={styles.footerLinks}>
              <TouchableOpacity onPress={handleRestore}>
                <Text style={styles.footerLinkText}>Restore</Text>
              </TouchableOpacity>
              <Text style={styles.footerDot}> • </Text>
              <TouchableOpacity onPress={openTerms}>
                <Text style={styles.footerLinkText}>Terms of Use (EULA)</Text>
              </TouchableOpacity>
              <Text style={styles.footerDot}> • </Text>
              <TouchableOpacity onPress={openPrivacy}>
                <Text style={styles.footerLinkText}>Privacy Policy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  backgroundGlow: {
    position: 'absolute',
    top: -200,
    left: -100,
    width: 600,
    height: 600,
    backgroundColor: 'rgba(193, 39, 45, 0.04)',
    borderRadius: 300,
  },
  backgroundGlow2: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 400,
    height: 400,
    backgroundColor: 'rgba(232, 176, 89, 0.05)',
    borderRadius: 200,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    paddingBottom: 24,
    justifyContent: 'space-between', // Spreads content nicely to remove ugly gaps
  },
  scrollContentTablet: {
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  topRow: {
    marginBottom: 4,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignSelf: 'flex-end',
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: 28,
    color: theme.colors.textPrimary,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: theme.spacing.sm,
  },
  featuresContainer: {
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    marginBottom: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  plansContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 0,
    paddingHorizontal: 4,
  },
  planCard: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.04)',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  planCardSelected: {
    borderColor: theme.colors.accentPrimary,
    backgroundColor: '#FFF9F9',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowColor: theme.colors.accentPrimary,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 0,
    shadowColor: theme.colors.accentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  popularText: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: 11,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  durationText: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  planTitleSelected: {
    color: theme.colors.accentPrimary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  priceText: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: 28,
    color: theme.colors.textPrimary,
    fontWeight: '900',
    letterSpacing: -1,
    textAlign: 'center',
  },
  priceTextSelected: {
    color: theme.colors.accentPrimary,
  },
  billingText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  billingTextSelected: {
    color: theme.colors.accentPrimary,
    opacity: 0.9,
    fontWeight: '600',
  },
  selectionCheck: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  stickyFooter: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    paddingTop: 8,
    alignItems: 'center',
    backgroundColor: '#FAFAFA', // Matches container background
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.03)',
  },
  stickyFooterTablet: {
    paddingHorizontal: 32,
  },
  stickyFooterContent: {
    width: '100%',
    alignItems: 'center',
  },
  stickyFooterContentTablet: {
    maxWidth: 600,
    width: '100%',
  },
  mainButtonContainer: {
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  mainButtonGradient: {
    flexDirection: 'row',
    height: 54, // Compressed button
    borderRadius: 27, // Fully rounded
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  mainButtonText: {
    color: theme.colors.primaryDark,
    fontFamily: theme.typography.fonts.headline,
    fontSize: 16,
    fontWeight: '900',
  },
  freeTrialText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '600',
  },
  freeTrialTextSelected: {
    color: theme.colors.accentPrimary,
    fontWeight: '700',
  },
  trialDisclosure: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 15,
    color: theme.colors.textPrimary,
    marginTop: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  cancelText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 13,
    color: theme.colors.textPrimary,
    marginTop: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelSubtext: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 4,
    marginBottom: 8,
    fontWeight: '500',
    textAlign: 'center',
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLinkText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  footerDot: {
    color: theme.colors.textSecondary,
    marginHorizontal: 8,
  },
  errorBanner: {
    width: '100%',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 13,
    color: '#991B1B',
    fontWeight: '600',
    flex: 1,
  },
  retryButton: {
    backgroundColor: '#991B1B',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  retryButtonText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 12,
    color: '#FFF',
    fontWeight: '700',
  },
});
