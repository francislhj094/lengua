import { create } from 'zustand';
import { FirebaseUser } from '../services/firebase';

interface AuthState {
  user: FirebaseUser | null;
  isAuthenticated: boolean;
  setUser: (user: FirebaseUser | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  logout: () => set({ user: null, isAuthenticated: false }),
}));
