import { create } from 'zustand';

import type { AuthUser } from '@/types/auth';

type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';

type AuthState = {
  user: AuthUser | null;
  status: AuthStatus;

  setAuthenticated: (user: AuthUser) => void;
  setUnauthenticated: () => void;

  updateUser: (user: Partial<AuthUser>) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'checking',

  setAuthenticated: (user) => {
    set({
      user,
      status: 'authenticated',
    });
  },

  setUnauthenticated: () => {
    set({
      user: null,
      status: 'unauthenticated',
    });
  },

  updateUser: (updateUser) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updateUser } : null,
    })),
}));
