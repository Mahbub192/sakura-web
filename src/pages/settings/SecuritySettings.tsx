import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../../services/api';
import { toast } from 'react-toastify';

const passwordSchema = yup.object().shape({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string().min(6, 'Password must be at least 6 characters').required('New password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your password'),
});

type PasswordFormData = yup.InferType<typeof passwordSchema>;

const SecuritySettings: React.FC = () => {
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: yupResolver(passwordSchema),
  });

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsUpdatingPassword(true);
    try {
      // Update password (backend will verify current password)
      await api.patch('/users/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      toast.success('Password updated successfully!');
      resetPassword();
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Current password is incorrect');
      } else {
        toast.error(error?.response?.data?.message || 'Failed to update password');
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Change Password</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          For security, choose a strong password you haven't used before.
        </p>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="current-password">
              Current Password
            </label>
            <div className="relative">
              <input
                {...registerPassword('currentPassword')}
                className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-background-light dark:bg-gray-800 text-sm focus:border-primary focus:ring-primary/50 pr-10"
                id="current-password"
                placeholder="••••••••"
                type={showCurrentPassword ? 'text' : 'password'}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <span className="material-symbols-outlined text-xl">
                  {showCurrentPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {passwordErrors.currentPassword && (
              <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
            )}
          </div>

          <div></div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="new-password">
              New Password
            </label>
            <div className="relative">
              <input
                {...registerPassword('newPassword')}
                className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-background-light dark:bg-gray-800 text-sm focus:border-primary focus:ring-primary/50 pr-10"
                id="new-password"
                placeholder="Enter new password"
                type={showNewPassword ? 'text' : 'password'}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <span className="material-symbols-outlined text-xl">
                  {showNewPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {passwordErrors.newPassword && (
              <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="confirm-password">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                {...registerPassword('confirmPassword')}
                className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-background-light dark:bg-gray-800 text-sm focus:border-primary focus:ring-primary/50 pr-10"
                id="confirm-password"
                placeholder="Confirm new password"
                type={showConfirmPassword ? 'text' : 'password'}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <span className="material-symbols-outlined text-xl">
                  {showConfirmPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {passwordErrors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword.message}</p>
            )}
          </div>
        </form>
      </div>

      <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
        <button
          type="button"
          onClick={handleSubmitPassword(onPasswordSubmit)}
          disabled={isUpdatingPassword}
          className="flex items-center justify-center gap-2 rounded-lg h-10 px-5 bg-primary text-white text-sm font-bold leading-normal shadow-sm hover:bg-primary/90 disabled:opacity-50"
        >
          {isUpdatingPassword ? 'Updating...' : 'Update Password'}
        </button>
      </div>
    </div>
  );
};

export default SecuritySettings;

