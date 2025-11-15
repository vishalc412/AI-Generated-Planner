import { create } from 'zustand';
import { User } from '@/types';
import { authService } from '@/services/auth.service';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, provider: 'google' | 'apple') => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,

  login: async (token: string, provider: 'google' | 'apple') => {
    set({ isLoading: true });
    try {
      const tokens =
        provider === 'google'
          ? await authService.loginWithGoogle(token)
          : await authService.loginWithApple(token);

      authService.saveTokens(tokens);

      const user = await authService.getCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    authService.clearTokens();
    set({ user: null, isAuthenticated: false });
  },

  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const user = await authService.getCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false, isAuthenticated: false });
      throw error;
    }
  },

  updateUser: async (data: Partial<User>) => {
    try {
      const user = await authService.updateProfile(data);
      set({ user });
    } catch (error) {
      throw error;
    }
  },
}));
