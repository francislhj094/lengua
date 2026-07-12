import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '../../../core/theme';
import { Flame, BookOpen, Target, Calendar } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useCourseStore } from '../../../store/useCourseStore';

export const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const { units, activeLessonId } = useCourseStore();

  // Find the active unit and lesson
  let activeUnit = units[0];
  let activeLesson = units[0].lessons[0];

  for (const unit of units) {
    const found = unit.lessons.find(l => l.id === activeLessonId);
    if (found) {
      activeUnit = unit;
      activeLesson = found;
      break;
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header section with streak */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hola, Learner</Text>
            <Text style={styles.subGreeting}>Ready to master Spanish?</Text>
          </View>
          <View style={styles.streakBadge}>
            <Flame color={theme.colors.accentPrimary} size={20} />
            <Text style={styles.streakText}>5</Text>
          </View>
        </View>

        {/* Up Next Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Up Next</Text>
          <TouchableOpacity 
            activeOpacity={0.9} 
            onPress={() => navigation.navigate('Lesson', { lessonId: activeLesson.id })}
          >
            <LinearGradient
              colors={['#252538', '#1A1A2E']}
              style={styles.heroCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.heroIconBox}>
                <BookOpen color={theme.colors.textPrimary} size={24} />
              </View>
              <View style={styles.heroTextContent}>
                <Text style={styles.heroTitle}>{activeUnit.title}</Text>
                <Text style={styles.heroSubtitle}>{activeLesson.title}</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: '40%' }]} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Vocabulary Review */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vocabulary Review</Text>
          <TouchableOpacity 
            style={[styles.challengeCard, { backgroundColor: 'rgba(78, 205, 196, 0.05)', borderColor: 'rgba(78, 205, 196, 0.2)', borderWidth: 1 }]} 
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Vocab')}
          >
            <View style={styles.challengeLeft}>
              <View style={[styles.heroIconBox, { backgroundColor: 'rgba(78, 205, 196, 0.1)', width: 40, height: 40, marginBottom: 0 }]}>
                <BookOpen color={theme.colors.accentSecondary} size={20} />
              </View>
              <View style={{ marginLeft: theme.spacing.md }}>
                <Text style={styles.cardTitle}>Spaced Repetition</Text>
                <Text style={styles.cardSubtitle}>3 cards due for review</Text>
              </View>
            </View>
            <Text style={[styles.rewardText, { color: theme.colors.accentSecondary }]}>Start</Text>
          </TouchableOpacity>
        </View>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.md,
  },
  greeting: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
  subGreeting: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(232, 176, 89, 0.1)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.round,
    borderWidth: 1,
    borderColor: 'rgba(232, 176, 89, 0.2)',
  },
  streakText: {
    fontFamily: theme.typography.fonts.headline,
    color: theme.colors.accentPrimary,
    fontWeight: '700',
    fontSize: theme.typography.sizes.md,
    marginLeft: 4,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.textPrimary,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
  },
  heroCard: {
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  heroIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  heroTextContent: {
    marginBottom: theme.spacing.md,
  },
  heroTitle: {
    fontFamily: theme.typography.fonts.headline,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.lg,
    fontWeight: '700',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontFamily: theme.typography.fonts.body,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.sm,
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.accentPrimary,
    borderRadius: 3,
  },
  challengeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceDark,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
  },
  challengeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontFamily: theme.typography.fonts.headline,
    color: theme.colors.textPrimary,
    fontWeight: '600',
    fontSize: theme.typography.sizes.md,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontFamily: theme.typography.fonts.body,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.sm,
  },
  rewardText: {
    fontFamily: theme.typography.fonts.headline,
    color: theme.colors.accentSecondary,
    fontWeight: '700',
    fontSize: theme.typography.sizes.sm,
  }
});
