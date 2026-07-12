import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../core/theme';
import { LinearGradient } from 'expo-linear-gradient';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  style,
  textStyle,
  disabled = false,
}) => {
  const getContainerStyle = (): ViewStyle => {
    switch (variant) {
      case 'secondary':
        return { backgroundColor: theme.colors.surfaceDark };
      case 'outline':
        return { borderWidth: 1, borderColor: theme.colors.accentPrimary, backgroundColor: 'transparent' };
      case 'ghost':
        return { backgroundColor: 'transparent' };
      case 'primary':
      default:
        return {}; // Gradient handled separately
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'outline':
      case 'ghost':
        return { color: theme.colors.accentPrimary };
      case 'primary':
      case 'secondary':
      default:
        return { color: theme.colors.primaryDark, fontWeight: '700' };
    }
  };

  const content = (
    <Text style={[styles.text, getTextStyle(), textStyle]}>{title}</Text>
  );

  if (variant === 'primary' && !disabled) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.touchable, style]}>
        <LinearGradient
          colors={[theme.colors.accentPrimary, '#E59C38']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[styles.touchable, styles.baseButton, getContainerStyle(), disabled && styles.disabled, style]}
    >
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    width: '100%',
    borderRadius: theme.radius.round,
    overflow: 'hidden',
  },
  gradient: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.md,
  },
  disabled: {
    opacity: 0.5,
  },
});
