import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { assistantService, Assistant } from '../../services/assistantService';

export interface CreateMyAssistantProfileRequest {
  name: string;
  phone: string;
  doctorId: number;
  qualification?: string;
  experience?: number;
}

interface AssistantState {
  assistants: Assistant[];
  currentAssistantProfile: Assistant | null;
  profileExists: boolean | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AssistantState = {
  assistants: [],
  currentAssistantProfile: null,
  profileExists: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const checkAssistantProfileExists = createAsyncThunk(
  'assistants/checkProfileExists',
  async (_, { rejectWithValue }) => {
    try {
      return await assistantService.checkProfileExists();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check profile');
    }
  }
);

export const fetchCurrentAssistantProfile = createAsyncThunk(
  'assistants/fetchCurrentProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await assistantService.getCurrentProfile();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const createMyAssistantProfile = createAsyncThunk(
  'assistants/createMyProfile',
  async (profileData: CreateMyAssistantProfileRequest, { rejectWithValue }) => {
    try {
      return await assistantService.createMyProfile(profileData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create profile');
    }
  }
);

const assistantSlice = createSlice({
  name: 'assistants',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Check Profile Exists
    builder
      .addCase(checkAssistantProfileExists.fulfilled, (state, action: PayloadAction<boolean>) => {
        state.profileExists = action.payload;
      })
      .addCase(checkAssistantProfileExists.rejected, (state, action) => {
        state.error = action.payload as string;
        state.profileExists = false;
      });

    // Fetch Current Profile
    builder
      .addCase(fetchCurrentAssistantProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentAssistantProfile.fulfilled, (state, action: PayloadAction<Assistant>) => {
        state.isLoading = false;
        state.currentAssistantProfile = action.payload;
        state.profileExists = true;
      })
      .addCase(fetchCurrentAssistantProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create My Profile
    builder
      .addCase(createMyAssistantProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createMyAssistantProfile.fulfilled, (state, action: PayloadAction<Assistant>) => {
        state.isLoading = false;
        state.currentAssistantProfile = action.payload;
        state.profileExists = true;
        state.assistants.push(action.payload);
      })
      .addCase(createMyAssistantProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = assistantSlice.actions;
export default assistantSlice.reducer;

