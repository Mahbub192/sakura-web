import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { TokenAppointment } from '../../types';
import { appointmentService } from '../../services/appointmentService';

interface PatientState {
  myAppointments: TokenAppointment[];
  selectedAppointment: TokenAppointment | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PatientState = {
  myAppointments: [],
  selectedAppointment: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchMyAppointments = createAsyncThunk(
  'patients/fetchMyAppointments',
  async (email: string, { rejectWithValue }) => {
    try {
      return await appointmentService.getPatientAppointments(email);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch appointments');
    }
  }
);

export const fetchAppointmentByToken = createAsyncThunk(
  'patients/fetchAppointmentByToken',
  async (tokenNumber: string, { rejectWithValue }) => {
    try {
      return await appointmentService.getAppointmentByToken(tokenNumber);
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

    // Fetch Appointment by Token
    builder
      .addCase(fetchAppointmentByToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAppointmentByToken.fulfilled, (state, action: PayloadAction<TokenAppointment>) => {
        state.isLoading = false;
        state.selectedAppointment = action.payload;
      })
      .addCase(fetchAppointmentByToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setSelectedAppointment } = patientSlice.actions;
export default patientSlice.reducer;
