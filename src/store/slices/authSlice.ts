import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthSession, LoginPayload, RegisterPayload, User } from '@/types';
import * as authService from '@/services/authService';
import { getErrorMessage } from '@/services/api/client';
import { readStorage, removeStorage, writeStorage, STORAGE_KEYS } from '@/utils/storage';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'error';

export interface AuthState {
  session: AuthSession | null;
  status: AuthStatus;
  error: string | null;
}

const persisted = readStorage<AuthSession | null>(STORAGE_KEYS.auth, null);

const initialState: AuthState = {
  session: persisted && new Date(persisted.expiresAt).getTime() > Date.now() ? persisted : null,
  status: 'idle',
  error: null,
};

export const loginUser = createAsyncThunk<
  AuthSession,
  LoginPayload,
  { rejectValue: string }
>('auth/login', async (payload, { rejectWithValue }) => {
  try {
    return await authService.login(payload);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const registerUser = createAsyncThunk<
  AuthSession,
  RegisterPayload,
  { rejectValue: string }
>('auth/register', async (payload, { rejectWithValue }) => {
  try {
    return await authService.register(payload);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const updateProfile = createAsyncThunk<
  User,
  Pick<User, 'name' | 'phone' | 'city' | 'bio'> & { userId: string },
  { rejectValue: string }
>('auth/updateProfile', async ({ userId, ...patch }, { rejectWithValue }) => {
  try {
    return await authService.updateProfile(userId, patch);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.session = null;
      state.status = 'idle';
      state.error = null;
      removeStorage(STORAGE_KEYS.auth);
    },
    clearAuthError(state) {
      state.error = null;
      if (state.status === 'error') state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<AuthSession>) => {
        state.status = 'authenticated';
        state.session = action.payload;
        writeStorage(STORAGE_KEYS.auth, action.payload);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload ?? 'Unable to sign in right now.';
      })
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<AuthSession>) => {
        state.status = 'authenticated';
        state.session = action.payload;
        writeStorage(STORAGE_KEYS.auth, action.payload);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload ?? 'Unable to create your account right now.';
      })
      .addCase(updateProfile.fulfilled, (state, action: PayloadAction<User>) => {
        if (state.session) {
          state.session = { ...state.session, user: action.payload };
          writeStorage(STORAGE_KEYS.auth, state.session);
        }
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export const authReducer = authSlice.reducer;
