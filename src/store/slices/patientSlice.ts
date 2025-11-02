import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { TokenAppointment } from '../../types';
import { patientService, BookAppointmentRequest } from '../../services/patientService';

interface PatientState {
  myAppointments: TokenAppointment[];
  upcomingAppointments: TokenAppointment[];
  selectedAppointment: TokenAppointment | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PatientState = {
  myAppointments: [],
  upcomingAppointments: [],
  selectedAppointment: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchMyAppointments = createAsyncThunk(
  'patients/fetchMyAppointments',
  async (_, { rejectWithValue }) => {
    try {
      return await patientService.getMyAppointments();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch appointments');
    }
  }
);

export const fetchUpcomingAppointments = createAsyncThunk(
  'patients/fetchUpcomingAppointments',
  async (_, { rejectWithValue }) => {
    try {
      return await patientService.getUpcomingAppointments();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch upcoming appointments');
    }
  }
);

export const bookAppointment = createAsyncThunk(
  'patients/bookAppointment',
  async (bookingData: BookAppointmentRequest, { rejectWithValue }) => {
    try {
      return await patientService.bookAppointment(bookingData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to book appointment');
    }
  }
);

export const cancelAppointment = createAsyncThunk(
  'patients/cancelAppointment',
  async (id: number, { rejectWithValue }) => {
    try {
      return await patientService.cancelAppointment(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel appointment');
    }
  }
);

export const fetchAppointmentById = createAsyncThunk(
  'patients/fetchAppointmentById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await patientService.getAppointmentById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch appointment');
    }
  }
);

const patientSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedAppointment: (state, action) => {
      state.selectedAppointment = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch My Appointments
    builder
      .addCase(fetchMyAppointments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyAppointments.fulfilled, (state, action: PayloadAction<TokenAppointment[]>) => {
        state.isLoading = false;
        state.myAppointments = action.payload;
      })
      .addCase(fetchMyAppointments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Upcoming Appointments
    builder
      .addCase(fetchUpcomingAppointments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUpcomingAppointments.fulfilled, (state, action: PayloadAction<TokenAppointment[]>) => {
        state.isLoading = false;
        state.upcomingAppointments = action.payload;
      })
      .addCase(fetchUpcomingAppointments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Book Appointment
    builder
      .addCase(bookAppointment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(bookAppointment.fulfilled, (state, action: PayloadAction<TokenAppointment>) => {
        state.isLoading = false;
        state.myAppointments.unshift(action.payload);
      })
      .addCase(bookAppointment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Cancel Appointment
    builder
      .addCase(cancelAppointment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelAppointment.fulfilled, (state, action: PayloadAction<TokenAppointment>) => {
        state.isLoading = false;
        const index = state.myAppointments.findIndex(apt => apt.id === action.payload.id);
        if (index !== -1) {
          state.myAppointments[index] = action.payload;
        }
      })
      .addCase(cancelAppointment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Appointment by ID
    builder
      .addCase(fetchAppointmentById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAppointmentById.fulfilled, (state, action: PayloadAction<TokenAppointment>) => {
        state.isLoading = false;
        state.selectedAppointment = action.payload;
      })
      .addCase(fetchAppointmentById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setSelectedAppointment } = patientSlice.actions;
export default patientSlice.reducer;
