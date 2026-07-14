import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions, ScrollView, Alert } from 'react-native';
import { theme } from '../../../core/theme';
import { useCourseStore } from '../../../store/useCourseStore';
import { X, Volume2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, FadeInDown, FadeOutDown } from 'react-native-reanimated';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import * as StoreReview from 'expo-store-review';
import { useUserStore } from '../../../store/useUserStore';
import { NotificationService } from '../../../services/notifications';

const { width } = Dimensions.get('window');

import { LESSON_DATA } from '../../../data/lessons';

export const LessonScreen = ({ route, navigation }: any) => {
  const { lessonId, reviewMode } = route.params;
  const { completeLesson } = useCourseStore();
  const { gainXp, loseHeart, updateStreak, hearts, weakWords, addWeakWord, removeWeakWord, restoreHeart } = useUserStore();
  
  // In review mode, pull from weak words (max 5)
  const [exercises] = useState(
    reviewMode 
      ? weakWords.slice(0, 5) 
      : (LESSON_DATA[lessonId || 'l1'] || LESSON_DATA['l1'])
  );
  
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // Keep track of words they got right in this review session
  const [masteredIds, setMasteredIds] = useState<string[]>([]);
  
  const progressValue = useSharedValue(0);

  const currentExercise = exercises[currentExIndex];
  const isLast = currentExIndex === exercises.length - 1;

  // Animated progress bar
  const progressStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(`${progressValue.value}%`, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      })
    };
  });

  useEffect(() => {
    if (hearts <= 0) {
      Alert.alert(
        "Out of Hearts! 💔",
        "You've run out of hearts. Take a break or practice to restore them.",
        [{ text: "Quit Lesson", onPress: () => navigation.goBack() }]
      );
    }
  }, [hearts]);

  const handleCheck = () => {
    if (!selectedOption) return;
    setIsChecking(true);
    
    const correct = 'answer' in currentExercise ? selectedOption === currentExercise.answer : false;
    
    if (correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (reviewMode) {
        setMasteredIds(prev => [...prev, currentExercise.id]);
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      if (!reviewMode) {
        // Add to weak words if failed during normal lesson
        addWeakWord(currentExercise);
      }
      loseHeart();
    }
  };

  const handleNext = () => {
    const newProgress = ((currentExIndex + 1) / exercises.length) * 100;
    progressValue.value = newProgress;
    
    if (isLast) {
      if (reviewMode) {
        // Restore exactly 1 heart per review session
        restoreHeart();
        masteredIds.forEach(id => removeWeakWord(id));
      } else {
        gainXp(10);
        updateStreak();
        completeLesson(lessonId);
        // Reschedule the gamified retention push notifications whenever they complete a standard lesson
        NotificationService.scheduleRetentionReminders().catch(console.error);

        // Gamified In-App Review (ASO Engine)
        // If the user has proven they like the app (streak >= 3), ask for a 5-star review at the moment of maximum dopamine.
        StoreReview.isAvailableAsync().then((isAvailable) => {
          if (isAvailable) {
            const currentStreak = useUserStore.getState().streak;
            if (currentStreak >= 3) {
              StoreReview.requestReview().catch(console.error);
            }
          }
        });
      }
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

  const isCorrect = 'answer' in currentExercise ? selectedOption === currentExercise.answer : false;

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
      <ScrollView 
        style={styles.exerciseContainer}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {currentExercise.type === 'teach' ? (
          <View style={styles.teachContainer}>
            <View style={styles.teachCard}>
              <Text style={styles.teachWord}>{currentExercise.word}</Text>
              {currentExercise.phonetic && (
                <Text style={styles.teachPhonetic}>[{currentExercise.phonetic}]</Text>
              )}
              
              <TouchableOpacity 
                style={styles.audioButton}
                onPress={() => Speech.speak(currentExercise.word, { language: 'es-ES' })}
                activeOpacity={0.8}
              >
                <Volume2 color="#FFFFFF" size={32} />
              </TouchableOpacity>
              
              <View style={styles.teachDivider} />
              
              <Text style={styles.teachTranslationLabel}>MEANS</Text>
              <Text style={styles.teachTranslation}>{currentExercise.translation}</Text>

              {currentExercise.example && (
                <View style={styles.exampleContainer}>
                  <Text style={styles.exampleLabel}>EXAMPLE</Text>
                  <Text style={styles.exampleText}>"{currentExercise.example}"</Text>
                  <Text style={styles.exampleTranslation}>{currentExercise.exampleTranslation}</Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          <>
            <Text style={styles.questionLabel}>Translate this phrase</Text>
            <Text style={styles.questionText}>{currentExercise.question}</Text>

            <View style={styles.optionsGrid}>
              {currentExercise.options?.map((opt: string) => {
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
          </>
        )}
      </ScrollView>

      {/* Bottom Feedback / Check Button */}
      {currentExercise.type === 'teach' ? (
        <View style={styles.bottomBar}>
          <TouchableOpacity 
            style={styles.checkButton}
            onPress={handleNext}
          >
            <Text style={styles.checkButtonText}>Got it</Text>
          </TouchableOpacity>
        </View>
      ) : isChecking ? (
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
            style={[
              styles.checkButton, 
              isCorrect ? { backgroundColor: theme.colors.success, borderColor: '#3FA34D' } 
                        : { backgroundColor: theme.colors.error, borderColor: '#C93B4E' }
            ]} 
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
  teachContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  teachLabel: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: 16,
    color: theme.colors.accentPrimary,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 24,
  },
  teachCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    width: '100%',
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.05)',
    borderBottomWidth: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  teachWord: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: 40,
    color: theme.colors.textPrimary,
    fontWeight: '900',
    marginBottom: 4,
    textAlign: 'center',
  },
  teachPhonetic: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  teachDivider: {
    width: '100%',
    height: 2,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 16,
  },
  teachTranslationLabel: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 8,
  },
  teachTranslation: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: 24,
    color: theme.colors.accentPrimary,
    fontWeight: '800',
    marginBottom: 16,
    textAlign: 'center',
  },
  exampleContainer: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  exampleLabel: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  exampleText: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: 16,
    color: theme.colors.textPrimary,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  exampleTranslation: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  audioButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#B8262C',
    borderBottomWidth: 6,
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
    borderWidth: 2,
    borderColor: '#B8262C',
    borderBottomWidth: 6,
  },
  checkButtonDisabled: {
    backgroundColor: theme.colors.surfaceDark,
    borderColor: 'rgba(0,0,0,0.1)',
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
    backgroundColor: '#E6F4EA',
  },
  feedbackWrong: {
    backgroundColor: '#FCE8E6',
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
