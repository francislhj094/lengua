import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../../core/theme';
import { Button } from '../../../components/Button';
import { Compass } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

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
          onPress={onNext} 
        />
        <Button 
          title="I'm a complete beginner" 
          variant="outline"
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
    backgroundColor: theme.colors.primaryDark,
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
    fontSize: 32,
    color: theme.colors.textPrimary,
    fontWeight: '900',
    marginBottom: 12,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 32,
    lineHeight: 24,
    textAlign: 'center',
  },
  footer: {
    padding: theme.spacing.xl,
    paddingTop: 40,
  },
});
