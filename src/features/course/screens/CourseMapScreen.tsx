import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../../core/theme';
import { useCourseStore, Lesson } from '../../../store/useCourseStore';
import { BookOpen, Check, Lock, Play } from 'lucide-react-native';

export const CourseMapScreen = ({ navigation }: any) => {
  const { level, units } = useCourseStore();

  const handlePressLesson = (lesson: Lesson) => {
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
            isCompleted && styles.nodeCircleCompleted,
            isUnlocked && styles.nodeCircleActive,
            lesson.status === 'locked' && styles.nodeCircleLocked
          ]}
        >
          {isCompleted && <Check color={theme.colors.primaryDark} size={24} />}
          {isUnlocked && <Play color={theme.colors.primaryDark} size={24} style={{ marginLeft: 4 }} />}
          {lesson.status === 'locked' && <Lock color={theme.colors.textSecondary} size={20} />}
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
        <Text style={styles.headerTitle}>Learning Path</Text>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>CEFR {level}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {units.map((unit, unitIndex) => (
          <View key={unit.id} style={styles.unitContainer}>
            <View style={styles.unitHeader}>
              <Text style={styles.unitSubtitle}>Unit {unitIndex + 1}</Text>
              <Text style={styles.unitTitle}>{unit.title}</Text>
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
    gap: theme.spacing.lg,
  },
  nodeWrapper: {
    alignItems: 'center',
    width: 100,
  },
  nodeCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 3,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  lessonNodeCompleted: {
    backgroundColor: 'rgba(193, 39, 45, 0.15)',
    borderColor: theme.colors.accentPrimary,
  },
  lessonNodeLocked: {
    backgroundColor: theme.colors.surfaceDark,
    borderColor: 'rgba(0,0,0,0.05)',
    opacity: 0.6,
  },
  lessonNodeCurrent: {
    backgroundColor: theme.colors.surfaceDark,
    borderColor: theme.colors.accentPrimary,
    shadowColor: theme.colors.accentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  nodeContent: {
    alignItems: 'center',
    gap: 8,
  },
  lessonTitle: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },
  nodeTitleLocked: {
    color: theme.colors.textSecondary,
  }
});
