import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { theme } from '../../../core/theme';
import { Flame, BookOpen, Target, Calendar, ArrowRight, Sparkles, BrainCircuit } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useCourseStore } from '../../../store/useCourseStore';
import { useUserStore } from '../../../store/useUserStore';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { NotificationService } from '../../../services/notifications';

export const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const { units, activeLessonId } = useCourseStore();
  const { isPremium, freeLessonsUsed, incrementFreeLessonsUsed } = useUserStore();

  const handleStartLesson = (lessonId: string) => {
    if (!isPremium && freeLessonsUsed >= 2) {
      navigation.navigate('Paywall');
      return;
    }
    if (!isPremium) {
      incrementFreeLessonsUsed();
    }
    navigation.navigate('Lesson', { lessonId });
  };

  useEffect(() => {
    NotificationService.requestPermissionsAsync().catch(console.error);
  }, []);

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
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} bounces={true}>
          
          {/* Header section */}
          <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.header}>
            <View>
              <Text style={styles.greeting}>Hola, Learner</Text>
              <Text style={styles.subGreeting}>Let's hit your daily goal.</Text>
            </View>
            <TouchableOpacity activeOpacity={0.8}>
              <View style={styles.streakBadge}>
                <Flame color={theme.colors.accentPrimary} size={22} fill={theme.colors.accentPrimary} />
                <Text style={styles.streakText}>5</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Hero "Up Next" Card */}
          <Animated.View entering={FadeInDown.duration(600).delay(100).springify()} style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Up Next</Text>
            </View>
            
            <TouchableOpacity 
              activeOpacity={0.9} 
              onPress={() => handleStartLesson(activeLesson.id)}
              style={styles.heroCardContainer}
            >
              <LinearGradient
                colors={['#D9383E', theme.colors.accentPrimary]}
                style={styles.heroCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {/* Floating decorative elements */}
                <View style={styles.heroGlow} />
                
                <View style={styles.heroTopRow}>
                  <View style={styles.heroIconBox}>
                    <BookOpen color="#FFFFFF" size={24} />
                  </View>
                  <View style={styles.heroPill}>
                    <Text style={styles.heroPillText}>CONTINUE</Text>
                  </View>
                </View>

                <View style={styles.heroTextContent}>
                  <Text style={styles.heroSubtitle}>{activeUnit.title}</Text>
                  <Text style={styles.heroTitle}>{activeLesson.title}</Text>
                </View>

                <View style={styles.progressContainer}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Lesson Progress</Text>
                    <Text style={styles.progressPercent}>40%</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View
                      style={[styles.progressFill, { width: '40%', backgroundColor: '#FFFFFF' }]}
                    />
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Daily Quests / Vocab Review */}
          <Animated.View entering={FadeInDown.duration(600).delay(200).springify()} style={styles.section}>
            <Text style={styles.sectionTitle}>Daily Practice</Text>
            
            <TouchableOpacity 
              style={styles.challengeCard} 
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Vocab')}
            >
              <View style={styles.challengeLeft}>
                <View style={styles.vocabIconBox}>
                  <BrainCircuit color={theme.colors.primaryDark} size={22} />
                </View>
                <View style={{ marginLeft: 16 }}>
                  <Text style={styles.cardTitle}>Spaced Repetition</Text>
                  <Text style={styles.cardSubtitle}>3 words due for review</Text>
                </View>
              </View>
              <View style={styles.actionPill}>
                <Text style={styles.actionPillText}>Review</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.challengeCard, { marginTop: 12 }]} 
              activeOpacity={0.85}
            >
              <View style={styles.challengeLeft}>
                <View style={[styles.vocabIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                  <Target color="#EF4444" size={22} />
                </View>
                <View style={{ marginLeft: 16 }}>
                  <Text style={styles.cardTitle}>Daily Goal</Text>
                  <Text style={styles.cardSubtitle}>15 / 50 XP Earned</Text>
                </View>
              </View>
              <ArrowRight color={theme.colors.textSecondary} size={20} />
            </TouchableOpacity>
          </Animated.View>

        </ScrollView>
      </SafeAreaView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primaryDark,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: Platform.OS === 'ios' ? theme.spacing.lg : theme.spacing.xl,
    paddingBottom: 100, // padding for bottom tab bar
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 8,
  },
  greeting: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: 28,
    color: theme.colors.textPrimary,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subGreeting: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 15,
    color: theme.colors.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.05)',
    borderBottomWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: '#FFFFFF',
  },
  streakText: {
    fontFamily: theme.typography.fonts.headline,
    color: theme.colors.accentPrimary,
    fontWeight: '900',
    fontSize: 18,
    marginLeft: 6,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: 20,
    color: theme.colors.textPrimary,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  heroCardContainer: {
    shadowColor: theme.colors.accentPrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  heroCard: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderBottomWidth: 5,
    borderBottomColor: 'rgba(0,0,0,0.2)',
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 75,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  heroIconBox: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: 'rgba(232, 176, 89, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(232, 176, 89, 0.2)',
  },
  heroPill: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  heroPillText: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 1,
  },
  heroTextContent: {
    marginBottom: 24,
  },
  heroSubtitle: {
    fontFamily: theme.typography.fonts.body,
    color: 'rgba(232, 176, 89, 0.8)',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  heroTitle: {
    fontFamily: theme.typography.fonts.headline,
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  progressContainer: {
    width: '100%',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
  progressPercent: {
    fontFamily: theme.typography.fonts.headline,
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  progressTrack: {
    height: 12, // Taller for chunkier look
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  challengeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.08)',
    borderBottomWidth: 4, // 3D Effect
  },
  challengeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  vocabIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(193, 39, 45, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontFamily: theme.typography.fonts.headline,
    color: theme.colors.textPrimary,
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontFamily: theme.typography.fonts.body,
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  actionPill: {
    backgroundColor: 'rgba(193, 39, 45, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  actionPillText: {
    fontFamily: theme.typography.fonts.headline,
    color: theme.colors.accentPrimary,
    fontWeight: '800',
    fontSize: 13,
  }
});
