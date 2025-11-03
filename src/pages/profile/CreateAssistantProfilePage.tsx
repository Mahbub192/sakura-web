import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  UserCircleIcon,
  PhoneIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useAuth } from '../../hooks/useAuth';
import { createMyAssistantProfile, CreateMyAssistantProfileRequest } from '../../store/slices/assistantSlice';
import { fetchDoctors } from '../../store/slices/doctorSlice';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  phone: yup.string().required('Phone number is required'),
  doctorId: yup.number().required('Doctor selection is required'),
  qualification: yup.string().optional(),
  experience: yup.number().min(0).optional(),
});

const CreateAssistantProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAssistant } = useAuth();
  const { doctors } = useAppSelector((state) => state.doctors);
  const { isLoading } = useAppSelector((state) => state.assistants);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateMyAssistantProfileRequest>({
    resolver: yupResolver(schema) as any,
  });

  useEffect(() => {
    if (!isAssistant) {
      navigate('/dashboard');
    }
    dispatch(fetchDoctors());
  }, [isAssistant, navigate, dispatch]);

  const onSubmit = async (data: CreateMyAssistantProfileRequest) => {
    setSubmitting(true);
    try {
      const result = await dispatch(createMyAssistantProfile(data));
      if (createMyAssistantProfile.fulfilled.match(result)) {
        toast.success('Assistant profile created successfully!');
        navigate('/dashboard');
      } else if (createMyAssistantProfile.rejected.match(result)) {
        toast.error(result.payload as string || 'Failed to create profile');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-secondary-50/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 rounded-2xl p-8 text-white shadow-xl">
            <div className="relative z-10 flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <UserCircleIcon className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Create Assistant Profile</h1>
                <p className="text-xl text-blue-100">
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
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 space-y-4 border border-blue-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-600 p-3 rounded-lg">
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
                    placeholder="Your full name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-error-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
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
                  {errors.phone && (
                    <p className="mt-1 text-sm text-error-600">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Doctor to Work Under <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('doctorId', { valueAsNumber: true })}
                    className="input-field w-full"
                  >
                    <option value="">Select a doctor</option>
                    {doctors.map(doctor => (
                      <option key={doctor.id} value={doctor.id}>
                        Dr. {doctor.name} - {doctor.specialization}
                      </option>
                    ))}
                  </select>
                  {errors.doctorId && (
                    <p className="mt-1 text-sm text-error-600">{errors.doctorId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Qualification
                  </label>
                  <div className="relative">
                    <AcademicCapIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      {...register('qualification')}
                      type="text"
                      className="pl-10 input-field w-full"
                      placeholder="Nursing, Medical Assistant, etc."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Years of Experience
                  </label>
                  <div className="relative">
                    <BriefcaseIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      {...register('experience', { valueAsNumber: true })}
                      type="number"
                      min="0"
                      className="pl-10 input-field w-full"
                      placeholder="0"
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
                loading={submitting || isLoading}
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

export default CreateAssistantProfilePage;

