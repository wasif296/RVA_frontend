import { create } from 'zustand';
import type { AuthUser } from '../features/auth/types';

export type AuthStatus = 'bootstrapping' | 'authenticated' | 'unauthenticated';

type AuthState = {
  user: AuthUser | null;
  /** Access JWT — memory only. Never persist to localStorage/sessionStorage. */
  accessToken: string | null;
  status: AuthStatus;
  setSession: (user: AuthUser, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  setUser: (user: AuthUser) => void;
  clearSession: () => void;
  setStatus: (status: AuthStatus) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  status: 'bootstrapping',
  setSession: (user, accessToken) =>
    set({ user, accessToken, status: 'authenticated' }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setUser: (user) => set({ user }),
  clearSession: () =>
    set({ user: null, accessToken: null, status: 'unauthenticated' }),
  setStatus: (status) => set({ status }),
}));
