import api from './api';
import { Doctor, CreateDoctorRequest } from '../types';

export const doctorService = {
  // Get all doctors
  async getDoctors(specialization?: string): Promise<Doctor[]> {
    const params = specialization ? { specialization } : {};
    const response = await api.get('/doctors', { params });
    return response.data;
  },

  // Get doctor by ID
  async getDoctorById(id: number): Promise<Doctor> {
    const response = await api.get(`/doctors/${id}`);
    return response.data;
  },

  // Get current doctor profile (for authenticated doctors)
  async getCurrentDoctorProfile(): Promise<Doctor> {
    const response = await api.get('/doctors/profile');
    return response.data;
  },

  // Check if doctor profile exists
  async checkProfileExists(): Promise<boolean> {
    try {
      const response = await api.get('/doctors/check-profile');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  },

  // Create my doctor profile (self-service)
  async createMyProfile(profileData: any): Promise<Doctor> {
    const response = await api.post('/doctors/my-profile', profileData);
    return response.data;
  },

  // Create new doctor (Admin only)
  async createDoctor(doctorData: CreateDoctorRequest): Promise<Doctor> {
    const response = await api.post('/doctors', doctorData);
    return response.data;
  },

  // Update doctor
  async updateDoctor(id: number, doctorData: Partial<CreateDoctorRequest>): Promise<Doctor> {
    const response = await api.patch(`/doctors/${id}`, doctorData);
    return response.data;
  },

  // Delete doctor
  async deleteDoctor(id: number): Promise<void> {
    await api.delete(`/doctors/${id}`);
  },
};
