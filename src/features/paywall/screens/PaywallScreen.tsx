import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, Linking } from 'react-native';
import { theme } from '../../../core/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, X } from 'lucide-react-native';
import { RevenueCatService } from '../../../services/revenuecat';
import { PurchasesPackage } from 'react-native-purchases';
import { Button } from '../../../components/Button';

// MOCK_PLANS removed for live integration

export const PaywallScreen = ({ navigation }: any) => {
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);

  useEffect(() => {
    const loadOfferings = async () => {
      const pkgs = await RevenueCatService.getOfferings();
      if (pkgs.length > 0) {
        setPackages(pkgs);
        // Default to annual or first package
        setSelectedPackage(pkgs.find(p => p.identifier.includes('annual')) || pkgs[0]);
      }
    };
    loadOfferings();
  }, []);

  const handlePurchase = async () => {
    if (!selectedPackage) return;
    setIsLoading(true);
    
    try {
      const customerInfo = await RevenueCatService.purchasePackage(selectedPackage);
      if (customerInfo && typeof customerInfo.entitlements.active['premium'] !== 'undefined') {
        navigation.replace('Main');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    setIsLoading(true);
    const customerInfo = await RevenueCatService.restorePurchases();
    setIsLoading(false);
    if (customerInfo && typeof customerInfo.entitlements.active['premium'] !== 'undefined') {
      navigation.replace('Main');
    }
  };

  const handleClose = () => {
    navigation.replace('Main');
  };

  const openTerms = () => {
    Linking.openURL('https://launchfast.co');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <X color={theme.colors.textSecondary} size={24} />
        </TouchableOpacity>

        {/* Header */}
        <Text style={styles.headline}>🇪🇸 Unlock Fluent Spanish</Text>
        <Text style={styles.subheadline}>Your AI tutor is ready.</Text>

        {/* Feature List */}
        <View style={styles.featureList}>
          {['Unlimited AI conversations', 'Full A1–B2 curriculum', 'Offline mode for travel', 'Pronunciation coaching', '500+ cultural scenarios'].map((feature, i) => (
            <View key={i} style={styles.featureItem}>
              <View style={styles.checkIcon}>
                <Check size={14} color={theme.colors.success} />
              </View>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {/* Plans */}
        <View style={styles.plansContainer}>
          {packages.length === 0 ? (
            <ActivityIndicator color={theme.colors.accentPrimary} style={{margin: 20}} />
          ) : (
            packages.map((pkg) => {
              const isSelected = selectedPackage?.identifier === pkg.identifier;
              const isPopular = pkg.identifier.toLowerCase().includes('annual');
              
              return (
                <TouchableOpacity
                  key={pkg.identifier}
                  activeOpacity={0.9}
                  onPress={() => setSelectedPackage(pkg)}
                  style={[styles.planCard, isSelected && styles.planCardSelected, { flex: 1, minHeight: 120, marginHorizontal: 4 }]}
                >
                  {isPopular && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularText}>★ Popular</Text>
                    </View>
                  )}
                  <Text style={[styles.planTitle, isSelected && styles.planTitleSelected]}>
                    {pkg.product.title.split(' ')[0]} 
                  </Text>
                  <Text style={styles.planPrice}>{pkg.product.priceString}</Text>
                  {isPopular && <Text style={styles.planSubtitle}>SAVE 50%</Text>}
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* CTA */}
        <View style={styles.ctaContainer}>
          <Button 
            title={isLoading ? "Processing..." : "✨ Start 7-Day Free Trial"} 
            onPress={handlePurchase}
            disabled={isLoading || !selectedPackage}
          />
        </View>

        {/* Footer */}
        <Text style={styles.socialProof}>"12,000+ learners trust Lengua"</Text>
        <View style={styles.footerLinks}>
          <TouchableOpacity onPress={handleRestore}>
            <Text style={styles.footerLinkText}>Restore Purchases</Text>
          </TouchableOpacity>
          <Text style={styles.footerDot}> • </Text>
          <TouchableOpacity onPress={openTerms}>
            <Text style={styles.footerLinkText}>Terms</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primaryDark,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  closeButton: {
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  headline: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: theme.typography.sizes.xl + 4,
    color: theme.colors.textPrimary,
    fontWeight: '700',
    marginBottom: 4,
  },
  subheadline: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
  },
  featureList: {
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(123, 198, 126, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  featureText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textPrimary,
  },
  plansContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  planCard: {
    flex: 1,
    backgroundColor: theme.colors.surfaceDark,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  planCardSelected: {
    borderColor: theme.colors.accentPrimary,
    backgroundColor: 'rgba(232, 176, 89, 0.05)',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    backgroundColor: theme.colors.accentPrimary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  popularText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.primaryDark,
  },
  planTitle: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
  },
  planTitleSelected: {
    color: theme.colors.accentPrimary,
  },
  planPrice: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textPrimary,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  planSubtitle: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 11,
    color: theme.colors.success,
    fontWeight: '600',
    textAlign: 'center',
  },
  reframingContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  reframingText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  ctaContainer: {
    marginBottom: theme.spacing.xl,
  },
  socialProof: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLinkText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 12,
    color: theme.colors.textSecondary,
    textDecorationLine: 'underline',
  },
  footerDot: {
    color: theme.colors.textSecondary,
    marginHorizontal: theme.spacing.sm,
  },
});
