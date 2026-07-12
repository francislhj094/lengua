import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../../core/theme';
import { Button } from '../../../components/Button';
import { Compass } from 'lucide-react-native';

interface Props {
  onNext: () => void;
}

export const PlacementScreen: React.FC<Props> = ({ onNext }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Compass size={48} color={theme.colors.accentPrimary} />
        </View>
        <Text style={styles.title}>Let's find your starting point</Text>
        <Text style={styles.subtitle}>
          This isn't a test, it's a compass. We'll ask a few quick questions to place you at the perfect level.
        </Text>
      </View>

      <View style={styles.footer}>
        <Button 
          title="Start Assessment" 
          onPress={onNext} // Skipping actual assessment for MVP
        />
        <Button 
          title="I'm a complete beginner" 
          variant="ghost"
          onPress={onNext} 
          style={{ marginTop: theme.spacing.md }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: theme.spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(232, 176, 89, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.textPrimary,
    fontWeight: '700',
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: theme.spacing.md,
  },
  footer: {
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.primaryDark,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceDark,
  },
});
