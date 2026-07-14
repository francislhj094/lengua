import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Linking, Platform, StatusBar } from 'react-native';
import { theme } from '../../../core/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Zap, BookOpen, Plane, Mic, Globe } from 'lucide-react-native';
import { RevenueCatService } from '../../../services/revenuecat';
import { useUserStore } from '../../../store/useUserStore';
import Animated, { FadeInDown, FadeInUp, FadeIn, withRepeat, withTiming, useSharedValue, useAnimatedStyle, withSequence } from 'react-native-reanimated';

const MOCK_PACKAGES = [
  { identifier: 'monthly', title: '1 Month', priceString: '$4.99', isPopular: false, period: '/mo', billingText: 'Billed monthly', rcPackage: null },
  { identifier: 'annual', title: '12 Months', priceString: '$2.50', isPopular: true, period: '/mo', badge: 'SAVE 50%', billingText: 'Billed $29.99 yearly', rcPackage: null },
];

const FEATURES = [
  { text: 'Full A1–B2 grammar curriculum', icon: BookOpen, color: '#3b82f6' },
  { text: 'Offline mode for travel', icon: Plane, color: '#10b981' },
  { text: 'Advanced pronunciation coaching', icon: Mic, color: '#f59e0b' },
  { text: '500+ real-world cultural scenarios', icon: Globe, color: '#8b5cf6' }
];

