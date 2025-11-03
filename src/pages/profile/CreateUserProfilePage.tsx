import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  UserCircleIcon,
  PhoneIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useAppDispatch } from '../../hooks/redux';
import { useAuth } from '../../hooks/useAuth';
import { updateMyUserProfile, CreateMyUserProfileRequest } from '../../store/slices/userSlice';
import Button from '../../components/ui/Button';
import { toast } from 'react-toastify';

const schema = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  phone: yup.string().optional(),
});

const CreateUserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isPatient } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CreateMyUserProfileRequest>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
    },
  });

  useEffect(() => {
    if (user) {
      setValue('firstName', user.firstName);
      setValue('lastName', user.lastName);
      setValue('phone', user.phone || '');
    }
  }, [user, setValue]);

  const onSubmit = async (data: CreateMyUserProfileRequest) => {
    try {
      const result = await dispatch(updateMyUserProfile(data));
      if (updateMyUserProfile.fulfilled.match(result)) {
        toast.success('Profile updated successfully!');
        navigate('/dashboard');
      } else if (updateMyUserProfile.rejected.match(result)) {
        toast.error(result.payload as string || 'Failed to update profile');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update profile');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-secondary-50/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="relative overflow-hidden bg-gradient-to-br from-green-600 via-green-700 to-emerald-600 rounded-2xl p-8 text-white shadow-xl">
            <div className="relative z-10 flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <UserCircleIcon className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Update Your Profile</h1>
                <p className="text-xl text-green-100">
                  Keep your information up to date
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 space-y-4 border border-green-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-600 p-3 rounded-lg">
                  <UserCircleIcon className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('firstName')}
                    type="text"
                    className="input-field w-full"
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-error-600">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('lastName')}
                    type="text"
                    className="input-field w-full"
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-error-600">{errors.lastName.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      {...register('phone')}
                      type="tel"
                      className="pl-10 input-field w-full"
                      placeholder="01712345678"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Email:</strong> {user?.email}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Email cannot be changed. Contact admin if needed.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
              >
                <SparklesIcon className="h-5 w-5 mr-2" />
                Update Profile
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateUserProfilePage;

