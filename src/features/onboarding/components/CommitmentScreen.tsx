import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../../../core/theme';
import { Button } from '../../../components/Button';
import { OptionCard } from '../../../components/OptionCard';
import { useOnboardingStore } from '../../../store/useOnboardingStore';
import { Clock } from 'lucide-react-native';

interface Props {
  onComplete: () => void;
}

const COMMITMENTS = [
  { id: 5, title: 'Casual', description: '5 min/day (1 lesson)' },
  { id: 15, title: 'Regular', description: '15 min/day (2-3 lessons)' },
  { id: 30, title: 'Dedicated', description: '30 min/day (4-5 lessons + conversation)' },
  { id: 60, title: 'Intensive', description: '60+ min/day (full study session)' },
];

export const CommitmentScreen: React.FC<Props> = ({ onComplete }) => {
  const { dailyCommitment, setDailyCommitment } = useOnboardingStore();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>How much time can you dedicate?</Text>
        <Text style={styles.subtitle}>
          Consistency is the key to fluency. We'll design your daily challenges around this goal.
        </Text>
        
        <View style={styles.optionsContainer}>
          {COMMITMENTS.map((opt) => (
            <OptionCard
              key={opt.id}
              title={opt.title}
              description={opt.description}
              icon={<Clock color={theme.colors.accentPrimary} />}
              selected={dailyCommitment === opt.id}
              onPress={() => setDailyCommitment(opt.id)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title="Complete Setup" 
          onPress={onComplete} 
          disabled={!dailyCommitment} 
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
