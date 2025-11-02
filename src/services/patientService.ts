import api from './api';
import { TokenAppointment } from '../types';

export interface BookAppointmentRequest {
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientAge: number;
  patientGender: string;
  patientLocation?: string;
  isOldPatient?: boolean;
  appointmentId: number;
  reasonForVisit?: string;
  notes?: string;
}

export const patientService = {
  // Book appointment (Patient self-booking)
  async bookAppointment(bookingData: BookAppointmentRequest): Promise<TokenAppointment> {
    const response = await api.post('/patients/book-appointment', bookingData);
    return response.data;
  },

  // Get my appointments
  async getMyAppointments(): Promise<TokenAppointment[]> {
    const response = await api.get('/patients/my-appointments');
    return response.data;
  },

  // Get upcoming appointments (today's)
  async getUpcomingAppointments(): Promise<TokenAppointment[]> {
    const response = await api.get('/patients/upcoming-appointments');
    return response.data;
  },

  // Get appointment by ID
  async getAppointmentById(id: number): Promise<TokenAppointment> {
    const response = await api.get(`/patients/appointments/${id}`);
    return response.data;
  },

  // Get appointment history
  async getAppointmentHistory(limit?: number): Promise<TokenAppointment[]> {
    const params = limit ? { limit } : {};
    const response = await api.get('/patients/appointment-history', { params });
    return response.data;
  },

  // Cancel appointment
  async cancelAppointment(id: number): Promise<TokenAppointment> {
    const response = await api.delete(`/patients/appointments/${id}/cancel`);
    return response.data;
  },
};

