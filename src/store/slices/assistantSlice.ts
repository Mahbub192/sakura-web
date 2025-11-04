import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { assistantService, Assistant, CreateAssistantRequest, UpdateAssistantRequest } from '../../services/assistantService';

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
      // If 403 (Forbidden) or 404 (Not Found), return false (profile doesn't exist)
      if (error.response?.status === 403 || error.response?.status === 404) {
        return false;
      }
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

export const updateMyAssistantProfile = createAsyncThunk(
  'assistants/updateMyProfile',
  async (profileData: { name?: string; qualification?: string; experience?: number }, { rejectWithValue }) => {
    try {
      return await assistantService.updateMyProfile(profileData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const fetchAssistants = createAsyncThunk(
  'assistants/fetchAssistants',
  async (_, { rejectWithValue }) => {
    try {
      return await assistantService.getAssistants();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch assistants');
    }
  }
);

export const fetchAssistantById = createAsyncThunk(
  'assistants/fetchAssistantById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await assistantService.getAssistantById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch assistant');
    }
  }
);

export const createAssistant = createAsyncThunk(
  'assistants/createAssistant',
  async (assistantData: CreateAssistantRequest, { rejectWithValue }) => {
    try {
      return await assistantService.createAssistant(assistantData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create assistant');
    }
  }
);

export const updateAssistant = createAsyncThunk(
  'assistants/updateAssistant',
  async ({ id, data }: { id: number; data: UpdateAssistantRequest }, { rejectWithValue }) => {
    try {
      return await assistantService.updateAssistant(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update assistant');
    }
  }
);

export const deleteAssistant = createAsyncThunk(
  'assistants/deleteAssistant',
  async (id: number, { rejectWithValue }) => {
    try {
      await assistantService.deleteAssistant(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete assistant');
    }
  }
);

export const toggleAssistantStatus = createAsyncThunk(
  'assistants/toggleStatus',
  async (id: number, { rejectWithValue }) => {
    try {
      return await assistantService.toggleStatus(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle status');
    }
  }
);

export const changeAssistantPassword = createAsyncThunk(
  'assistants/changePassword',
  async ({ id, password }: { id: number; password: string }, { rejectWithValue }) => {
    try {
      await assistantService.changePassword(id, password);
      return { id, password };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to change password');
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

    // Update My Profile
    builder
      .addCase(updateMyAssistantProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMyAssistantProfile.fulfilled, (state, action: PayloadAction<Assistant>) => {
        state.isLoading = false;
        state.currentAssistantProfile = action.payload;
        state.profileExists = true;
      })
      .addCase(updateMyAssistantProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Assistants
    builder
      .addCase(fetchAssistants.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAssistants.fulfilled, (state, action: PayloadAction<Assistant[]>) => {
        state.isLoading = false;
        state.assistants = action.payload;
      })
      .addCase(fetchAssistants.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Assistant
    builder
      .addCase(createAssistant.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createAssistant.fulfilled, (state, action: PayloadAction<Assistant>) => {
        state.isLoading = false;
        state.assistants.push(action.payload);
      })
      .addCase(createAssistant.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Assistant
    builder
      .addCase(updateAssistant.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAssistant.fulfilled, (state, action: PayloadAction<Assistant>) => {
        state.isLoading = false;
        const index = state.assistants.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.assistants[index] = action.payload;
        }
      })
      .addCase(updateAssistant.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Assistant
    builder
      .addCase(deleteAssistant.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAssistant.fulfilled, (state, action: PayloadAction<number>) => {
        state.isLoading = false;
        state.assistants = state.assistants.filter(a => a.id !== action.payload);
      })
      .addCase(deleteAssistant.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Toggle Status
    builder
      .addCase(toggleAssistantStatus.fulfilled, (state, action: PayloadAction<Assistant>) => {
        const index = state.assistants.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.assistants[index] = action.payload;
        }
      });
  },
});

export const { clearError } = assistantSlice.actions;
export default assistantSlice.reducer;

