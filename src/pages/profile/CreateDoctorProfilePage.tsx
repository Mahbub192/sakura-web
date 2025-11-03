import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  UserCircleIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ClockIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useAppDispatch } from '../../hooks/redux';
import { useAuth } from '../../hooks/useAuth';
import { createMyDoctorProfile, CreateMyDoctorProfileRequest } from '../../store/slices/doctorSlice';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  specialization: yup.string().required('Specialization is required'),
  licenseNumber: yup.string().required('License number is required'),
  qualification: yup.string().required('Qualification is required'),
  consultationFee: yup.number().min(0.01, 'Fee must be greater than 0').required('Consultation fee is required'),
  experience: yup.number().min(0, 'Experience must be 0 or greater').optional(),
  bio: yup.string().optional(),
  profileImage: yup.string().url('Invalid URL').optional(),
  availableDays: yup.array().optional(),
  generalAvailableStart: yup.string().optional(),
  generalAvailableEnd: yup.string().optional(),
  defaultConsultationDuration: yup.number().min(15).optional(),
  services: yup.array().optional(),
  contactInfo: yup.object().optional(),
});

const CreateDoctorProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isDoctor } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateMyDoctorProfileRequest>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      defaultConsultationDuration: 30,
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      generalAvailableStart: '09:00',
      generalAvailableEnd: '17:00',
    },
  });

  useEffect(() => {
    if (!isDoctor) {
      navigate('/dashboard');
    }
  }, [isDoctor, navigate]);

  const onSubmit = async (data: CreateMyDoctorProfileRequest) => {
    setIsLoading(true);
    try {
      const result = await dispatch(createMyDoctorProfile(data));
      if (createMyDoctorProfile.fulfilled.match(result)) {
        toast.success('Doctor profile created successfully!');
        navigate('/dashboard');
      } else if (createMyDoctorProfile.rejected.match(result)) {
        toast.error(result.payload as string || 'Failed to create profile');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create profile');
    } finally {
      setIsLoading(false);
    }
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-secondary-50/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 rounded-2xl p-8 text-white shadow-xl">
            <div className="relative z-10 flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <UserCircleIcon className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Create Doctor Profile</h1>
                <p className="text-xl text-primary-100">
                  Complete your profile to start managing appointments
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
            {/* Basic Information */}
            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl p-6 space-y-4 border border-primary-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary-600 p-3 rounded-lg">
                  <UserCircleIcon className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    className="input-field w-full"
                    placeholder="Dr. John Doe"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-error-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Specialization <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('specialization')}
                    type="text"
                    className="input-field w-full"
                    placeholder="Cardiology"
                  />
                  {errors.specialization && (
                    <p className="mt-1 text-sm text-error-600">{errors.specialization.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    License Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('licenseNumber')}
                    type="text"
                    className="input-field w-full"
                    placeholder="BM-12345"
                  />
                  {errors.licenseNumber && (
                    <p className="mt-1 text-sm text-error-600">{errors.licenseNumber.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Qualification <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('qualification')}
                    type="text"
                    className="input-field w-full"
                    placeholder="MBBS, MD"
                  />
                  {errors.qualification && (
                    <p className="mt-1 text-sm text-error-600">{errors.qualification.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Years of Experience
                  </label>
                  <input
                    {...register('experience', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    className="input-field w-full"
                    placeholder="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Consultation Fee (৳) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      {...register('consultationFee', { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      min="0.01"
                      className="pl-10 input-field w-full"
                      placeholder="1000"
                    />
                  </div>
                  {errors.consultationFee && (
                    <p className="mt-1 text-sm text-error-600">{errors.consultationFee.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bio/Description
                </label>
                <textarea
                  {...register('bio')}
                  rows={3}
                  className="input-field w-full"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Profile Image URL
                </label>
                <input
                  {...register('profileImage')}
                  type="url"
                  className="input-field w-full"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            {/* Availability */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 space-y-4 border border-blue-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-600 p-3 rounded-lg">
                  <CalendarIcon className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Availability</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Available Days
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {daysOfWeek.map(day => (
                      <label key={day} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-primary-300">
                        <input
                          type="checkbox"
                          value={day}
                          {...register('availableDays')}
                          className="rounded"
                        />
                        <span className="text-sm">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      General Start Time
                    </label>
                    <input
                      {...register('generalAvailableStart')}
                      type="time"
                      className="input-field w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      General End Time
                    </label>
                    <input
                      {...register('generalAvailableEnd')}
                      type="time"
                      className="input-field w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Default Consultation Duration (minutes)
                    </label>
                    <input
                      {...register('defaultConsultationDuration', { valueAsNumber: true })}
                      type="number"
                      min="15"
                      step="15"
                      className="input-field w-full"
                      placeholder="30"
                    />
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
                loading={isLoading}
              >
                <SparklesIcon className="h-5 w-5 mr-2" />
                Create Profile
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateDoctorProfilePage;

