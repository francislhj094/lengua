import { create } from 'zustand';

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export type LessonType = 'vocabulary' | 'grammar' | 'reading' | 'listening';

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  status: 'locked' | 'unlocked' | 'completed';
}

export interface Unit {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

interface CourseState {
  level: CEFRLevel;
  units: Unit[];
  activeLessonId: string | null;
  completeLesson: (lessonId: string) => void;
  sync: (uid: string) => Promise<void>;
}

const REAL_CURRICULUM: Unit[] = [
  {
    id: 'unit_1',
    title: 'Unit 1: The Basics',
    description: 'Survival phrases, greetings, and introductions.',
    lessons: [
      { id: 'l1', title: 'Hola y Adiós', type: 'vocabulary', status: 'completed' },
      { id: 'l2', title: 'Ser vs Estar (Intro)', type: 'grammar', status: 'completed' },
      { id: 'l3', title: 'Ordering a Coffee', type: 'reading', status: 'unlocked' },
      { id: 'l4', title: 'Numbers 1-100', type: 'vocabulary', status: 'locked' },
    ]
  },
  {
    id: 'unit_2',
    title: 'Unit 2: Daily Life',
    description: 'Routines, family, and hobbies.',
    lessons: [
      { id: 'l5', title: 'My Family', type: 'vocabulary', status: 'locked' },
      { id: 'l6', title: 'Present Tense Verbs (-ar)', type: 'grammar', status: 'locked' },
      { id: 'l7', title: 'Daily Routine', type: 'reading', status: 'locked' },
      { id: 'l8', title: 'Telling Time', type: 'vocabulary', status: 'locked' },
    ]
  },
  {
    id: 'unit_3',
    title: 'Unit 3: Food & Dining',
    description: 'Restaurant vocabulary, expressing likes/dislikes.',
    lessons: [
      { id: 'l9', title: 'Food & Drinks', type: 'vocabulary', status: 'locked' },
      { id: 'l10', title: 'Verbo Gustar', type: 'grammar', status: 'locked' },
      { id: 'l11', title: 'At the Restaurant', type: 'reading', status: 'locked' },
    ]
  },
  {
    id: 'unit_4',
    title: 'Unit 4: Travel & Directions (A2)',
    description: 'Navigating cities and booking hotels.',
    lessons: [
      { id: 'l12', title: 'Directions & Transport', type: 'vocabulary', status: 'locked' },
      { id: 'l13', title: 'The Preterite (Past Tense)', type: 'grammar', status: 'locked' },
      { id: 'l14', title: 'Checking into a Hotel', type: 'reading', status: 'locked' },
    ]
  },
  {
    id: 'unit_5',
    title: 'Unit 5: Health & Emergencies (A2)',
    description: 'Body parts, symptoms, and the imperfect tense.',
    lessons: [
      { id: 'l15', title: 'Body Parts & Symptoms', type: 'vocabulary', status: 'locked' },
      { id: 'l16', title: 'The Imperfect Tense', type: 'grammar', status: 'locked' },
      { id: 'l17', title: 'At the Pharmacy', type: 'reading', status: 'locked' },
    ]
  }
];

export const useCourseStore = create<CourseState>((set) => ({
  level: 'A1',
  units: REAL_CURRICULUM,
  activeLessonId: 'l3',
  
  completeLesson: (lessonId) => {
    set((state) => {
      let foundActive = false;
      let nextLessonId = state.activeLessonId;

      const newUnits = state.units.map(unit => ({
        ...unit,
        lessons: unit.lessons.map((lesson, idx, arr) => {
          if (lesson.id === lessonId) {
            foundActive = true;
            return { ...lesson, status: 'completed' as const };
          }
          // Unlock the next lesson in sequence
          if (foundActive && lesson.status === 'locked') {
            foundActive = false;
            nextLessonId = lesson.id;
            return { ...lesson, status: 'unlocked' as const };
          }
          return lesson;
        })
      }));

      // In a real app we'd also handle unlocking across units
      return { units: newUnits, activeLessonId: nextLessonId };
    });
  },
  
  sync: async (uid) => {
    const { FirebaseService } = await import('../services/firebase');
    // Using get() here is not possible inside create like this without the get function, 
    // Wait, the store provides 'get' if we add it. 
    // Let me check if useCourseStore uses 'get' 
    // Actually, I can just use useCourseStore.getState().units 
    const units = useCourseStore.getState().units;
    const activeLessonId = useCourseStore.getState().activeLessonId;
    await FirebaseService.syncUserData(uid, { units, activeLessonId });
  }
}));
