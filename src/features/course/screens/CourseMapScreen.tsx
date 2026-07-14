import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../../core/theme';
import { useCourseStore, Lesson } from '../../../store/useCourseStore';
import { BookOpen, Check, Lock, Play, Flame, Heart, Star } from 'lucide-react-native';
import { useUserStore } from '../../../store/useUserStore';

export const CourseMapScreen = ({ navigation }: any) => {
  const { level, units } = useCourseStore();
  const { streak, hearts, xp, isPremium } = useUserStore();

  const handlePressLesson = (lesson: Lesson) => {
    // Determine if lesson is premium (id >= 6)
    const lessonNumMatch = lesson.id.match(/\d+/);
    const lessonNum = lessonNumMatch ? parseInt(lessonNumMatch[0], 10) : 0;
    const isPremiumLesson = lessonNum >= 6;

    if (isPremiumLesson && !isPremium) {
      navigation.navigate('Paywall');
      return;
    }

    if (lesson.status !== 'locked') {
      navigation.navigate('Lesson', { lessonId: lesson.id });
    }
  };

  const renderLessonNode = (lesson: Lesson, index: number, total: number) => {
    const isCompleted = lesson.status === 'completed';
    const isUnlocked = lesson.status === 'unlocked';
    
    // Zig-zag pattern
    const isEven = index % 2 === 0;
    const alignSelf = isEven ? 'flex-start' : 'flex-end';
    
    return (
      <View key={lesson.id} style={[styles.nodeWrapper, { alignSelf }]}>
        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={() => handlePressLesson(lesson)}
          style={[
            styles.nodeCircle,
            isCompleted && styles.lessonNodeCompleted,
            isUnlocked && styles.lessonNodeCurrent,
            lesson.status === 'locked' && styles.lessonNodeLocked
          ]}
        >
          {isCompleted && <Check color="#FFFFFF" size={32} strokeWidth={3} />}
          {isUnlocked && <Play color={theme.colors.accentPrimary} size={32} strokeWidth={2.5} style={{ marginLeft: 4 }} />}
          {lesson.status === 'locked' && <Lock color={theme.colors.textSecondary} size={24} strokeWidth={2} />}
        </TouchableOpacity>
        <Text style={[
          styles.nodeTitle,
          lesson.status === 'locked' && styles.nodeTitleLocked
        ]}>
          {lesson.title}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.statContainer}>
          <Flame color={theme.colors.accentSecondary} size={24} />
          <Text style={styles.statText}>{streak}</Text>
        </View>
        <View style={styles.statContainer}>
          <Star color="#F1C40F" size={24} />
          <Text style={styles.statText}>{xp}</Text>
        </View>
        <View style={styles.statContainer}>
          <Heart color="#E74C3C" size={24} fill="#E74C3C" />
          <Text style={styles.statText}>{hearts}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {units.map((unit, unitIndex) => (
          <View key={unit.id} style={styles.unitContainer}>
            <View style={styles.unitHeader}>
              <Text style={styles.unitSubtitle}>Unit {unitIndex + 1}</Text>
              <Text style={styles.unitTitle}>{unit.title.split(': ')[1] || unit.title}</Text>
            </View>
            
            <View style={styles.pathContainer}>
              {unit.lessons.map((lesson, idx) => renderLessonNode(lesson, idx, unit.lessons.length))}
            </View>
          </View>
        ))}
        </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primaryDark,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  statContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  headerTitle: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
  levelBadge: {
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 4,
    borderRadius: theme.radius.round,
  },
  levelText: {
    fontFamily: theme.typography.fonts.headline,
    color: theme.colors.accentSecondary,
    fontWeight: '700',
    fontSize: theme.typography.sizes.sm,
  },
  scrollContent: {
    padding: theme.spacing.xl,
    paddingBottom: 100,
  },
  unitContainer: {
    marginBottom: theme.spacing.xxl,
  },
  unitHeader: {
    backgroundColor: theme.colors.surfaceDark,
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  unitSubtitle: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  unitTitle: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: 24,
    color: theme.colors.textPrimary,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  pathContainer: {
    paddingHorizontal: theme.spacing.xl,
    gap: 16,
  },
  nodeWrapper: {
    alignItems: 'center',
    width: 120,
  },
  nodeCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderBottomWidth: 6,
    backgroundColor: '#fff',
    borderColor: 'rgba(0,0,0,0.08)',
  },
  lessonNodeCompleted: {
    backgroundColor: theme.colors.accentPrimary,
    borderColor: '#B8262C', // Darker red for bottom 3D border
    borderWidth: 2,
    borderBottomWidth: 6,
  },
  lessonNodeLocked: {
    backgroundColor: theme.colors.surfaceDark,
    borderColor: 'rgba(0,0,0,0.05)',
    borderWidth: 2,
    borderBottomWidth: 4,
  },
  lessonNodeCurrent: {
    backgroundColor: '#FFFFFF',
    borderColor: theme.colors.accentPrimary,
    borderWidth: 2,
    borderBottomWidth: 6,
  },
  nodeContent: {
    alignItems: 'center',
    gap: 8,
  },
  nodeTitle: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontWeight: '800',
    textAlign: 'center',
  },
  nodeTitleLocked: {
    color: theme.colors.textSecondary,
  }
});
