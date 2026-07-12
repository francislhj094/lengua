import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { theme } from '../../../core/theme';
import { useVocabStore, VocabCard } from '../../../store/useVocabStore';
import { ChevronLeft, Volume2, Info } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  interpolate, 
  Extrapolation,
  FadeIn
} from 'react-native-reanimated';

export const VocabScreen = ({ navigation }: any) => {
  const { getDueCards, reviewCard } = useVocabStore();
  const [dueCards, setDueCards] = useState<VocabCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Animation values
  const flipValue = useSharedValue(0); // 0 = front, 1 = back

  useEffect(() => {
    setDueCards(getDueCards());
  }, []);

  const currentCard = dueCards[currentIndex];

  const handleFlip = () => {
    setIsFlipped(true);
    flipValue.value = withTiming(1, { duration: 400 });
  };

  const playAudio = () => {
    if (currentCard) {
      Speech.speak(currentCard.front, { language: 'es-ES', rate: 0.8 });
    }
  };

  const handleAssessment = (quality: number) => {
    if (currentCard) {
      reviewCard(currentCard.id, quality);
    }
    
    // Reset flip and move to next
    setIsFlipped(false);
    flipValue.value = 0;
    
    if (currentIndex < dueCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Done with reviews
      navigation.goBack();
    }
  };

  // Front card style (0 to 90 degrees)
  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipValue.value, [0, 1], [0, 180], Extrapolation.CLAMP);
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateY}deg` }
      ],
      opacity: interpolate(flipValue.value, [0, 0.5], [1, 0], Extrapolation.CLAMP),
      position: 'absolute',
      width: '100%',
      height: '100%',
      zIndex: flipValue.value < 0.5 ? 1 : 0
    };
  });

  // Back card style (180 to 360 degrees)
  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipValue.value, [0, 1], [180, 360], Extrapolation.CLAMP);
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateY}deg` }
      ],
      opacity: interpolate(flipValue.value, [0.5, 1], [0, 1], Extrapolation.CLAMP),
      position: 'absolute',
      width: '100%',
      height: '100%',
      zIndex: flipValue.value >= 0.5 ? 1 : 0
    };
  });

  if (!currentCard) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ChevronLeft color={theme.colors.textPrimary} size={28} />
          </TouchableOpacity>
        </View>
        <View style={styles.doneContainer}>
          <Text style={styles.doneTitle}>All caught up!</Text>
          <Text style={styles.doneSubtitle}>You've finished your reviews for today.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft color={theme.colors.textPrimary} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review ({currentIndex + 1}/{dueCards.length})</Text>
        <View style={styles.backButton} />
      </View>

      {/* Card Area */}
      <View style={styles.cardContainer}>
        {/* FRONT */}
        <Animated.View style={[styles.card, frontAnimatedStyle]}>
          <Text style={styles.cardFrontText}>{currentCard.front}</Text>
          <TouchableOpacity style={styles.audioButton} onPress={playAudio}>
            <Volume2 color={theme.colors.accentPrimary} size={24} />
          </TouchableOpacity>
        </Animated.View>

        {/* BACK */}
        <Animated.View style={[styles.card, backAnimatedStyle]}>
          <Text style={styles.cardBackLabel}>Translation</Text>
          <Text style={styles.cardBackText}>{currentCard.back}</Text>
          
          <View style={styles.contextBox}>
            <Info color={theme.colors.textSecondary} size={16} />
            <Text style={styles.contextText}>{currentCard.context}</Text>
          </View>
        </Animated.View>
      </View>

      {/* Controls Area */}
      <View style={styles.controlsContainer}>
        {!isFlipped ? (
          <TouchableOpacity style={styles.revealButton} onPress={handleFlip} activeOpacity={0.8}>
            <Text style={styles.revealButtonText}>Reveal Answer</Text>
          </TouchableOpacity>
        ) : (
          <Animated.View entering={FadeIn} style={styles.assessmentRow}>
            <TouchableOpacity style={[styles.assessmentBtn, { backgroundColor: '#38384A' }]} onPress={() => handleAssessment(1)}>
              <Text style={styles.assessmentText}>Again</Text>
              <Text style={styles.assessmentTime}>1m</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.assessmentBtn, { backgroundColor: '#454559' }]} onPress={() => handleAssessment(3)}>
              <Text style={styles.assessmentText}>Hard</Text>
              <Text style={styles.assessmentTime}>1d</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.assessmentBtn, { backgroundColor: 'rgba(123, 198, 126, 0.2)' }]} onPress={() => handleAssessment(4)}>
              <Text style={[styles.assessmentText, { color: theme.colors.success }]}>Good</Text>
              <Text style={[styles.assessmentTime, { color: theme.colors.success }]}>3d</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.assessmentBtn, { backgroundColor: 'rgba(78, 205, 196, 0.2)' }]} onPress={() => handleAssessment(5)}>
              <Text style={[styles.assessmentText, { color: theme.colors.accentSecondary }]}>Easy</Text>
              <Text style={[styles.assessmentTime, { color: theme.colors.accentSecondary }]}>5d</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  backButton: {
    padding: theme.spacing.xs,
    width: 44,
  },
  headerTitle: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  cardContainer: {
    flex: 1,
    padding: theme.spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  card: {
    backgroundColor: theme.colors.surfaceDark,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  cardFrontText: {
    fontFamily: theme.typography.fonts.spanish,
    fontSize: theme.typography.sizes.hero,
    color: theme.colors.textPrimary,
    fontWeight: '700',
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  audioButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(232, 176, 89, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBackLabel: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
  },
  cardBackText: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: theme.typography.sizes.xxl,
    color: theme.colors.accentPrimary,
    fontWeight: '700',
    marginBottom: theme.spacing.xxl,
    textAlign: 'center',
  },
  contextBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    width: '100%',
  },
  contextText: {
    fontFamily: theme.typography.fonts.spanish,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  controlsContainer: {
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  revealButton: {
    backgroundColor: theme.colors.surfaceDark,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  revealButtonText: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  assessmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  assessmentBtn: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
  },
  assessmentText: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
  },
  assessmentTime: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
  doneContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneTitle: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.success,
    fontWeight: '700',
    marginBottom: 8,
  },
  doneSubtitle: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
  },
});
