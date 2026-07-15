import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Linking, Platform, StatusBar, Alert } from 'react-native';
import { theme } from '../../../core/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Zap, BookOpen, Plane, Mic, Globe, CheckCircle2 } from 'lucide-react-native';
import { RevenueCatService } from '../../../services/revenuecat';
import { useUserStore } from '../../../store/useUserStore';
import Animated, { FadeInDown, FadeInUp, FadeIn, withRepeat, withTiming, useSharedValue, useAnimatedStyle, withSequence } from 'react-native-reanimated';
import auth from '@react-native-firebase/auth';
import { useAuthStore } from '../../../store/useAuthStore';

const MOCK_PACKAGES = [
  { identifier: 'monthly', title: '1 Month', priceString: '$4.99', isPopular: false, period: '/mo', billingText: 'Billed monthly', rcPackage: null },
  { identifier: 'annual', title: '12 Months', priceString: '$29.99', isPopular: true, period: '/mo', badge: 'SAVE 50%', billingText: 'Billed yearly', rcPackage: null },
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
          billingText: p.packageType === 'ANNUAL' ? 'Billed yearly' : 'Billed monthly',
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
          // If the user skipped email, automatically register a ghost account for them so their purchase is saved to a cloud profile
          if (!auth().currentUser) {
            const userCredential = await auth().signInAnonymously();
            if (userCredential.user) {
              useAuthStore.getState().setUser({
                uid: userCredential.user.uid,
                email: null,
                displayName: 'Anonymous Learner',
              });
              await RevenueCatService.loginUser(userCredential.user.uid);
            }
          }
          setPremium(true);
          navigation.replace('Main');
        }
      } catch (e: any) {
        console.log('Purchase failed', e);
        Alert.alert('Purchase Failed', e.message || 'We could not process your purchase at this time.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
      Alert.alert('Error', 'Products failed to load. Please restart the app and try again.');
    }
  };

  const handleRestore = async () => {
    setIsLoading(true);
    try {
      const customerInfo = await RevenueCatService.restorePurchases();
      if (customerInfo && typeof customerInfo.entitlements.active['premium'] !== 'undefined') {
        setPremium(true);
        navigation.replace('Main');
      } else {
        Alert.alert('Restore Failed', 'No active subscription was found on this account.');
      }
    } catch (e: any) {
      console.log('Restore failed', e);
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
                      <Text 
                        style={[styles.priceText, isSelected && styles.priceTextSelected]} 
                        numberOfLines={1} 
                        adjustsFontSizeToFit
                      >
                        {pkg.priceString}
                      </Text>
                    </View>
                    <Text style={[styles.billingText, isSelected && styles.billingTextSelected]}>{pkg.billingText}</Text>
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
        <Animated.View entering={FadeInUp.duration(700).delay(450).springify()} style={styles.stickyFooter}>

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
  cancelText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 12,
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
