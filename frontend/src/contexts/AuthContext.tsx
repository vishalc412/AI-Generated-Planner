import React, { createContext, useContext, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, provider: 'google' | 'apple') => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isAuthenticated, isLoading, login, logout, fetchUser } =
    useAuthStore();

  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchUser().catch(() => {
        logout();
      });
    }
  }, [isAuthenticated, user]);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