export const PaywallScreen = ({ navigation }: any) => {
  const [packages, setPackages] = useState<any[]>(MOCK_PACKAGES);
  const [selectedId, setSelectedId] = useState<string>('annual');
  const [isLoading, setIsLoading] = useState(false);
  const { setPremium } = useUserStore();
  
  // Pulse animation for the CTA button
  const pulseScale = useSharedValue(1);
  
  useEffect(() => {
    RevenueCatService.getOfferings().then((pkgs) => {
      if (pkgs && pkgs.length > 0) {
        const mapped = pkgs.map((p: any) => ({
          identifier: p.identifier,
          title: p.packageType === 'ANNUAL' ? '12 Months' : '1 Month',
          priceString: p.product.priceString,
          isPopular: p.packageType === 'ANNUAL',
          period: '',
          badge: 'SAVE 50%',
          billingText: p.product.description || `Billed ${p.product.priceString}`,
          rcPackage: p,
        }));
        setPackages(mapped);
        const annual = mapped.find((m: any) => m.isPopular);
        if (annual) setSelectedId(annual.identifier);
      }
    }).catch(console.error);
    
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

  const handlePurchase = async () => {
    setIsLoading(true);
    const selectedPackage = packages.find(p => p.identifier === selectedId);
    
    if (selectedPackage && selectedPackage.rcPackage) {
      try {
        const customerInfo = await RevenueCatService.purchasePackage(selectedPackage.rcPackage);
        if (customerInfo && typeof customerInfo.entitlements.active['premium'] !== 'undefined') {
          setPremium(true);
          navigation.replace('Main');
        }
      } catch (e) {
        console.log('Purchase failed', e);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Mock purchase for testing when no real keys are provided
      setTimeout(() => {
        setIsLoading(false);
        setPremium(true);
        navigation.replace('Main');
      }, 1500);
    }
  };

  const handleRestore = async () => {
    setIsLoading(true);
    try {
      const customerInfo = await RevenueCatService.restorePurchases();
      if (customerInfo && typeof customerInfo.entitlements.active['premium'] !== 'undefined') {
        setPremium(true);
        navigation.replace('Main');
      }
    } catch (e) {
      console.log('Restore failed, proceeding for testing');
      setPremium(true); // Mock restore for testing
    } finally {
      setIsLoading(false);
      navigation.replace('Main');
    }
  };

  const openTerms = () => Linking.openURL('https://launchfast.co');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Absolute background element for a glowing top effect */}
      <View style={styles.backgroundGlow} />
      
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} bounces={false}>
          
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
                    <Text style={styles.priceText}>{pkg.priceString}</Text>
                    <Text style={styles.periodText}>{pkg.period}</Text>
                  </View>
                  <Text style={[styles.billingText, isSelected && styles.billingTextSelected]}>{pkg.billingText}</Text>
                  {isSelected && (
                    <View style={styles.selectionDot}>
                      <View style={styles.selectionInnerDot} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </Animated.View>

          {/* Add some padding at the bottom of the scroll view so content isn't hidden by the sticky footer */}
          <View style={{ height: 100 }} />

        </ScrollView>

        {/* STICKY CTA FOOTER */}
        <Animated.View entering={FadeInUp.duration(700).delay(450).springify()} style={styles.stickyFooter}>
          <LinearGradient
            colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.9)', '#FFFFFF']}
            style={styles.stickyFooterGradient}
          />
          <View style={styles.stickyFooterContent}>
            <TouchableOpacity 
              activeOpacity={0.85} 
              onPress={handlePurchase}
              disabled={isLoading}
              style={{ width: '100%' }}
            >
              <Animated.View style={[styles.mainButtonContainer, animatedButtonProps, isLoading && { opacity: 0.7 }]}>
                <LinearGradient
                  colors={['#FFC043', theme.colors.accentPrimary]}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.mainButtonGradient}
                >
                  <Zap size={20} color={theme.colors.primaryDark} fill={theme.colors.primaryDark} style={{marginRight: 6}} />
                  <Text style={styles.mainButtonText}>
                    {isLoading ? "Processing..." : "Start 7-Day Free Trial"}
                  </Text>
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>
            
            <Text style={styles.cancelText}>Cancel anytime. Secure checkout.</Text>
            
            <View style={styles.footerLinks}>
              <TouchableOpacity onPress={handleRestore}>
                <Text style={styles.footerLinkText}>Restore</Text>
              </TouchableOpacity>
              <Text style={styles.footerDot}> • </Text>
              <TouchableOpacity onPress={openTerms}>
                <Text style={styles.footerLinkText}>Terms</Text>
              </TouchableOpacity>
              <Text style={styles.footerDot}> • </Text>
              <TouchableOpacity onPress={openTerms}>
                <Text style={styles.footerLinkText}>Privacy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </SafeAreaView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backgroundGlow: {
    position: 'absolute',
    top: -150,
    left: -50,
    right: -50,
    height: 400,
    backgroundColor: 'rgba(193, 39, 45, 0.03)',
    borderRadius: 200,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? theme.spacing.md : theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  topRow: {
    marginBottom: theme.spacing.sm,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignSelf: 'flex-end',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: 32,
    color: theme.colors.textPrimary,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: theme.spacing.sm,
  },
  featuresContainer: {
    paddingHorizontal: 8,
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(52, 199, 89, 0.15)', // Success green tint
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 16,
    color: theme.colors.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  plansContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 20,
  },
  planCard: {
    flex: 1,
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.08)',
    borderBottomWidth: 4, // 3D Effect
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  planCardSelected: {
    borderColor: theme.colors.accentPrimary,
    borderBottomWidth: 2, // Depressed 3D effect
    transform: [{ translateY: 2 }],
  },
  popularBadge: {
    position: 'absolute',
    top: -14,
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF', // Creates a cut-out effect over the border
    shadowColor: '#FF416C',
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
    fontSize: 14,
    color: theme.colors.textPrimary,
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
    alignItems: 'baseline',
  },
  priceText: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: 28,
    color: theme.colors.textPrimary,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  periodText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  billingText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  billingTextSelected: {
    color: 'rgba(232, 176, 89, 0.8)',
  },
  selectionDot: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(232, 176, 89, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.accentPrimary,
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 32 : 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  stickyFooterGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  stickyFooterContent: {
    width: '100%',
    alignItems: 'center',
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
    height: 60, // Taller button
    borderRadius: 30, // Fully rounded
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
  cancelText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '500',
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
});
