import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';
import { userService } from '../../services/userService';

export interface CreateMyUserProfileRequest {
  firstName: string;
  lastName: string;
  phone?: string;
}

interface UserState {
  users: User[];
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  currentUser: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const updateMyUserProfile = createAsyncThunk(
  'users/updateMyProfile',
  async (profileData: CreateMyUserProfileRequest, { rejectWithValue }) => {
    try {
      return await userService.updateMyProfile(profileData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const fetchAllUsers = createAsyncThunk(
  'users/fetchAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      return await userService.getAllUsers();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const createUserAccount = createAsyncThunk(
  'users/createUser',
  async (userData: any, { rejectWithValue }) => {
    try {
      return await userService.createUser(userData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create user');
    }
  }
);

export const activateUserAccount = createAsyncThunk(
  'users/activateUser',
  async (id: number, { rejectWithValue }) => {
    try {
      return await userService.activateUser(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to activate user');
    }
  }
);

export const deactivateUserAccount = createAsyncThunk(
  'users/deactivateUser',
  async (id: number, { rejectWithValue }) => {
    try {
      return await userService.deactivateUser(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to deactivate user');
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Update My Profile
    builder
      .addCase(updateMyUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMyUserProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.currentUser = action.payload;
      })
      .addCase(updateMyUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch All Users
    builder
      .addCase(fetchAllUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create User Account
    builder
      .addCase(createUserAccount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createUserAccount.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.users.push(action.payload);
      })
      .addCase(createUserAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Activate User
    builder
      .addCase(activateUserAccount.fulfilled, (state, action: PayloadAction<User>) => {
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      });

    // Deactivate User
    builder
      .addCase(deactivateUserAccount.fulfilled, (state, action: PayloadAction<User>) => {
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      });
  },
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;

