import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { theme } from '../../../core/theme';
import { FirebaseService } from '../../../services/firebase';
import { useAuthStore } from '../../../store/useAuthStore';
import { Mail, Lock, Check } from 'lucide-react-native';
import { Button } from '../../../components/Button';

export const AuthScreen = ({ navigation }: any) => {
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);

  const handleAuth = async () => {
    if (!email) return;
    setIsLoading(true);
    
    // Simulate sending magic link
    setTimeout(() => {
      setIsLoading(false);
      setLinkSent(true);
      // In a real app we'd navigate back or wait for deep link
      setTimeout(() => navigation.replace('Paywall'), 2000);
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Save your progress</Text>
          <Text style={styles.subtitle}>Create a free account to sync your Spanish journey across devices.</Text>
        </View>

        {/* Benefits */}
        <View style={styles.benefitsContainer}>
          <View style={styles.benefitRow}>
            <Check color={theme.colors.success} size={18} />
            <Text style={styles.benefitText}>Save your 5-day streak</Text>
          </View>
          <View style={styles.benefitRow}>
            <Check color={theme.colors.success} size={18} />
            <Text style={styles.benefitText}>Cloud sync AI chat history</Text>
          </View>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {!linkSent ? (
            <>
              <View style={styles.inputWrapper}>
                <Mail color={theme.colors.textSecondary} size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <Button 
                title={isLoading ? "Sending link..." : "Send Magic Link"} 
                onPress={handleAuth}
                disabled={isLoading || !email}
              />
            </>
          ) : (
            <View style={styles.successBox}>
              <Check color={theme.colors.success} size={24} />
              <Text style={styles.successText}>Link sent! Check your inbox.</Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primaryDark,
  },
  content: {
    flex: 1,
    padding: theme.spacing.xl,
    justifyContent: 'center',
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: theme.typography.sizes.xxl,
    color: theme.colors.textPrimary,
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  benefitsContainer: {
    marginBottom: theme.spacing.xxl,
    gap: theme.spacing.md,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  benefitText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textPrimary,
  },
  formContainer: {
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceDark,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: theme.spacing.lg,
  },
  inputIcon: {
    marginRight: theme.spacing.md,
  },
  input: {
    flex: 1,
    height: 56,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.md,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(123, 198, 126, 0.1)',
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    gap: theme.spacing.md,
  },
  successText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.success,
  }
});
