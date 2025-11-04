import api from './api';

export interface GlobalDashboardStats {
  totalDoctors: number;
  totalAppointmentsToday: number;
  totalPatientsToday: number;
  confirmedAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalRevenue: number;
}

export interface TodayGlobalAppointment {
  id: number;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  tokenNumber: string;
  date: string;
  time: string;
  doctorName: string;
  clinicName: string;
  status: string;
  doctorFee: number;
}

export interface DoctorWiseStat {
  doctorId: number;
  doctorName: string;
  totalAppointments: number;
  confirmedAppointments: number;
  completedAppointments: number;
  totalRevenue: number;
}

export const globalDashboardService = {
  // Get global dashboard statistics
  async getGlobalStats(): Promise<GlobalDashboardStats> {
    const response = await api.get('/global-dashboard/stats');
    return response.data;
  },

  // Get today's appointments
  async getTodayAppointments(): Promise<TodayGlobalAppointment[]> {
    const response = await api.get('/global-dashboard/today-appointments');
    return response.data;
  },

  // Get appointments by date range
  async getAppointmentsByDateRange(startDate: string, endDate: string): Promise<TodayGlobalAppointment[]> {
    const response = await api.get('/global-dashboard/appointments-by-date-range', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  // Get doctor-wise statistics
  async getDoctorWiseStats(date?: string): Promise<DoctorWiseStat[]> {
    const params = date ? { date } : {};
    const response = await api.get('/global-dashboard/doctor-wise-stats', { params });
    return response.data;
  },

  // Search appointments globally
  async searchAppointments(searchTerm: string, date?: string): Promise<TodayGlobalAppointment[]> {
    const params: any = { search: searchTerm };
    if (date) params.date = date;
    const response = await api.get('/global-dashboard/search-appointments', { params });
    return response.data;
  },
};

