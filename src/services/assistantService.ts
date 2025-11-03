import api from './api';

export interface Assistant {
  id: number;
  name: string;
  email: string;
  phone: string;
  qualification?: string;
  experience?: number;
  doctorId: number;
  userId?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMyAssistantProfileRequest {
  name: string;
  phone: string;
  doctorId: number;
  qualification?: string;
  experience?: number;
}

export const assistantService = {
  // Check if assistant profile exists
  async checkProfileExists(): Promise<boolean> {
    try {
      const response = await api.get('/assistants/check-profile');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  },

  // Get current assistant profile
  async getCurrentProfile(): Promise<Assistant> {
    const response = await api.get('/assistants/profile');
    return response.data;
  },

  // Create my assistant profile (self-service)
  async createMyProfile(profileData: CreateMyAssistantProfileRequest): Promise<Assistant> {
    const response = await api.post('/assistants/my-profile', profileData);
    return response.data;
  },
};

