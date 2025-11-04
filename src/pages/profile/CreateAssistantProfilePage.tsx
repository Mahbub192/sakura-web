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
import { 
  createMyAssistantProfile, 
  updateMyAssistantProfile,
  fetchCurrentAssistantProfile,
  checkAssistantProfileExists,
  CreateMyAssistantProfileRequest 
} from '../../store/slices/assistantSlice';
import { fetchDoctors } from '../../store/slices/doctorSlice';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';

const createSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  phone: yup.string().required('Phone number is required'),
  doctorId: yup.number().required('Doctor selection is required'),
  qualification: yup.string().optional(),
  experience: yup.number().min(0).optional(),
});

const updateSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  qualification: yup.string().optional(),
  experience: yup.number().min(0).optional(),
});

const CreateAssistantProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAssistant } = useAuth();
  const { doctors } = useAppSelector((state) => state.doctors);
  const { isLoading, currentAssistantProfile } = useAppSelector((state) => state.assistants);
  const [submitting, setSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateMyAssistantProfileRequest>({
    resolver: yupResolver(isEditMode ? updateSchema : createSchema) as any,
  });

  useEffect(() => {
    if (!isAssistant) {
      navigate('/dashboard');
      return;
    }
    
    const checkProfile = async () => {
      setCheckingProfile(true);
      try {
        // Try to fetch the profile directly first (most reliable way)
        try {
          const profile = await dispatch(fetchCurrentAssistantProfile()).unwrap();
          // Profile exists - switch to edit mode
          setIsEditMode(true);
          // Populate form with existing data
          setValue('name', profile.name);
          setValue('qualification', profile.qualification || '');
          setValue('experience', profile.experience);
          // Note: phone and doctorId are not editable in edit mode
        } catch (fetchError: any) {
          // Profile doesn't exist or can't be fetched
          // Try check-profile endpoint as fallback
          try {
            const exists = await dispatch(checkAssistantProfileExists()).unwrap();
            if (exists) {
              // Try fetching again
              const profile = await dispatch(fetchCurrentAssistantProfile()).unwrap();
              setIsEditMode(true);
              setValue('name', profile.name);
              setValue('qualification', profile.qualification || '');
              setValue('experience', profile.experience);
            }
          } catch (checkError: any) {
            // Both failed - profile doesn't exist, stay in create mode
            if (checkError?.response?.status !== 403 && checkError?.response?.status !== 404) {
              console.error('Error checking profile:', checkError);
            }
          }
        }
        // Fetch doctors for doctor dropdown (needed for create mode and to show doctor name in edit mode)
        await dispatch(fetchDoctors());
      } catch (error: any) {
        // Final fallback - stay in create mode
        console.error('Error in profile check:', error);
        dispatch(fetchDoctors());
      } finally {
        setCheckingProfile(false);
      }
    };

    checkProfile();
  }, [isAssistant, navigate, dispatch, setValue]);

  const onSubmit = async (data: CreateMyAssistantProfileRequest | { name?: string; qualification?: string; experience?: number }) => {
    setSubmitting(true);
    try {
      if (isEditMode) {
        // Update existing profile (only name, qualification, experience)
        const updateData = {
          name: data.name,
          qualification: data.qualification,
          experience: data.experience,
        };
        const result = await dispatch(updateMyAssistantProfile(updateData));
        if (updateMyAssistantProfile.fulfilled.match(result)) {
          toast.success('Assistant profile updated successfully!');
          navigate('/dashboard');
        } else if (updateMyAssistantProfile.rejected.match(result)) {
          toast.error(result.payload as string || 'Failed to update profile');
        }
      } else {
        // Create new profile
        const result = await dispatch(createMyAssistantProfile(data as CreateMyAssistantProfileRequest));
        if (createMyAssistantProfile.fulfilled.match(result)) {
          toast.success('Assistant profile created successfully!');
          navigate('/dashboard');
        } else if (createMyAssistantProfile.rejected.match(result)) {
          const errorMessage = result.payload as string || '';
          
          // If profile already exists (409 Conflict), fetch it and switch to edit mode
          if (errorMessage.includes('already exists') || errorMessage.includes('Conflict')) {
            try {
              toast.info('Profile already exists. Loading your profile...');
              const profile = await dispatch(fetchCurrentAssistantProfile()).unwrap();
              setIsEditMode(true);
              // Populate form with existing data
              setValue('name', profile.name);
              setValue('qualification', profile.qualification || '');
              setValue('experience', profile.experience);
              toast.success('Profile loaded. You can now update your information.');
            } catch (fetchError) {
              toast.error('Failed to load existing profile. Please try again.');
              console.error('Error fetching profile:', fetchError);
            }
          } else {
            toast.error(errorMessage || 'Failed to create profile');
          }
        }
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

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
                <h1 className="text-4xl font-bold mb-2">
                  {isEditMode ? 'Update Assistant Profile' : 'Create Assistant Profile'}
                </h1>
                <p className="text-xl text-blue-100">
                  {isEditMode 
                    ? 'Update your profile information' 
                    : 'Complete your profile to start managing appointments'}
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

                {!isEditMode && (
                  <>
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
                  </>
                )}

                {isEditMode && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="tel"
                          value={currentAssistantProfile?.phone || ''}
                          disabled
                          className="pl-10 input-field w-full bg-gray-100 cursor-not-allowed"
                          readOnly
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Phone number cannot be changed</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Doctor to Work Under
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={(() => {
                            if (currentAssistantProfile?.doctor) {
                              return `Dr. ${currentAssistantProfile.doctor.name} - ${currentAssistantProfile.doctor.specialization}`;
                            }
                            const doctor = doctors.find(d => d.id === currentAssistantProfile?.doctorId);
                            if (doctor) {
                              return `Dr. ${doctor.name} - ${doctor.specialization}`;
                            }
                            return 'Loading...';
                          })()}
                          disabled
                          className="input-field w-full bg-gray-100 cursor-not-allowed"
                          readOnly
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Doctor assignment cannot be changed</p>
                    </div>
                  </>
                )}

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
                {isEditMode ? 'Update Profile' : 'Create Profile'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateAssistantProfilePage;

