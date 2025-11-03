import api from './api';
import { Doctor, Appointment } from '../types';

export const publicService = {
  // Get all doctors (public endpoint)
  async getDoctors(): Promise<Doctor[]> {
    const response = await api.get('/api/public/doctors');
    return response.data;
  },

  // Get doctor by ID (public endpoint)
  async getDoctorById(id: number): Promise<Doctor> {
    const response = await api.get(`/api/public/doctors/${id}`);
    return response.data;
  },

  // Get available appointments (public endpoint - no authentication required)
  async getAvailableAppointments(filters?: { doctorId?: number; date?: string; clinicId?: number }): Promise<Appointment[]> {
    const response = await api.get('/api/public/available-appointments', { params: filters });
    return response.data;
  },

  // Get doctors with available slots
  async getDoctorsWithAvailableSlots(date?: string): Promise<any[]> {
    const params = date ? { date } : {};
    const response = await api.get('/api/public/doctors-with-slots', { params });
    return response.data;
  },
};

