import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../core/theme';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

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
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.95, { damping: 12, stiffness: 200 });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      scale.value = withSpring(1, { damping: 12, stiffness: 200 });
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

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
        return { color: theme.colors.primaryDark, fontWeight: '700' };
      case 'secondary':
      default:
        return { color: theme.colors.textPrimary, fontWeight: '700' };
    }
  };

  const content = (
    <Text style={[styles.text, getTextStyle(), textStyle]}>{title}</Text>
  );

  if (variant === 'primary' && !disabled) {
    return (
      <Animated.View style={[styles.touchable, style, animatedStyle]}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
        >
          <LinearGradient
            colors={['#D9383E', theme.colors.accentPrimary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          >
            {content}
          </LinearGradient>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.touchable, style, animatedStyle]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={({ pressed }) => [
          styles.baseButton,
          getContainerStyle(),
          disabled && styles.disabled,
          pressed && !disabled && { opacity: 0.7 }
        ]}
      >
        {content}
      </Pressable>
    </Animated.View>
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
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});
