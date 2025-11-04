// User and Authentication Types
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'Admin' | 'Doctor' | 'Assistant' | 'User';
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'Admin' | 'Doctor' | 'Assistant' | 'User';
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

// Doctor Types
export interface Doctor {
  id: number;
  name: string;
  specialization: string;
  experience?: number;
  licenseNumber: string;
  qualification: string;
  bio?: string;
  consultationFee: number;
  userId: number;
  user: User;
  assistants?: Assistant[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateDoctorRequest {
  name: string;
  specialization: string;
  experience?: number;
  licenseNumber: string;
  qualification: string;
  bio?: string;
  consultationFee: number;
  userId: number;
}

// Assistant Types
export interface Assistant {
  id: number;
  name: string;
  email: string;
  phone: string;
  qualification?: string;
  experience?: number;
  doctorId: number;
  doctor: Doctor;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Clinic Types
export interface Clinic {
  id: number;
  locationName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

// Appointment Types
export interface Appointment {
  id: number;
  doctorId: number;
  doctor: Doctor;
  clinicId: number;
  clinic: Clinic;
  date: string;
  startTime: string;
  endTime: string;
  bookedTimes?: string[]; // Array of booked times for this slot
  duration: number;
  status: 'Available' | 'Booked' | 'Completed' | 'Cancelled';
  maxPatients: number;
  currentBookings: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentRequest {
  doctorId: number;
  clinicId: number;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  maxPatients?: number;
}

// Token Appointment (Patient Booking) Types
export interface TokenAppointment {
  id: number;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientAge: number;
  patientGender: string;
  date: string;
  time: string;
  tokenNumber: string;
  reasonForVisit?: string;
  notes?: string;
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled' | 'No Show';
  doctorId: number;
  doctor: Doctor;
  appointmentId: number;
  appointment: Appointment;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTokenAppointmentRequest {
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientAge: number;
  patientGender: string;
  date: string;
  time: string;
  reasonForVisit?: string;
  notes?: string;
  doctorId: number;
  appointmentId: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form Types
export interface FormError {
  field: string;
  message: string;
}

// UI Types
export interface NotificationState {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

// Navigation Types
export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  current: boolean;
  roles: string[];
}
