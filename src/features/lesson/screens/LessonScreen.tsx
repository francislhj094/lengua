import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import { theme } from '../../../core/theme';
import { useCourseStore } from '../../../store/useCourseStore';
import { X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, FadeInDown, FadeOutDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// Mock exercises for a lesson
const MOCK_EXERCISES = [
  {
    id: 'e1',
    type: 'translate',
    question: 'How do you say "Hello"?',
    options: ['Adiós', 'Hola', 'Gracias', 'Por favor'],
    answer: 'Hola'
  },
  {
    id: 'e2',
    type: 'translate',
    question: 'Translate: "I would like a coffee"',
    options: ['Quisiera un café', 'Me llamo café', '¿Dónde está el café?', 'Gracias por el café'],
    answer: 'Quisiera un café'
  }
];

export const LessonScreen = ({ route, navigation }: any) => {
  const { lessonId } = route.params;
  const { completeLesson } = useCourseStore();
  
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  
  const progressValue = useSharedValue(0);

  const currentExercise = MOCK_EXERCISES[currentExIndex];
  const isLast = currentExIndex === MOCK_EXERCISES.length - 1;

  // Animated progress bar
  const progressStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(`${progressValue.value}%`, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      })
    };
  });

  const handleCheck = () => {
    if (!selectedOption) return;
    setIsChecking(true);
  };

  const handleNext = () => {
    const newProgress = ((currentExIndex + 1) / MOCK_EXERCISES.length) * 100;
    progressValue.value = newProgress;
    
    if (isLast) {
      completeLesson(lessonId);
      navigation.goBack();
    } else {
      setSelectedOption(null);
      setIsChecking(false);
      setCurrentExIndex(prev => prev + 1);
    }
  };

  const handleQuit = () => {
    navigation.goBack();
  };

  const isCorrect = selectedOption === currentExercise.answer;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header / Progress */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.quitButton} onPress={handleQuit}>
          <X color={theme.colors.textSecondary} size={28} />
        </TouchableOpacity>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, progressStyle]} />
        </View>
      </View>

      {/* Main Exercise Area */}
      <View style={styles.exerciseContainer}>
        <Text style={styles.questionLabel}>Translate this phrase</Text>
        <Text style={styles.questionText}>{currentExercise.question}</Text>

        <View style={styles.optionsGrid}>
          {currentExercise.options.map((opt) => {
            const isSelected = selectedOption === opt;
            const showCorrect = isChecking && opt === currentExercise.answer;
            const showWrong = isChecking && isSelected && !isCorrect;

            let bgColor = theme.colors.surfaceDark;
            let borderColor = 'rgba(0, 0, 0, 0.1)';
            
            if (isSelected && !isChecking) {
              bgColor = 'rgba(193, 39, 45, 0.05)';
              borderColor = theme.colors.accentPrimary;
            } else if (showCorrect) {
              bgColor = 'rgba(123, 198, 126, 0.2)';
              borderColor = theme.colors.success;
            } else if (showWrong) {
              bgColor = 'rgba(232, 93, 117, 0.2)';
              borderColor = theme.colors.error;
            }

            return (
              <TouchableOpacity
                key={opt}
                disabled={isChecking}
                style={[styles.optionCard, { backgroundColor: bgColor, borderColor }]}
                onPress={() => setSelectedOption(opt)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.optionText, 
                  isSelected && !isChecking && { color: theme.colors.accentPrimary, fontWeight: '800' }
                ]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Bottom Feedback / Check Button */}
      {isChecking ? (
        <Animated.View 
          entering={FadeInDown} 
          exiting={FadeOutDown}
          style={[styles.feedbackContainer, isCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}
        >
          <View style={styles.feedbackHeader}>
            <Text style={[styles.feedbackTitle, isCorrect ? {color: theme.colors.success} : {color: theme.colors.error}]}>
              {isCorrect ? '¡Excelente!' : 'Incorrect'}
            </Text>
            {!isCorrect && <Text style={styles.feedbackCorrectAnswer}>Correct answer: {currentExercise.answer}</Text>}
          </View>
          <TouchableOpacity 
            style={[styles.checkButton, isCorrect ? {backgroundColor: theme.colors.success} : {backgroundColor: theme.colors.error}]} 
            onPress={handleNext}
          >
            <Text style={styles.checkButtonText}>Continue</Text>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <View style={styles.bottomBar}>
          <TouchableOpacity 
            style={[styles.checkButton, !selectedOption && styles.checkButtonDisabled]}
            disabled={!selectedOption}
            onPress={handleCheck}
          >
            <Text style={[styles.checkButtonText, !selectedOption && { color: theme.colors.textSecondary }]}>
              Check
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
  },
  quitButton: {
    padding: theme.spacing.xs,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.success,
    borderRadius: 6,
  },
  exerciseContainer: {
    flex: 1,
    padding: theme.spacing.xl,
    paddingTop: theme.spacing.xxl,
  },
  questionLabel: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  questionText: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: 32,
    color: theme.colors.textPrimary,
    fontWeight: '900',
    marginBottom: 32,
    letterSpacing: -0.5,
  },
  optionsGrid: {
    gap: theme.spacing.md,
  },
  optionCard: {
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    borderWidth: 2,
    alignItems: 'center',
  },
  optionText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 18,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  bottomBar: {
    padding: theme.spacing.xl,
  },
  checkButton: {
    backgroundColor: theme.colors.accentPrimary,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
  },
  checkButtonDisabled: {
    backgroundColor: theme.colors.surfaceDark,
  },
  checkButtonText: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  feedbackContainer: {
    padding: theme.spacing.xl,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
  },
  feedbackCorrect: {
    backgroundColor: 'rgba(123, 198, 126, 0.1)',
  },
  feedbackWrong: {
    backgroundColor: 'rgba(232, 93, 117, 0.1)',
  },
  feedbackHeader: {
    marginBottom: theme.spacing.lg,
  },
  feedbackTitle: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: theme.typography.sizes.xl,
    fontWeight: '700',
    marginBottom: 4,
  },
  feedbackCorrectAnswer: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.error,
  }
});
