import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Clinic } from '../../types';
import { clinicService } from '../../services/clinicService';

interface ClinicState {
  clinics: Clinic[];
  selectedClinic: Clinic | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ClinicState = {
  clinics: [],
  selectedClinic: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchClinics = createAsyncThunk(
  'clinics/fetchClinics',
  async (city: string | undefined = undefined, { rejectWithValue }) => {
    try {
      return await clinicService.getClinics(city);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch clinics');
    }
  }
);

export const fetchClinicById = createAsyncThunk(
  'clinics/fetchClinicById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await clinicService.getClinicById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch clinic');
    }
  }
);

const clinicSlice = createSlice({
  name: 'clinics',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedClinic: (state, action) => {
      state.selectedClinic = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch Clinics
    builder
      .addCase(fetchClinics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchClinics.fulfilled, (state, action: PayloadAction<Clinic[]>) => {
        state.isLoading = false;
        state.clinics = action.payload;
      })
      .addCase(fetchClinics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Clinic by ID
    builder
      .addCase(fetchClinicById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchClinicById.fulfilled, (state, action: PayloadAction<Clinic>) => {
        state.isLoading = false;
        state.selectedClinic = action.payload;
      })
      .addCase(fetchClinicById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setSelectedClinic } = clinicSlice.actions;
export default clinicSlice.reducer;
