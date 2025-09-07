import api from './api';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '../types';

export const authService = {
  // Login user
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Register user
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Get current user profile
  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Logout user
  async logout(): Promise<void> {
    // For now, just remove token from localStorage
    // In a real app, you might want to call a logout endpoint
    localStorage.removeItem('token');
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem('token');
  },
};
