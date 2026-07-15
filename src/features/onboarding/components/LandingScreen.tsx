import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, TouchableOpacity, Image, Modal, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { theme } from '../../../core/theme';
import { Button } from '../../../components/Button';
import { Sparkles, X, Mail } from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import { RevenueCatService } from '../../../services/revenuecat';
import { useUserStore } from '../../../store/useUserStore';
import { useAuthStore } from '../../../store/useAuthStore';

const { width, height } = Dimensions.get('window');

export const LandingScreen = () => {
  const navigation = useNavigation<any>();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setHasOnboarded, setPremium } = useUserStore();

  const handleLogin = async () => {
    if (!email) return;
    setIsLoading(true);
    const password = email.toLowerCase().trim() + '_LenguaAuth2026!';
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email.trim(), password);
      if (userCredential.user) {
        useAuthStore.getState().setUser({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
        });
        await RevenueCatService.loginUser(userCredential.user.uid);
        const isPremium = await RevenueCatService.checkPremiumStatus();
        setPremium(isPremium);
      }
      setHasOnboarded(true);
      setShowLoginModal(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (error: any) {
      if (
        error.code === 'auth/user-not-found' || 
        error.code === 'auth/invalid-credential' || 
        error.code === 'auth/invalid-login-credentials' || 
        error.code === 'auth/wrong-password'
      ) {
        // Try legacy password format
        const legacyPassword = email + '_LenguaAuth2026!';
        try {
          const legacyCredential = await auth().signInWithEmailAndPassword(email.trim(), legacyPassword);
          if (legacyCredential.user) {
            useAuthStore.getState().setUser({
              uid: legacyCredential.user.uid,
              email: legacyCredential.user.email,
              displayName: legacyCredential.user.displayName,
            });
            await RevenueCatService.loginUser(legacyCredential.user.uid);
            const isPremium = await RevenueCatService.checkPremiumStatus();
            setPremium(isPremium);
          }
          setHasOnboarded(true);
          setShowLoginModal(false);
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          });
        } catch (legacyError) {
          Alert.alert('Account not found', "We couldn't find an account with that email. Please tap 'Get Started' to create one.");
        }
      } else {
        Alert.alert('Login Error', error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../../../assets/landing.png')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.4)' }]} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Animated.View entering={FadeInDown.duration(800).delay(200).springify()} style={styles.textContainer}>
            <Text style={styles.title}>Lengua</Text>
            <Text style={styles.subtitle}>
              Master Spanish naturally with immersive, real-world conversations.
            </Text>
          </Animated.View>
        </View>

        <Animated.View entering={FadeIn.duration(800).delay(400)} style={styles.footer}>
          <Button 
            title="Get Started" 
            onPress={() => navigation.navigate('Onboarding')} 
          />
          <TouchableOpacity style={styles.loginButton} onPress={() => setShowLoginModal(true)}>
            <Text style={styles.loginText}>I already have an account</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>

      <Modal
        visible={showLoginModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLoginModal(false)}
      >
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.75)' }]} />
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setShowLoginModal(false)} />
          <View style={styles.modalContent}>
            <View style={styles.dragPill} />
            <TouchableOpacity style={styles.closeModalButton} onPress={() => setShowLoginModal(false)} hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}>
              <X color="#6B7280" size={24} />
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>Welcome Back</Text>
            <Text style={styles.modalSubtitle}>Enter your email to effortlessly restore your learning progress.</Text>
            
            <View style={styles.inputContainer}>
              <Mail color="#9CA3AF" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            
            <View style={styles.modalButtonWrapper}>
              <Button 
                title={isLoading ? "Securing account..." : "Log In"}
                onPress={handleLogin}
                disabled={isLoading || !email}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primaryDark,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xxl,
    position: 'relative',
  },
  iconBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.accentSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.accentSecondary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  sparkleBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: theme.colors.surfaceDark,
    padding: 8,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.colors.primaryDark,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: theme.spacing.md,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  subtitle: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 28,
    paddingHorizontal: theme.spacing.lg,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  footer: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: 40,
    gap: 20,
  },
  loginButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  loginText: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.md,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  dragPill: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: theme.spacing.md,
  },
  closeModalButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  modalTitle: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: 28,
    color: '#111827',
    fontWeight: '900',
    marginBottom: theme.spacing.xs,
    letterSpacing: -0.5,
  },
  modalSubtitle: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 16,
    color: '#4B5563',
    marginBottom: theme.spacing.xxl,
    lineHeight: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.lg,
    height: 64,
    marginBottom: theme.spacing.xxl,
  },
  inputIcon: {
    marginRight: theme.spacing.md,
  },
  input: {
    flex: 1,
    color: '#111827',
    fontFamily: theme.typography.fonts.body,
    fontSize: 18,
    height: '100%',
  },
  modalButtonWrapper: {
    shadowColor: theme.colors.accentPrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
});
