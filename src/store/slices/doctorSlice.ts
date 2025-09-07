import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Doctor, CreateDoctorRequest } from '../../types';
import { doctorService } from '../../services/doctorService';

interface DoctorState {
  doctors: Doctor[];
  selectedDoctor: Doctor | null;
  currentDoctorProfile: Doctor | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    specialization?: string;
    search?: string;
  };
}

const initialState: DoctorState = {
  doctors: [],
  selectedDoctor: null,
  currentDoctorProfile: null,
  isLoading: false,
  error: null,
  filters: {},
};

// Async thunks
export const fetchDoctors = createAsyncThunk(
  'doctors/fetchDoctors',
  async (specialization: string | undefined = undefined, { rejectWithValue }) => {
    try {
      return await doctorService.getDoctors(specialization);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch doctors');
    }
  }
);

export const fetchDoctorById = createAsyncThunk(
  'doctors/fetchDoctorById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await doctorService.getDoctorById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch doctor');
    }
  }
);

export const fetchCurrentDoctorProfile = createAsyncThunk(
  'doctors/fetchCurrentDoctorProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await doctorService.getCurrentDoctorProfile();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch doctor profile');
    }
  }
);

export const createDoctor = createAsyncThunk(
  'doctors/createDoctor',
  async (doctorData: CreateDoctorRequest, { rejectWithValue }) => {
    try {
      return await doctorService.createDoctor(doctorData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create doctor');
    }
  }
);

export const updateDoctor = createAsyncThunk(
  'doctors/updateDoctor',
  async ({ id, data }: { id: number; data: Partial<CreateDoctorRequest> }, { rejectWithValue }) => {
    try {
      return await doctorService.updateDoctor(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update doctor');
    }
  }
);

export const deleteDoctor = createAsyncThunk(
  'doctors/deleteDoctor',
  async (id: number, { rejectWithValue }) => {
    try {
      await doctorService.deleteDoctor(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete doctor');
    }
  }
);

const doctorSlice = createSlice({
  name: 'doctors',
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
    setSelectedDoctor: (state, action) => {
      state.selectedDoctor = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch Doctors
    builder
      .addCase(fetchDoctors.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action: PayloadAction<Doctor[]>) => {
        state.isLoading = false;
        state.doctors = action.payload;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Doctor by ID
    builder
      .addCase(fetchDoctorById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDoctorById.fulfilled, (state, action: PayloadAction<Doctor>) => {
        state.isLoading = false;
        state.selectedDoctor = action.payload;
      })
      .addCase(fetchDoctorById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Current Doctor Profile
    builder
      .addCase(fetchCurrentDoctorProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentDoctorProfile.fulfilled, (state, action: PayloadAction<Doctor>) => {
        state.isLoading = false;
        state.currentDoctorProfile = action.payload;
      })
      .addCase(fetchCurrentDoctorProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Doctor
    builder
      .addCase(createDoctor.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createDoctor.fulfilled, (state, action: PayloadAction<Doctor>) => {
        state.isLoading = false;
        state.doctors.push(action.payload);
      })
      .addCase(createDoctor.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Doctor
    builder
      .addCase(updateDoctor.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateDoctor.fulfilled, (state, action: PayloadAction<Doctor>) => {
        state.isLoading = false;
        const index = state.doctors.findIndex(doctor => doctor.id === action.payload.id);
        if (index !== -1) {
          state.doctors[index] = action.payload;
        }
        if (state.currentDoctorProfile?.id === action.payload.id) {
          state.currentDoctorProfile = action.payload;
        }
      })
      .addCase(updateDoctor.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Doctor
    builder
      .addCase(deleteDoctor.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteDoctor.fulfilled, (state, action: PayloadAction<number>) => {
        state.isLoading = false;
        state.doctors = state.doctors.filter(doctor => doctor.id !== action.payload);
      })
      .addCase(deleteDoctor.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setFilters, clearFilters, setSelectedDoctor } = doctorSlice.actions;
export default doctorSlice.reducer;
