import api from './api';
import { Clinic } from '../types';

export const clinicService = {
  // Get all clinics
  async getClinics(city?: string): Promise<Clinic[]> {
    const params = city ? { city } : {};
    const response = await api.get('/clinics', { params });
    return response.data;
  },

  // Get clinic by ID
  async getClinicById(id: number): Promise<Clinic> {
    const response = await api.get(`/clinics/${id}`);
    return response.data;
  },

  // Create new clinic (admin only)
  async createClinic(clinicData: Omit<Clinic, 'id' | 'createdAt' | 'updatedAt'>): Promise<Clinic> {
    const response = await api.post('/clinics', clinicData);
    return response.data;
  },

  // Update clinic (admin only)
  async updateClinic(id: number, clinicData: Partial<Omit<Clinic, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Clinic> {
    const response = await api.patch(`/clinics/${id}`, clinicData);
    return response.data;
  },

  // Delete clinic (admin only)
  async deleteClinic(id: number): Promise<void> {
    await api.delete(`/clinics/${id}`);
  },
};
