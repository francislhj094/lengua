import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { theme } from '../../../core/theme';
import { useAuthStore } from '../../../store/useAuthStore';
import { useUserStore } from '../../../store/useUserStore';
import { useNavigation } from '@react-navigation/native';
import { Settings, LogOut, CreditCard, ChevronRight, Crown, Globe } from 'lucide-react-native';
import { RevenueCatService } from '../../../services/revenuecat';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const AnimatedMenuItem = ({ icon, title, subtitle, onPress, delay = 0, isPremium = false }: any) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeInDown.duration(500).delay(delay).springify()} style={animatedStyle}>
      <Pressable 
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.8 }]}
      >
        <View style={styles.menuItemLeft}>
          <View style={[styles.iconBox, { backgroundColor: isPremium ? 'rgba(241, 196, 15, 0.2)' : 'rgba(0,0,0,0.05)' }]}>
            {icon}
          </View>
          <View>
            <Text style={styles.menuItemText}>{title}</Text>
            {subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
          </View>
        </View>
        <ChevronRight color={theme.colors.textSecondary} size={20} />
      </Pressable>
    </Animated.View>
  );
};

export const ProfileScreen = () => {
  const { user, setUser } = useAuthStore();
  const { isPremium, dialect, setDialect } = useUserStore();
  const navigation = useNavigation<any>();

  const handleSignOut = async () => {
    await RevenueCatService.logout();
    setUser(null);
    navigation.replace('Auth');
  };

  const handleRestore = async () => {
    await RevenueCatService.restorePurchases();
    alert('Purchases restored successfully!');
  };

  const handleManageSubscription = async () => {
    await RevenueCatService.manageSubscription();
  };

  const toggleDialect = () => {
    setDialect(dialect === 'spain' ? 'latin_american' : 'spain');
  };

  return (
    <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <Animated.View entering={FadeInDown.duration(500).springify()} style={styles.header}>
            <Text style={styles.title}>Profile</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(500).delay(100).springify()} style={styles.userInfoCard}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{user?.displayName?.charAt(0) || 'L'}</Text>
            </View>
            <View style={styles.userInfoText}>
              <Text style={styles.userName}>{user?.displayName || 'Learner'}</Text>
              <Text style={styles.email}>{user?.email || (isPremium ? 'Premium Member' : 'Free Member')}</Text>
            </View>
          </Animated.View>

          <View style={styles.section}>
            <Animated.Text entering={FadeInDown.duration(500).delay(200).springify()} style={styles.sectionTitle}>
              Account & Settings
            </Animated.Text>
            
            <AnimatedMenuItem 
              icon={<Crown color={isPremium ? '#F1C40F' : theme.colors.textSecondary} size={20} />}
              title="Subscription"
              subtitle={isPremium ? "Premium Active" : "Upgrade to Premium"}
              onPress={() => isPremium ? handleManageSubscription() : navigation.navigate('Paywall')}
              delay={300}
              isPremium={isPremium}
            />

            <AnimatedMenuItem 
              icon={<Globe color={theme.colors.accentPrimary} size={20} />}
              title="Dialect"
              subtitle={dialect === 'spain' ? "Spain 🇪🇸" : "Latin America 🌎"}
              onPress={toggleDialect}
              delay={400}
            />
            
            <AnimatedMenuItem 
              icon={<CreditCard color={theme.colors.accentSecondary} size={20} />}
              title="Restore Purchases"
              onPress={handleRestore}
              delay={500}
            />
          </View>

          <Animated.View entering={FadeInDown.duration(500).delay(600).springify()}>
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <LogOut color={theme.colors.error} size={20} />
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </Animated.View>

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
  header: {
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.md,
  },
  title: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
  userInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceDark,
    padding: theme.spacing.xl,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.xxl,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.lg,
  },
  avatarText: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: theme.typography.sizes.xl,
    color: '#000000',
    fontWeight: '700',
  },
  userInfoText: {
    flex: 1,
  },
  userName: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  email: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 16,
  },
  section: {
    marginBottom: theme.spacing.xxl,
  },
  sectionTitle: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.surfaceDark,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'space-between',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  menuItemText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 16,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  menuItemSubtitle: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
    backgroundColor: 'rgba(232, 93, 117, 0.1)',
    borderRadius: theme.radius.md,
    gap: theme.spacing.sm,
  },
  signOutText: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.error,
    fontWeight: '600',
  },
});
