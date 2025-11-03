import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Appointment, CreateAppointmentRequest, TokenAppointment, CreateTokenAppointmentRequest } from '../../types';
import { appointmentService } from '../../services/appointmentService';

interface AppointmentState {
  appointments: Appointment[];
  availableSlots: Appointment[];
  tokenAppointments: TokenAppointment[];
  selectedAppointment: Appointment | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    doctorId?: number;
    date?: string;
    status?: string;
  };
}

const initialState: AppointmentState = {
  appointments: [],
  availableSlots: [],
  tokenAppointments: [],
  selectedAppointment: null,
  isLoading: false,
  error: null,
  filters: {},
};

// Async thunks
export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAppointments',
  async (filters: { doctorId?: number; startDate?: string; endDate?: string } | undefined = undefined, { rejectWithValue }) => {
    try {
      return await appointmentService.getAppointments(filters);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch appointments');
    }
  }
);

export const fetchAvailableSlots = createAsyncThunk(
  'appointments/fetchAvailableSlots',
  async (filters: { doctorId?: number; date?: string } | undefined = undefined, { rejectWithValue }) => {
    try {
      return await appointmentService.getAvailableSlots(filters);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch available slots');
    }
  }
);

export const createAppointment = createAsyncThunk(
  'appointments/createAppointment',
  async (appointmentData: CreateAppointmentRequest, { rejectWithValue }) => {
    try {
      return await appointmentService.createAppointment(appointmentData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create appointment');
    }
  }
);

export const fetchTokenAppointments = createAsyncThunk(
  'appointments/fetchTokenAppointments',
  async (filters: { doctorId?: number; clinicId?: number; date?: string } | undefined = undefined, { rejectWithValue }) => {
    try {
      const doctorId = filters?.doctorId;
      const clinicId = filters?.clinicId;
      const date = filters?.date;
      return await appointmentService.getTokenAppointments(doctorId, clinicId, date);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings');
    }
  }
);

export const createTokenAppointment = createAsyncThunk(
  'appointments/createTokenAppointment',
  async (bookingData: CreateTokenAppointmentRequest, { rejectWithValue }) => {
    try {
      return await appointmentService.createTokenAppointment(bookingData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to book appointment');
    }
  }
);

export const updateAppointmentStatus = createAsyncThunk(
  'appointments/updateAppointmentStatus',
  async ({ id, status }: { id: number; status: string }, { rejectWithValue }) => {
    try {
      return await appointmentService.updateAppointmentStatus(id, status);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update appointment status');
    }
  }
);

export const updateTokenAppointmentStatus = createAsyncThunk(
  'appointments/updateTokenAppointmentStatus',
  async ({ id, status }: { id: number; status: string }, { rejectWithValue }) => {
    try {
      return await appointmentService.updateTokenAppointmentStatus(id, status);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update booking status');
    }
  }
);

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setSelectedAppointment: (state, action) => {
      state.selectedAppointment = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch Appointments
    builder
      .addCase(fetchAppointments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action: PayloadAction<Appointment[]>) => {
        state.isLoading = false;
        state.appointments = action.payload;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Available Slots
    builder
      .addCase(fetchAvailableSlots.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAvailableSlots.fulfilled, (state, action: PayloadAction<Appointment[]>) => {
        state.isLoading = false;
        state.availableSlots = action.payload;
      })
      .addCase(fetchAvailableSlots.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Appointment
    builder
      .addCase(createAppointment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createAppointment.fulfilled, (state, action: PayloadAction<Appointment[]>) => {
        state.isLoading = false;
        // Backend returns array of appointments, so push all of them
        state.appointments.push(...action.payload);
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Token Appointments
    builder
      .addCase(fetchTokenAppointments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTokenAppointments.fulfilled, (state, action: PayloadAction<TokenAppointment[]>) => {
        state.isLoading = false;
        state.tokenAppointments = action.payload;
      })
      .addCase(fetchTokenAppointments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Token Appointment
    builder
      .addCase(createTokenAppointment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTokenAppointment.fulfilled, (state, action: PayloadAction<TokenAppointment>) => {
        state.isLoading = false;
        state.tokenAppointments.push(action.payload);
      })
      .addCase(createTokenAppointment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Appointment Status
    builder
      .addCase(updateAppointmentStatus.fulfilled, (state, action: PayloadAction<Appointment>) => {
        const index = state.appointments.findIndex(apt => apt.id === action.payload.id);
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
      });

    // Update Token Appointment Status
    builder
      .addCase(updateTokenAppointmentStatus.fulfilled, (state, action: PayloadAction<TokenAppointment>) => {
        const index = state.tokenAppointments.findIndex(apt => apt.id === action.payload.id);
        if (index !== -1) {
          state.tokenAppointments[index] = action.payload;
        }
      });
  },
});

export const { clearError, setFilters, clearFilters, setSelectedAppointment } = appointmentSlice.actions;
export default appointmentSlice.reducer;
