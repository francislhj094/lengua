import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../../../core/theme';
import { Button } from '../../../components/Button';
import { OptionCard } from '../../../components/OptionCard';
import { useOnboardingStore } from '../../../store/useOnboardingStore';
import { Plane, Briefcase, Brain, Heart, MapPin } from 'lucide-react-native';

interface Props {
  onNext: () => void;
}

const MOTIVATIONS = [
  { id: 'spain', title: 'Moving to Spain', icon: <MapPin color={theme.colors.accentPrimary} /> },
  { id: 'travel', title: 'Travel & exploration', icon: <Plane color={theme.colors.accentPrimary} /> },
  { id: 'career', title: 'Career & business', icon: <Briefcase color={theme.colors.accentPrimary} /> },
  { id: 'enrichment', title: 'Personal enrichment', icon: <Brain color={theme.colors.accentPrimary} /> },
  { id: 'family', title: 'Connecting with family/friends', icon: <Heart color={theme.colors.accentPrimary} /> },
];

export const WelcomeGoalScreen: React.FC<Props> = ({ onNext }) => {
  const { motivation, setMotivation } = useOnboardingStore();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>What brings you to Spanish?</Text>
        <Text style={styles.subtitle}>Select your primary goal to help us personalize your learning path.</Text>
        
        <View style={styles.optionsContainer}>
          {MOTIVATIONS.map((opt) => (
            <OptionCard
              key={opt.id}
              title={opt.title}
              icon={opt.icon}
              selected={motivation === opt.id}
              onPress={() => setMotivation(opt.id)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title="Continue" 
          onPress={onNext} 
          disabled={!motivation} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.xl,
    paddingBottom: 100,
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
    marginBottom: theme.spacing.xl,
    lineHeight: 24,
  },
  optionsContainer: {
    gap: theme.spacing.md,
  },
  footer: {
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.primaryDark,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceDark,
  },
});
