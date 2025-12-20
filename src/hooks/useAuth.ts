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

  // Helper to get role as string (handles both string and object)
  const getUserRole = () => {
    if (!user?.role) return '';
    return typeof user.role === 'string' ? user.role : user.role?.name || '';
  };

  const userRole = getUserRole();

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    isAdmin: userRole === 'Admin',
    isDoctor: userRole === 'Doctor',
    isAssistant: userRole === 'Assistant',
    isPatient: userRole === 'User',
  };
};
