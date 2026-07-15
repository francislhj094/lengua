import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, Alert } from 'react-native';
import { theme } from '../../../core/theme';
import { Mail, Check, ShieldCheck } from 'lucide-react-native';
import { Button } from '../../../components/Button';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import auth from '@react-native-firebase/auth';
import { useUserStore } from '../../../store/useUserStore';
import { RevenueCatService } from '../../../services/revenuecat';

export const AuthScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const { setHasOnboarded } = useUserStore();

  const handleAuth = async () => {
    if (!email) return;
    setIsLoading(true);
    
    // The user requested no magic link and no password field.
    // We use a deterministic password so they can log back in if they reinstall.
    const password = email.toLowerCase().trim() + '_LenguaAuth2026!';

    try {
      try {
        const userCredential = await auth().signInWithEmailAndPassword(email.trim(), password);
        if (userCredential.user) {
          await RevenueCatService.loginUser(userCredential.user.uid);
        }
      } catch (signInError: any) {
        if (
          signInError.code === 'auth/user-not-found' || 
          signInError.code === 'auth/invalid-credential' || 
          signInError.code === 'auth/invalid-login-credentials' ||
          signInError.code === 'auth/wrong-password'
        ) {
          const userCredential = await auth().createUserWithEmailAndPassword(email.trim(), password);
          if (userCredential.user) {
            await RevenueCatService.loginUser(userCredential.user.uid);
          }
        } else {
          throw signInError;
        }
      }
      setHasOnboarded(true);
      navigation.reset({
        index: 1,
        routes: [{ name: 'Main' }, { name: 'Paywall' }],
      });
    } catch (error: any) {
      Alert.alert('Authentication Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          style={styles.keyboardView} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            
            {/* Top Hero Icon */}
              <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.heroIconContainer}>
              <LinearGradient
                colors={['#D9383E', theme.colors.accentPrimary]}
                style={styles.heroIconBackground}
              >
                <ShieldCheck color="#FFFFFF" size={32} strokeWidth={2.5} />
              </LinearGradient>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(600).delay(100).springify()} style={styles.header}>
              <Text style={styles.title}>Secure your progress</Text>
              <Text style={styles.subtitle}>Create your free account to protect your 5-day streak and sync across devices.</Text>
            </Animated.View>

            {/* Premium Benefits Card */}
            <Animated.View entering={FadeInDown.duration(600).delay(200).springify()} style={styles.benefitsContainer}>
              <View style={styles.benefitCard}>
                <View style={styles.benefitIconWrapper}>
                  <Check color={theme.colors.success} size={16} strokeWidth={3} />
                </View>
                <Text style={styles.benefitText}>Save your 5-day streak</Text>
              </View>
              <View style={styles.benefitCard}>
                <View style={styles.benefitIconWrapper}>
                  <Check color={theme.colors.success} size={16} strokeWidth={3} />
                </View>
                <Text style={styles.benefitText}>Seamless multi-device sync</Text>
              </View>
            </Animated.View>

            {/* Form */}
            <Animated.View entering={FadeInUp.duration(600).delay(300).springify()} style={styles.formContainer}>
              <View style={[styles.inputWrapper, isFocused && styles.inputWrapperFocused]}>
                <Mail color={isFocused ? theme.colors.accentPrimary : theme.colors.textSecondary} size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email address"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                />
              </View>

              <View style={styles.buttonWrapper}>
                <Button 
                  title={isLoading ? "Securing account..." : "Continue"} 
                  onPress={handleAuth}
                  disabled={isLoading || !email}
                />
              </View>

              <TouchableOpacity 
                style={styles.skipButton}
                onPress={() => {
                  setHasOnboarded(true);
                  navigation.reset({
                    index: 1,
                    routes: [{ name: 'Main' }, { name: 'Paywall' }],
                  });
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.skipButtonText}>Skip for now</Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primaryDark,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.xl,
    justifyContent: 'center',
  },
  heroIconContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  heroIconBackground: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.accentPrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: theme.typography.sizes.xxl,
    color: theme.colors.textPrimary,
    fontWeight: '800',
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 16,
    color: theme.colors.textSecondary,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  benefitsContainer: {
    marginBottom: 40,
    gap: theme.spacing.md,
  },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceDark,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    gap: theme.spacing.md,
  },
  benefitIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(123, 198, 126, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 15,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  formContainer: {
    gap: theme.spacing.lg,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceDark,
    borderRadius: theme.radius.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: theme.spacing.lg,
    height: 60,
  },
  inputWrapperFocused: {
    borderColor: theme.colors.accentPrimary,
    backgroundColor: 'rgba(193, 39, 45, 0.05)',
  },
  inputIcon: {
    marginRight: theme.spacing.md,
  },
  input: {
    flex: 1,
    height: 60,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fonts.body,
    fontSize: 16,
  },
  buttonWrapper: {
    shadowColor: theme.colors.accentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.xs,
  },
  skipButtonText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 15,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
});
