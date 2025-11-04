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

export const createClinic = createAsyncThunk(
  'clinics/createClinic',
  async (clinicData: Omit<Clinic, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      return await clinicService.createClinic(clinicData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create clinic');
    }
  }
);

export const updateClinic = createAsyncThunk(
  'clinics/updateClinic',
  async ({ id, data }: { id: number; data: Partial<Omit<Clinic, 'id' | 'createdAt' | 'updatedAt'>> }, { rejectWithValue }) => {
    try {
      return await clinicService.updateClinic(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update clinic');
    }
  }
);

export const deleteClinic = createAsyncThunk(
  'clinics/deleteClinic',
  async (id: number, { rejectWithValue }) => {
    try {
      await clinicService.deleteClinic(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete clinic');
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

    // Create Clinic
    builder
      .addCase(createClinic.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createClinic.fulfilled, (state, action: PayloadAction<Clinic>) => {
        state.isLoading = false;
        state.clinics.push(action.payload);
      })
      .addCase(createClinic.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Clinic
    builder
      .addCase(updateClinic.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateClinic.fulfilled, (state, action: PayloadAction<Clinic>) => {
        state.isLoading = false;
        const index = state.clinics.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.clinics[index] = action.payload;
        }
      })
      .addCase(updateClinic.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Clinic
    builder
      .addCase(deleteClinic.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteClinic.fulfilled, (state, action: PayloadAction<number>) => {
        state.isLoading = false;
        state.clinics = state.clinics.filter(c => c.id !== action.payload);
      })
      .addCase(deleteClinic.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setSelectedClinic } = clinicSlice.actions;
export default clinicSlice.reducer;
