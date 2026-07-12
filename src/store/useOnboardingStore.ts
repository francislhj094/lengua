import { create } from 'zustand';

type OnboardingState = {
  motivation: string | null;
  dialect: 'spain' | 'latam' | null;
  dailyCommitment: number | null;
  setMotivation: (motivation: string) => void;
  setDialect: (dialect: 'spain' | 'latam') => void;
  setDailyCommitment: (minutes: number) => void;
  reset: () => void;
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  motivation: null,
  dialect: null,
  dailyCommitment: null,
  setMotivation: (motivation) => set({ motivation }),
  setDialect: (dialect) => set({ dialect }),
  setDailyCommitment: (minutes) => set({ dailyCommitment: minutes }),
  reset: () => set({ motivation: null, dialect: null, dailyCommitment: null }),
}));
