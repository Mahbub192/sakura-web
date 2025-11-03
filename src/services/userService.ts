import api from './api';
import { User } from '../types';

export interface CreateMyUserProfileRequest {
  firstName: string;
  lastName: string;
  phone?: string;
}

export const userService = {
  // Update my user profile
  async updateMyProfile(profileData: CreateMyUserProfileRequest): Promise<User> {
    const response = await api.patch('/users/my-profile', profileData);
    return response.data;
  },

  // Admin: Get all users
  async getAllUsers(): Promise<User[]> {
    const response = await api.get('/users');
    return response.data;
  },

  // Admin: Create user account
  async createUser(userData: any): Promise<User> {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // Admin: Activate user
  async activateUser(id: number): Promise<User> {
    const response = await api.patch(`/users/${id}/activate`);
    return response.data;
  },

  // Admin: Deactivate user
  async deactivateUser(id: number): Promise<User> {
    const response = await api.patch(`/users/${id}/deactivate`);
    return response.data;
  },

  // Admin: Update user
  async updateUser(id: number, userData: any): Promise<User> {
    const response = await api.patch(`/users/${id}`, userData);
    return response.data;
  },

  // Admin: Delete user
  async deleteUser(id: number): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};

