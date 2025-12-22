import { Appointment, TokenAppointment } from "../types";
import api from "./api";

export interface CreatePatientBookingRequest {
  doctorId: number;
  appointmentId: number;
  patientName: string;
  patientEmail?: string;
  patientPhone: string;
  patientAge: number;
  patientGender: string;
  patientLocation?: string;
  patientType?: string;
  isOldPatient?: boolean;
  doctorFee: number;
  reasonForVisit?: string;
  notes?: string;
  date: string;
  time: string;
}

export const doctorBookingService = {
  async bookPatient(bookingData: CreatePatientBookingRequest): Promise<TokenAppointment> {
    console.log("[doctorBookingService] Calling /doctor-booking/book-patient with data:", bookingData);
    try {
      const response = await api.post("/doctor-booking/book-patient", bookingData);
      console.log("[doctorBookingService] Success response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("[doctorBookingService] Error calling /doctor-booking/book-patient:", {
        url: error?.config?.url,
        method: error?.config?.method,
        status: error?.response?.status,
        message: error?.response?.data?.message,
        fullError: error,
      });
      throw error;
    }
  },

  async getAvailableSlots(doctorId: number, date: string, clinicId?: number): Promise<Appointment[]> {
    const params: any = { date };
    if (clinicId) params.clinicId = clinicId;
    // doctor endpoint expects authenticated doctor; endpoint signature uses only date+clinicId
    const response = await api.get("/doctor-booking/available-slots", { params });
    return response.data;
  },
};
