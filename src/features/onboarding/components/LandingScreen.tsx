import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, TouchableOpacity, Image } from 'react-native';
import { theme } from '../../../core/theme';
import { Button } from '../../../components/Button';
import { Sparkles } from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export const LandingScreen = () => {
  const navigation = useNavigation<any>();
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
          <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Auth')}>
            <Text style={styles.loginText}>I already have an account</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
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
});
