import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import { getCurrentUser } from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, token, isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // If we have a token but no user data, fetch the current user
    // This will verify the token and get user data
    if (token && !user) {
      dispatch(getCurrentUser());
    }
  }, [token, user, dispatch]);

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    isAdmin: user?.role === 'Admin',
    isDoctor: user?.role === 'Doctor',
    isAssistant: user?.role === 'Assistant',
    isPatient: user?.role === 'User',
  };
};
