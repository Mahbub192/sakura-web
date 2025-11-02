import api from './api';
import { Appointment, CreateAppointmentRequest, TokenAppointment, CreateTokenAppointmentRequest } from '../types';

export const appointmentService = {
  // Get all appointments
  async getAppointments(filters?: { doctorId?: number; startDate?: string; endDate?: string }): Promise<Appointment[]> {
    const response = await api.get('/appointments', { params: filters });
    return response.data;
  },

  // Get available appointment slots
  async getAvailableSlots(filters?: { doctorId?: number; date?: string }): Promise<Appointment[]> {
    const response = await api.get('/appointments/available', { params: filters });
    return response.data;
  },

  // Get appointment by ID
  async getAppointmentById(id: number): Promise<Appointment> {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  // Create new appointment slot
  async createAppointment(appointmentData: CreateAppointmentRequest): Promise<Appointment> {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  },

  // Update appointment status
  async updateAppointmentStatus(id: number, status: string): Promise<Appointment> {
    const response = await api.patch(`/appointments/${id}/status`, { status });
    return response.data;
  },

  // Delete appointment
  async deleteAppointment(id: number): Promise<void> {
    await api.delete(`/appointments/${id}`);
  },

  // Token Appointments (Patient Bookings)
  
  // Get all token appointments
  async getTokenAppointments(doctorId?: number, clinicId?: number, date?: string): Promise<TokenAppointment[]> {
    const params: any = {};
    if (doctorId) params.doctorId = doctorId;
    if (clinicId) params.clinicId = clinicId;
    if (date) params.date = date;
    const response = await api.get('/token-appointments', { params });
    return response.data;
  },

  // Get patient appointments by email
  async getPatientAppointments(email: string): Promise<TokenAppointment[]> {
    const response = await api.get('/token-appointments/my-appointments', { params: { email } });
    return response.data;
  },

  // Get appointment by token number
  async getAppointmentByToken(tokenNumber: string): Promise<TokenAppointment> {
    const response = await api.get(`/token-appointments/token/${tokenNumber}`);
    return response.data;
  },

  // Create new token appointment (book appointment)
  async createTokenAppointment(bookingData: CreateTokenAppointmentRequest): Promise<TokenAppointment> {
    const response = await api.post('/token-appointments', bookingData);
    return response.data;
  },

  // Update token appointment status
  async updateTokenAppointmentStatus(id: number, status: string): Promise<TokenAppointment> {
    const response = await api.patch(`/token-appointments/${id}/status`, { status });
    return response.data;
  },

  // Cancel token appointment
  async cancelTokenAppointment(id: number): Promise<void> {
    await api.delete(`/token-appointments/${id}`);
  },
};
