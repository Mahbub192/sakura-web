import api from './api';

export interface Assistant {
  id: number;
  name: string;
  email: string;
  phone: string;
  qualification?: string;
  experience?: number;
  doctorId: number;
  doctor?: {
    id: number;
    name: string;
    specialization: string;
  };
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

export interface CreateAssistantRequest {
  name: string;
  email: string;
  phone: string;
  qualification?: string;
  experience?: number;
}

export interface UpdateAssistantRequest {
  name?: string;
  email?: string;
  phone?: string;
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
      // If 403 (Forbidden) or 404 (Not Found), assume profile doesn't exist
      if (error.response?.status === 404 || error.response?.status === 403) {
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

  // Update my assistant profile (self-service)
  async updateMyProfile(profileData: { name?: string; qualification?: string; experience?: number }): Promise<Assistant> {
    const response = await api.patch('/assistants/my-profile', profileData);
    return response.data;
  },

  // Get all assistants (for current doctor)
  async getAssistants(): Promise<Assistant[]> {
    const response = await api.get('/assistants');
    return response.data;
  },

  // Get assistant by ID
  async getAssistantById(id: number): Promise<Assistant> {
    const response = await api.get(`/assistants/${id}`);
    return response.data;
  },

  // Create assistant (Doctor only)
  async createAssistant(assistantData: CreateAssistantRequest): Promise<Assistant> {
    // Remove password and doctorId as backend doesn't expect them
    // Backend automatically gets doctorId from current user and creates user with default password
    const { password, doctorId, ...requestData } = assistantData as any;
    const response = await api.post('/assistants', requestData);
    return response.data;
  },

  // Update assistant
  async updateAssistant(id: number, assistantData: UpdateAssistantRequest): Promise<Assistant> {
    const response = await api.patch(`/assistants/${id}`, assistantData);
    return response.data;
  },

  // Delete assistant
  async deleteAssistant(id: number): Promise<void> {
    await api.delete(`/assistants/${id}`);
  },

  // Toggle assistant status
  async toggleStatus(id: number): Promise<Assistant> {
    const response = await api.patch(`/assistants/${id}/toggle-status`);
    return response.data;
  },

  // Change assistant password
  async changePassword(id: number, password: string): Promise<void> {
    await api.patch(`/assistants/${id}/change-password`, { newPassword: password });
  },
};

