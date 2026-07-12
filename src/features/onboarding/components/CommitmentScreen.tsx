import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../../../core/theme';
import { Button } from '../../../components/Button';
import { OptionCard } from '../../../components/OptionCard';
import { useOnboardingStore } from '../../../store/useOnboardingStore';
import { Clock, Timer, Flame, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  onComplete: () => void;
}

const COMMITMENTS = [
  { id: 5, title: 'Casual', description: '5 min/day (1 lesson)', icon: Clock },
  { id: 15, title: 'Regular', description: '15 min/day (2-3 lessons)', icon: Timer },
  { id: 30, title: 'Dedicated', description: '30 min/day (4-5 lessons + conversation)', icon: Flame },
  { id: 60, title: 'Intensive', description: '60+ min/day (full study session)', icon: Zap },
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
          {COMMITMENTS.map((opt) => {
            const Icon = opt.icon;
            return (
              <OptionCard
                key={opt.id}
                title={opt.title}
                description={opt.description}
                icon={<Icon color={theme.colors.accentPrimary} size={24} />}
                selected={dailyCommitment === opt.id}
                onPress={() => setDailyCommitment(opt.id)}
              />
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title="Commit to my goal" 
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
    fontSize: 32,
    color: theme.colors.textPrimary,
    fontWeight: '900',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 32,
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 0,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.xl,
    paddingTop: 40,
  },
});
