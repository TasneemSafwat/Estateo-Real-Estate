import { useCallback, useMemo } from 'react';
import type { AuthSession, LoginPayload, RegisterPayload } from '@/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  clearAuthError,
  loginUser,
  logout as logoutAction,
  registerUser,
} from '@/store/slices/authSlice';

/**
 * Single entry point for authentication state and actions.
 * "Session" here is a mock — see `services/authService.ts`.
 */
export function useAuth() {
  const session = useAppSelector((state) => state.auth.session);
  const status = useAppSelector((state) => state.auth.status);
  const error = useAppSelector((state) => state.auth.error);
  const dispatch = useAppDispatch();

  const login = useCallback(
    async (payload: LoginPayload): Promise<AuthSession> => dispatch(loginUser(payload)).unwrap(),
    [dispatch],
  );

  const register = useCallback(
    async (payload: RegisterPayload): Promise<AuthSession> =>
      dispatch(registerUser(payload)).unwrap(),
    [dispatch],
  );

  const logout = useCallback(() => dispatch(logoutAction()), [dispatch]);
  const resetError = useCallback(() => dispatch(clearAuthError()), [dispatch]);

  return useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      isAuthenticated: Boolean(session),
      isAdmin: session?.user.role === 'admin',
      isLoading: status === 'loading',
      error,
      login,
      register,
      logout,
      resetError,
    }),
    [session, status, error, login, register, logout, resetError],
  );
}
