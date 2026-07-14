import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from './storage';

export interface UserGamificationState {
  xp: number;
  hearts: number;
  maxHearts: number;
  streak: number;
  lastActiveDate: string | null;
  isPremium: boolean;
  hasOnboarded: boolean;
  dialect: 'spain' | 'latin_american';
  weakWords: any[];
  setPremium: (status: boolean) => void;
  setHasOnboarded: (status: boolean) => void;
  setDialect: (dialect: 'spain' | 'latin_american') => void;
  gainXp: (amount: number) => void;
  loseHeart: () => void;
  refillHearts: () => void;
  restoreHeart: () => void;
  addWeakWord: (exercise: any) => void;
  removeWeakWord: (id: string) => void;
  updateStreak: () => void;
}

export const useUserStore = create<UserGamificationState>()(
  persist(
    (set, get) => ({
      xp: 0,
  hearts: 5,
  maxHearts: 5,
  streak: 0,
  lastActiveDate: null,
  isPremium: false,
  hasOnboarded: false,
  dialect: 'spain',
  weakWords: [],

  setPremium: (status: boolean) => set({ isPremium: status }),
  setHasOnboarded: (status: boolean) => set({ hasOnboarded: status }),
  setDialect: (dialect: 'spain' | 'latin_american') => set({ dialect }),

  gainXp: (amount: number) => set((state) => ({ xp: state.xp + amount })),

  loseHeart: () => set((state) => ({
    hearts: Math.max(0, state.hearts - 1),
    // Logic for setting nextHeartRegenTime could go here if implementing timers
  })),

  refillHearts: () => set({ hearts: 5 }),

  restoreHeart: () => set((state) => ({ hearts: Math.min(5, state.hearts + 1) })),

  addWeakWord: (exercise: any) => set((state) => {
    // Avoid duplicates by checking exercise ID
    const exists = state.weakWords.some((w: any) => w.id === exercise.id);
    if (exists) return state;
    return { weakWords: [...state.weakWords, exercise] };
  }),

  removeWeakWord: (id: string) => set((state) => ({
    weakWords: state.weakWords.filter((w: any) => w.id !== id)
  })),

  updateStreak: () => {
    const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
    const { lastActiveDate, streak } = get();

    if (lastActiveDate === today) {
      // Already active today, streak is unchanged
      return;
    }

    if (lastActiveDate) {
      // Check if last active was yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastActiveDate === yesterdayStr) {
        // Continue streak
        set({ streak: streak + 1, lastActiveDate: today });
      } else {
        // Streak broken
        set({ streak: 1, lastActiveDate: today });
      }
    } else {
      // First time
      set({ streak: 1, lastActiveDate: today });
    }
  }
}),
{
  name: 'user-storage',
  storage: createJSONStorage(() => zustandStorage),
}
));
