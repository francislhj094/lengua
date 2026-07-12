import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '../../../core/theme';
import { useAuthStore } from '../../../store/useAuthStore';
import { useNavigation } from '@react-navigation/native';
import { Settings, LogOut, CreditCard, ChevronRight } from 'lucide-react-native';
import { RevenueCatService } from '../../../services/revenuecat';

export const ProfileScreen = () => {
  const { user, setUser } = useAuthStore();
  const navigation = useNavigation<any>();

  const handleSignOut = () => {
    setUser(null);
    navigation.replace('Auth');
  };

  const handleRestore = async () => {
    await RevenueCatService.restorePurchases();
    alert('Purchases restored successfully!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        <View style={styles.userInfoCard}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{user?.displayName?.charAt(0) || 'L'}</Text>
          </View>
          <View style={styles.userInfoText}>
            <Text style={styles.userName}>{user?.displayName || 'Learner'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'Premium Member'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity style={styles.menuItem} onPress={handleRestore}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(78, 205, 196, 0.1)' }]}>
                <CreditCard color={theme.colors.accentSecondary} size={20} />
              </View>
              <Text style={styles.menuItemText}>Restore Purchases</Text>
            </View>
            <ChevronRight color={theme.colors.textSecondary} size={20} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
                <Settings color={theme.colors.textPrimary} size={20} />
              </View>
              <Text style={styles.menuItemText}>Preferences</Text>
            </View>
            <ChevronRight color={theme.colors.textSecondary} size={20} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <LogOut color={theme.colors.error} size={20} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

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
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.textPrimary,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
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
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surfaceDark,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.sm,
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
    fontFamily: theme.typography.fonts.headline,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textPrimary,
    fontWeight: '500',
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
