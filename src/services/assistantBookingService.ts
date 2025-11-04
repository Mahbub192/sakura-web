import api from './api';
import { TokenAppointment, Appointment } from '../types';

export interface CreatePatientBookingRequest {
  doctorId: number;
  appointmentId: number;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientAge: number;
  patientGender: string;
  patientLocation?: string;
  isOldPatient?: boolean;
  doctorFee: number;
  reasonForVisit?: string;
  notes?: string;
  date: string;
  time: string;
}

export const assistantBookingService = {
  // Book appointment for patient (Assistant only)
  async bookPatient(bookingData: CreatePatientBookingRequest): Promise<TokenAppointment> {
    const response = await api.post('/assistant-booking/book-patient', bookingData);
    return response.data;
  },

  // Get available slots for assistant's doctor
  async getAvailableSlots(doctorId: number, date: string): Promise<Appointment[]> {
    const response = await api.get('/assistant-booking/available-slots', {
      params: { doctorId, date },
    });
    return response.data;
  },

  // Get doctor bookings for a specific date
  async getDoctorBookings(doctorId: number, date: string): Promise<TokenAppointment[]> {
    const response = await api.get('/assistant-booking/doctor-bookings', {
      params: { doctorId, date },
    });
    return response.data;
  },

  // Get today's bookings
  async getTodaysBookings(): Promise<TokenAppointment[]> {
    const response = await api.get('/assistant-booking/todays-bookings');
    return response.data;
  },

  // Update booking status
  async updateBookingStatus(bookingId: number, status: string): Promise<TokenAppointment> {
    const response = await api.patch(`/assistant-booking/booking/${bookingId}/status`, null, {
      params: { status },
    });
    return response.data;
  },

  // Search patients
  async searchPatients(searchTerm: string): Promise<TokenAppointment[]> {
    const response = await api.get('/assistant-booking/search-patients', {
      params: { search: searchTerm },
    });
    return response.data;
  },
};

