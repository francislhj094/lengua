import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from './storage';

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
    "id": "unit_1",
    "title": "Unit 1: The Essentials",
    "description": "Survival phrases, greetings, and basic communication.",
    "lessons": [
      {
        "id": "l1",
        "title": "Basic Greetings",
        "type": "vocabulary",
        "status": "completed"
      },
      {
        "id": "l2",
        "title": "Numbers 1-10",
        "type": "vocabulary",
        "status": "completed"
      },
      {
        "id": "l3",
        "title": "Common Phrases",
        "type": "listening",
        "status": "unlocked"
      },
      {
        "id": "l4",
        "title": "At the Restaurant",
        "type": "reading",
        "status": "unlocked"
      },
      {
        "id": "l5",
        "title": "Directions & Places",
        "type": "vocabulary",
        "status": "unlocked"
      }
    ]
  },
  {
    "id": "unit_2",
    "title": "Unit 2: Practical Daily Vocabulary",
    "description": "Vocabulary necessary for daily transactions and living situations.",
    "lessons": [
      {
        "id": "l6",
        "title": "Numbers & Prices",
        "type": "vocabulary",
        "status": "unlocked"
      },
      {
        "id": "l7",
        "title": "Time & Days",
        "type": "vocabulary",
        "status": "unlocked"
      },
      {
        "id": "l8",
        "title": "Family Members",
        "type": "vocabulary",
        "status": "unlocked"
      },
      {
        "id": "l9",
        "title": "Colors & Descriptions",
        "type": "grammar",
        "status": "unlocked"
      },
      {
        "id": "l10",
        "title": "Weather & Seasons",
        "type": "listening",
        "status": "unlocked"
      },
      {
        "id": "l11",
        "title": "Shopping Basics",
        "type": "vocabulary",
        "status": "unlocked"
      },
      {
        "id": "l12",
        "title": "Transportation",
        "type": "reading",
        "status": "unlocked"
      },
      {
        "id": "l13",
        "title": "At the Hotel",
        "type": "listening",
        "status": "unlocked"
      },
      {
        "id": "l14",
        "title": "Body Parts & Health",
        "type": "vocabulary",
        "status": "unlocked"
      },
      {
        "id": "l15",
        "title": "Food & Drinks",
        "type": "vocabulary",
        "status": "unlocked"
      }
    ]
  },
  {
    "id": "unit_3",
    "title": "Unit 3: Foundational Grammar & Culture",
    "description": "Essential grammatical building blocks with Spanish cultural context.",
    "lessons": [
      {
        "id": "l16",
        "title": "Basic Verbs (-ar, -er, -ir)",
        "type": "grammar",
        "status": "unlocked"
      },
      {
        "id": "l17",
        "title": "Adjectives & Gender",
        "type": "grammar",
        "status": "unlocked"
      },
      {
        "id": "l18",
        "title": "Question Words",
        "type": "vocabulary",
        "status": "unlocked"
      },
      {
        "id": "l19",
        "title": "Subject Pronouns",
        "type": "grammar",
        "status": "unlocked"
      },
      {
        "id": "l20",
        "title": "Possessives",
        "type": "grammar",
        "status": "unlocked"
      },
      {
        "id": "l21",
        "title": "Plazas & City Life",
        "type": "reading",
        "status": "unlocked"
      },
      {
        "id": "l22",
        "title": "Tapas Etiquette",
        "type": "listening",
        "status": "unlocked"
      },
      {
        "id": "l23",
        "title": "Siesta & Lifestyle",
        "type": "reading",
        "status": "unlocked"
      },
      {
        "id": "l24",
        "title": "Markets & Bargaining",
        "type": "vocabulary",
        "status": "unlocked"
      },
      {
        "id": "l25",
        "title": "Making Friends",
        "type": "listening",
        "status": "unlocked"
      }
    ]
  },
  {
    "id": "unit_4",
    "title": "Unit 4: Intermediate Communication",
    "description": "Focusing on expressing oneself, handling complex situations, and tenses.",
    "lessons": [
      {
        "id": "l26",
        "title": "Emergencies",
        "type": "vocabulary",
        "status": "unlocked"
      },
      {
        "id": "l27",
        "title": "Phone Conversations",
        "type": "listening",
        "status": "unlocked"
      },
      {
        "id": "l28",
        "title": "Emotions & Feelings",
        "type": "vocabulary",
        "status": "unlocked"
      },
      {
        "id": "l29",
        "title": "Hobbies & Interests",
        "type": "reading",
        "status": "unlocked"
      },
      {
        "id": "l30",
        "title": "Work & Occupation",
        "type": "vocabulary",
        "status": "unlocked"
      },
      {
        "id": "l31",
        "title": "Simple Sentences",
        "type": "grammar",
        "status": "unlocked"
      },
      {
        "id": "l32",
        "title": "Negation",
        "type": "grammar",
        "status": "unlocked"
      },
      {
        "id": "l33",
        "title": "Past Tense (Preterite)",
        "type": "grammar",
        "status": "unlocked"
      },
      {
        "id": "l34",
        "title": "Future Tense",
        "type": "grammar",
        "status": "unlocked"
      },
      {
        "id": "l35",
        "title": "Comparisons",
        "type": "grammar",
        "status": "unlocked"
      }
    ]
  },
  {
    "id": "unit_5",
    "title": "Unit 5: Spanish Culture & Living",
    "description": "Cultural appreciation and logistics of staying in Spain longer-term.",
    "lessons": [
      {
        "id": "l36",
        "title": "Spanish Culture & Customs",
        "type": "reading",
        "status": "unlocked"
      },
      {
        "id": "l37",
        "title": "Festivals (La Tomatina, Fallas)",
        "type": "listening",
        "status": "unlocked"
      },
      {
        "id": "l38",
        "title": "Geography of Spain",
        "type": "vocabulary",
        "status": "unlocked"
      },
      {
        "id": "l39",
        "title": "Music & Dance (Flamenco)",
        "type": "reading",
        "status": "unlocked"
      },
      {
        "id": "l40",
        "title": "Crafts & Arts",
        "type": "vocabulary",
        "status": "unlocked"
      },
      {
        "id": "l41",
        "title": "At the Bank",
        "type": "vocabulary",
        "status": "unlocked"
      },
      {
        "id": "l42",
        "title": "At the Post Office",
        "type": "listening",
        "status": "unlocked"
      },
      {
        "id": "l43",
        "title": "Renting an Apartment (Piso)",
        "type": "reading",
        "status": "unlocked"
      },
      {
        "id": "l44",
        "title": "Cooking & Recipes",
        "type": "listening",
        "status": "unlocked"
      },
      {
        "id": "l45",
        "title": "Sports & Football (La Liga)",
        "type": "vocabulary",
        "status": "unlocked"
      }
    ]
  },
  {
    "id": "unit_6",
    "title": "Unit 6: Advanced Interpersonal Skills",
    "description": "Focusing on polite interactions and wrapping up the starter segment.",
    "lessons": [
      {
        "id": "l46",
        "title": "Expressing Opinions",
        "type": "grammar",
        "status": "unlocked"
      },
      {
        "id": "l47",
        "title": "Making Requests (Polite)",
        "type": "listening",
        "status": "unlocked"
      },
      {
        "id": "l48",
        "title": "Giving Directions",
        "type": "vocabulary",
        "status": "unlocked"
      },
      {
        "id": "l49",
        "title": "Making Appointments",
        "type": "reading",
        "status": "unlocked"
      },
      {
        "id": "l50",
        "title": "Review: Starter Lessons",
        "type": "grammar",
        "status": "unlocked"
      }
    ]
  },
  {
    "id": "unit_7",
    "title": "Unit 7: Professional & Formal Contexts",
    "description": "Contrasting everyday street talk with formal language (Usted vs Tú).",
    "lessons": [
      {
        "id": "l51",
        "title": "Formal Spanish (Usted)",
        "type": "grammar",
        "status": "unlocked"
      },
      {
        "id": "l52",
        "title": "Informal & Slang (Tío/Guay)",
        "type": "vocabulary",
        "status": "unlocked"
      },
      {
        "id": "l53",
        "title": "Business Spanish",
        "type": "reading",
        "status": "unlocked"
      },
      {
        "id": "l54",
        "title": "Medical Vocabulary",
        "type": "vocabulary",
        "status": "unlocked"
      },
      {
        "id": "l55",
        "title": "Legal Basics",
        "type": "reading",
        "status": "unlocked"
      }
    ]
  },
  {
    "id": "unit_8",
    "title": "Unit 8: Advanced Grammar & Word Mechanics",
    "description": "Deep dive into the mechanics of Spanish, building complex sentences.",
    "lessons": [
      {
        "id": "l56",
        "title": "Complex Sentences",
        "type": "grammar",
        "status": "unlocked"
      },
      {
        "id": "l57",
        "title": "Passive Voice",
        "type": "grammar",
        "status": "unlocked"
      },
      {
        "id": "l58",
        "title": "Conditional Sentences",
        "type": "grammar",
        "status": "unlocked"
      },
      {
        "id": "l59",
        "title": "Relative Clauses (Que/Quien)",
        "type": "grammar",
        "status": "unlocked"
      },
      {
        "id": "l60",
        "title": "Conjunctions",
        "type": "vocabulary",
        "status": "unlocked"
      },
      {
        "id": "l61",
        "title": "Por vs. Para",
        "type": "grammar",
        "status": "unlocked"
      },
      {
        "id": "l62",
        "title": "Ser vs. Estar (Advanced)",
        "type": "grammar",
        "status": "unlocked"
      },
      {
        "id": "l63",
        "title": "The Subjunctive Mood",
        "type": "grammar",
        "status": "unlocked"
      },
      {
        "id": "l64",
        "title": "Subjunctive with Doubt",
        "type": "grammar",
        "status": "unlocked"
      },
      {
        "id": "l65",
        "title": "Idioms & Proverbs (Refranes)",
        "type": "vocabulary",
        "status": "unlocked"
      }
    ]
  },
  {
    "id": "unit_9",
    "title": "Unit 9: Media, Entertainment & Literature",
    "description": "Consuming native media and understanding cultural expression.",
    "lessons": [
      {
        "id": "l66",
        "title": "News & Media",
        "type": "reading",
        "status": "unlocked"
      },
      {
        "id": "l67",
        "title": "Social Media Spanish",
        "type": "vocabulary",
        "status": "unlocked"
      },
      {
        "id": "l68",
        "title": "Spanish Cinema (Almodóvar)",
        "type": "listening",
        "status": "unlocked"
      },
      {
        "id": "l69",
        "title": "Literature (Cervantes)",
        "type": "reading",
        "status": "unlocked"
      },
      {
        "id": "l70",
        "title": "Humor & Jokes",
        "type": "listening",
        "status": "unlocked"
      }
    ]
  },
  {
    "id": "unit_10",
    "title": "Unit 10: Linguistic Origins & Variations",
    "description": "Fascinating look into how history shaped the Spanish language.",
    "lessons": [
      {
        "id": "l71",
        "title": "Regional Variations (Accents)",
        "type": "listening",
        "status": "unlocked"
      },
      {
        "id": "l72",
        "title": "Latin Roots",
        "type": "grammar",
        "status": "unlocked"
      },
      {
        "id": "l73",
        "title": "Arabic Influences (Al-Andalus)",
        "type": "vocabulary",
        "status": "unlocked"
      },
      {
        "id": "l74",
        "title": "Castellano vs. Andaluz",
        "type": "listening",
        "status": "unlocked"
      },
      {
        "id": "l75",
        "title": "Loanwords & Spanglish",
        "type": "vocabulary",
        "status": "unlocked"
      }
    ]
  },
  {
    "id": "unit_11",
    "title": "Unit 11: Expat Business & Logistics",
    "description": "Practical lessons for expats looking to settle in Spain.",
    "lessons": [
      {
        "id": "l76",
        "title": "Real Estate & Mortgages",
        "type": "vocabulary",
        "status": "unlocked"
      },
      {
        "id": "l77",
        "title": "Immigration & NIE/Visas",
        "type": "reading",
        "status": "unlocked"
      },
      {
        "id": "l78",
        "title": "Starting a Business (Autónomo)",
        "type": "vocabulary",
        "status": "unlocked"
      },
      {
        "id": "l79",
        "title": "Hiring & Employment",
        "type": "grammar",
        "status": "unlocked"
      },
      {
        "id": "l80",
        "title": "Contracts & Agreements",
        "type": "reading",
        "status": "unlocked"
      }
    ]
  },
  {
    "id": "unit_12",
    "title": "Unit 12: Advanced Expression & Speaking",
    "description": "Formulating complex arguments, telling stories, and public speaking.",
    "lessons": [
      {
        "id": "l81",
        "title": "Advanced Dialogues 1",
        "type": "listening",
        "status": "unlocked"
      },
      {
        "id": "l82",
        "title": "Advanced Dialogues 2",
        "type": "listening",
        "status": "unlocked"
      },
      {
        "id": "l83",
        "title": "Debate & Discussion",
        "type": "grammar",
        "status": "unlocked"
      },
      {
        "id": "l84",
        "title": "Storytelling Techniques",
        "type": "reading",
        "status": "unlocked"
      },
      {
        "id": "l85",
        "title": "Presentations & Pitches",
        "type": "vocabulary",
        "status": "unlocked"
      }
    ]
  },
  {
    "id": "unit_13",
    "title": "Unit 13: Religion, History & Philosophy",
    "description": "A deep dive into the historical and spiritual core of Spain.",
    "lessons": [
      {
        "id": "l86",
        "title": "Catholicism in Spain",
        "type": "vocabulary",
        "status": "unlocked"
      },
      {
        "id": "l87",
        "title": "Semana Santa (Holy Week)",
        "type": "reading",
        "status": "unlocked"
      },
      {
        "id": "l88",
        "title": "The Spanish Civil War",
        "type": "listening",
        "status": "unlocked"
      },
      {
        "id": "l89",
        "title": "Traditions & Superstitions",
        "type": "vocabulary",
        "status": "unlocked"
      },
      {
        "id": "l90",
        "title": "Philosophy & Worldview",
        "type": "reading",
        "status": "unlocked"
      }
    ]
  },
  {
    "id": "unit_14",
    "title": "Unit 14: Traditional Life & Regions",
    "description": "Vocabulary tied to traditional industries, regions, and heritage.",
    "lessons": [
      {
        "id": "l91",
        "title": "Agriculture & Olive Farming",
        "type": "vocabulary",
        "status": "unlocked"
      },
      {
        "id": "l92",
        "title": "Coastal Life & Fishing",
        "type": "reading",
        "status": "unlocked"
      },
      {
        "id": "l93",
        "title": "Wine Country (Rioja)",
        "type": "listening",
        "status": "unlocked"
      },
      {
        "id": "l94",
        "title": "Moorish Architecture",
        "type": "vocabulary",
        "status": "unlocked"
      },
      {
        "id": "l95",
        "title": "Textiles & Fashion",
        "type": "reading",
        "status": "unlocked"
      }
    ]
  },
  {
    "id": "unit_15",
    "title": "Unit 15: Mastery & Final Assessments",
    "description": "The culmination of the course, putting everything into practice.",
    "lessons": [
      {
        "id": "l96",
        "title": "Advanced Review 1",
        "type": "grammar",
        "status": "unlocked"
      },
      {
        "id": "l97",
        "title": "Advanced Review 2",
        "type": "grammar",
        "status": "unlocked"
      },
      {
        "id": "l98",
        "title": "Fluency Practice 1",
        "type": "listening",
        "status": "unlocked"
      },
      {
        "id": "l99",
        "title": "Fluency Practice 2",
        "type": "listening",
        "status": "unlocked"
      },
      {
        "id": "l100",
        "title": "Graduation & Certificate",
        "type": "reading",
        "status": "unlocked"
      }
    ]
  }
];

export const useCourseStore = create<CourseState>()(
  persist(
    (set) => ({
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
}),
{
  name: 'course-storage',
  storage: createJSONStorage(() => zustandStorage),
  version: 1,
}
));
