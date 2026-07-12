import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text } from 'react-native';
import { theme } from '../../../core/theme';
import { ChevronLeft } from 'lucide-react-native';
import { WelcomeGoalScreen } from '../components/WelcomeGoalScreen';
import { DialectScreen } from '../components/DialectScreen';
import { PlacementScreen } from '../components/PlacementScreen';
import { CommitmentScreen } from '../components/CommitmentScreen';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';

export const OnboardingScreen = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const navigation = useNavigation<any>();

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeGoalScreen onNext={nextStep} key="step0" />;
      case 1:
        return <DialectScreen onNext={nextStep} key="step1" />;
      case 2:
        return <PlacementScreen onNext={nextStep} key="step2" />;
      case 3:
        return <CommitmentScreen onComplete={() => navigation.replace('Auth')} key="step3" />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header / Navigation */}
      <View style={styles.header}>
        {currentStep > 0 ? (
          <TouchableOpacity onPress={prevStep} style={styles.backButton}>
            <ChevronLeft color={theme.colors.textPrimary} size={24} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backButtonPlaceholder} />
        )}
        
        {/* Progress Dots */}
        <View style={styles.progressContainer}>
          {[0, 1, 2, 3].map((step) => (
            <View
              key={step}
              style={[
                styles.dot,
                currentStep >= step ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
        <View style={styles.backButtonPlaceholder} />
      </View>

      {/* Content with Animation */}
      <View style={styles.contentContainer}>
        <Animated.View
          key={currentStep}
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(300)}
          style={{ flex: 1 }}
        >
          {renderStep()}
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primaryDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  backButtonPlaceholder: {
    width: 32, // to balance the chevron left which is 24 + padding
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 24,
    height: 4,
    borderRadius: 2,
  },
  dotActive: {
    backgroundColor: theme.colors.accentPrimary,
  },
  dotInactive: {
    backgroundColor: theme.colors.surfaceDark,
  },
  contentContainer: {
    flex: 1,
  },
});
