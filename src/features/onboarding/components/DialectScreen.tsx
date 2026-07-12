import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../../../core/theme';
import { Button } from '../../../components/Button';
import { OptionCard } from '../../../components/OptionCard';
import { useOnboardingStore } from '../../../store/useOnboardingStore';
import { Volume2 } from 'lucide-react-native';

interface Props {
  onNext: () => void;
}

export const DialectScreen: React.FC<Props> = ({ onNext }) => {
  const { dialect, setDialect } = useOnboardingStore();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Which Spanish?</Text>
        <Text style={styles.subtitle}>
          Spanish varies across the world. Choose your primary focus, and you'll still be understood everywhere.
        </Text>
        
        <View style={styles.optionsContainer}>
          <OptionCard
            title="European Spanish"
            description="Spain. Features the 'vosotros' form and distinctive pronunciation."
            icon={<Volume2 color={theme.colors.accentPrimary} />}
            selected={dialect === 'spain'}
            onPress={() => setDialect('spain')}
          />
          <OptionCard
            title="Latin American Spanish"
            description="Neutral LATAM. Perfect for travel across the Americas."
            icon={<Volume2 color={theme.colors.accentPrimary} />}
            selected={dialect === 'latam'}
            onPress={() => setDialect('latam')}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title="Continue" 
          onPress={onNext} 
          disabled={!dialect} 
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
