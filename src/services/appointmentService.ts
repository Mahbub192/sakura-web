import api from './api';
import { Appointment, CreateAppointmentRequest, TokenAppointment, CreateTokenAppointmentRequest } from '../types';

export const appointmentService = {
  // Get all appointments
  async getAppointments(filters?: { doctorId?: number; startDate?: string; endDate?: string }): Promise<Appointment[]> {
    const response = await api.get('/appointments', { params: filters });
    return response.data;
  },

  // Get available appointment slots
  // Uses public endpoint for better reliability (works without authentication)
  async getAvailableSlots(filters?: { doctorId?: number; date?: string; clinicId?: number }): Promise<Appointment[]> {
    // Use public endpoint - works for both authenticated and unauthenticated users
    console.log('Fetching available slots with filters:', filters);
    try {
      const response = await api.get('/api/public/available-appointments', { params: filters });
      console.log('Available slots response:', response.data);
      console.log('Number of slots received:', response.data?.length || 0);
      return response.data || [];
    } catch (error: any) {
      console.error('Error fetching available slots:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  },

  // Get appointment by ID
  async getAppointmentById(id: number): Promise<Appointment> {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  // Create new appointment slot
  async createAppointment(appointmentData: CreateAppointmentRequest, isDoctor: boolean = false): Promise<Appointment[]> {
    // For doctors: use schedule endpoint (creates multiple slots)
    // For admins: use single appointment endpoint (creates one slot)
    if (isDoctor) {
      // Doctor schedule endpoint - creates multiple slots based on time range
      const requestBody = {
        clinicId: appointmentData.clinicId,
        date: appointmentData.date,
        startTime: appointmentData.startTime,
        endTime: appointmentData.endTime,
        slotDuration: appointmentData.duration,
        patientPerSlot: appointmentData.maxPatients || 1,
      };
      
      console.log('Sending request to:', '/doctors/dashboard/create-schedule');
      console.log('Request body:', requestBody);
      
      try {
        const response = await api.post('/doctors/dashboard/create-schedule', requestBody);
        console.log('Response received:', response.data);
        // Backend returns array of appointments
        return Array.isArray(response.data) ? response.data : [response.data];
      } catch (error: any) {
        console.error('API Error:', error);
        console.error('Response:', error.response?.data);
        console.error('Status:', error.response?.status);
        console.error('URL:', error.config?.url);
        throw error;
      }
    } else {
      // Admin/regular appointment endpoint - creates single slot
      const requestBody = {
        doctorId: appointmentData.doctorId,
        clinicId: appointmentData.clinicId,
        date: appointmentData.date,
        startTime: appointmentData.startTime,
        endTime: appointmentData.endTime,
        duration: appointmentData.duration,
        maxPatients: appointmentData.maxPatients || 1,
      };
      
      console.log('Sending request to:', '/appointments');
      console.log('Request body:', requestBody);
      
      try {
        const response = await api.post('/appointments', requestBody);
        console.log('Response received:', response.data);
        // Backend returns single appointment, wrap in array for consistency
        return Array.isArray(response.data) ? response.data : [response.data];
      } catch (error: any) {
        console.error('API Error:', error);
        console.error('Response:', error.response?.data);
        console.error('Status:', error.response?.status);
        console.error('URL:', error.config?.url);
        throw error;
      }
    }
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
