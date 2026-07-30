import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { theme } from '../../../core/theme';
import { useUserStore } from '../../../store/useUserStore';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Dumbbell, Heart, CheckCircle } from 'lucide-react-native';
import { Button } from '../../../components/Button';
import { LinearGradient } from 'expo-linear-gradient';

export const ReviewTabScreen = () => {
  const { weakWords, hearts, isPremium, freeLessonsUsed, incrementFreeLessonsUsed } = useUserStore();
  const navigation = useNavigation<any>();

  const handleStartPractice = () => {
    if (!isPremium && freeLessonsUsed >= 2) {
      navigation.navigate('Paywall');
      return;
    }
    if (!isPremium) {
      incrementFreeLessonsUsed();
    }
    navigation.navigate('Lesson', { reviewMode: true });
  };

  const safeWeakWords = weakWords || [];
  const isQueueEmpty = safeWeakWords.length === 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(500).springify()} style={styles.header}>
          <Text style={styles.title}>Practice</Text>
          <Text style={styles.subtitle}>Review your weak words and earn back hearts to keep learning.</Text>
        </Animated.View>

        {isQueueEmpty ? (
          <Animated.View entering={FadeInDown.duration(500).delay(100).springify()} style={styles.emptyCard}>
            <View style={styles.iconBoxSuccess}>
              <CheckCircle color={theme.colors.success} size={48} strokeWidth={2.5} />
            </View>
            <Text style={styles.emptyTitle}>You're all caught up!</Text>
            <Text style={styles.emptySubtitle}>You don't have any weak words to review right now. Keep learning new lessons to encounter more challenges.</Text>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.duration(500).delay(100).springify()} style={styles.practiceCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.01)']}
              style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
            />
            <View style={styles.cardHeader}>
              <View style={styles.iconBox}>
                <Dumbbell color={theme.colors.accentPrimary} size={32} strokeWidth={2.5} />
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{safeWeakWords.length} Pending</Text>
              </View>
            </View>
            
            <Text style={styles.cardTitle}>Spaced Repetition</Text>
            <Text style={styles.cardSubtitle}>
              Master the {safeWeakWords.length} word{safeWeakWords.length === 1 ? '' : 's'} you recently struggled with.
            </Text>

            <View style={styles.rewardBox}>
              <Text style={styles.rewardText}>Reward:</Text>
              <View style={styles.rewardTag}>
                <Heart color={theme.colors.accentPrimary} size={16} fill={theme.colors.accentPrimary} />
                <Text style={styles.rewardTagText}>+1 Heart</Text>
              </View>
            </View>

            <Button 
              title="Start Practice Session" 
              onPress={handleStartPractice}
              style={styles.button}
            />
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primaryDark,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 120, // Tab bar padding
  },
  header: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: theme.typography.sizes.xxl,
    color: theme.colors.textPrimary,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 16,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  practiceCard: {
    backgroundColor: theme.colors.surfaceDark,
    borderRadius: 24,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(193, 39, 45, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  badgeText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  cardTitle: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  cardSubtitle: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 15,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  rewardBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
  },
  rewardText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 15,
    color: theme.colors.textSecondary,
    marginRight: 12,
  },
  rewardTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(193, 39, 45, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  rewardTagText: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.accentPrimary,
  },
  button: {
    marginTop: 8,
  },
  emptyCard: {
    alignItems: 'center',
    padding: theme.spacing.xxl,
    marginTop: theme.spacing.xl,
  },
  iconBoxSuccess: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
