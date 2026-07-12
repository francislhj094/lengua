import React, { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { theme } from '../core/theme';
import { Check } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, interpolateColor } from 'react-native-reanimated';

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
  const scale = useSharedValue(1);
  const active = useSharedValue(0);

  useEffect(() => {
    if (selected) {
      scale.value = withSpring(1.03, { damping: 15, stiffness: 300 });
      active.value = withTiming(1, { duration: 250 });
    } else {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      active.value = withTiming(0, { duration: 250 });
    }
  }, [selected]);

  const animatedStyle = useAnimatedStyle(() => {
    // Interpolate border color between subtle gray and brand red
    const currentBorderColor = interpolateColor(
      active.value,
      [0, 1],
      ['rgba(0, 0, 0, 0.08)', theme.colors.accentPrimary]
    );

    return {
      transform: [{ scale: scale.value }],
      backgroundColor: selected ? 'rgba(193, 39, 45, 0.03)' : theme.colors.white,
      borderColor: currentBorderColor,
      borderWidth: 2,
      borderBottomWidth: selected ? 2 : 4, // 3D effect
    };
  });

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: active.value }],
    opacity: active.value,
  }));

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={onPress}
      style={styles.touchable}
    >
      <Animated.View style={[styles.container, animatedStyle]}>
        <View style={styles.leftContent}>
          {icon && (
            <View style={[styles.iconContainer, selected && styles.iconContainerSelected]}>
              {icon}
            </View>
          )}
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
          <Animated.View style={checkAnimatedStyle}>
            <Check size={16} color={theme.colors.primaryDark} strokeWidth={3} />
          </Animated.View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    marginBottom: 12,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
    // Remove shadow for flat 3D design
    elevation: 0,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: 16,
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerSelected: {
    backgroundColor: 'rgba(193, 39, 45, 0.1)',
  },
  textContainer: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: 18,
    color: theme.colors.textPrimary,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  titleSelected: {
    color: theme.colors.accentPrimary,
  },
  description: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },
  descriptionSelected: {
    color: theme.colors.textPrimary,
  },
  radio: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceDark,
  },
  radioSelected: {
    borderColor: theme.colors.accentPrimary,
    backgroundColor: theme.colors.accentPrimary,
  },
});
