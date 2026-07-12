import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { theme } from '../core/theme';
import { Check } from 'lucide-react-native';

interface OptionCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  selected: boolean;
  onPress: () => void;
}

export const OptionCard: React.FC<OptionCardProps> = ({
  title,
  description,
  icon,
  selected,
  onPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.container,
        selected && styles.containerSelected,
      ]}
    >
      <View style={styles.leftContent}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <View style={styles.textContainer}>
          <Text style={[styles.title, selected && styles.titleSelected]}>{title}</Text>
          {description && (
            <Text style={[styles.description, selected && styles.descriptionSelected]}>
              {description}
            </Text>
          )}
        </View>
      </View>
      
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <Check size={14} color={theme.colors.primaryDark} />}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surfaceDark,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: theme.spacing.md,
  },
  containerSelected: {
    borderColor: theme.colors.accentPrimary,
    backgroundColor: 'rgba(232, 176, 89, 0.05)',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: theme.spacing.md,
  },
  textContainer: {
    flex: 1,
    paddingRight: theme.spacing.sm,
  },
  title: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  titleSelected: {
    color: theme.colors.accentPrimary,
  },
  description: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  descriptionSelected: {
    color: theme.colors.textPrimary,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: theme.colors.accentPrimary,
    backgroundColor: theme.colors.accentPrimary,
  },
});
