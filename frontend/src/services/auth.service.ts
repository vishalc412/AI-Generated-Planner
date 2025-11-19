import { api } from './api';
import { AuthTokens, User } from '@/types';

export const authService = {
  async loginWithGoogle(token: string): Promise<AuthTokens> {
    const response = await api.post<AuthTokens>('/auth/google', { token });
    return response.data;
  },

  async loginWithApple(token: string): Promise<AuthTokens> {
    const response = await api.post<AuthTokens>('/auth/apple', { token });
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/users/me');
    return response.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put<User>('/users/me', data);
    return response.data;
  },

  saveTokens(tokens: AuthTokens): void {
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
  },

  clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  },

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  },
};
