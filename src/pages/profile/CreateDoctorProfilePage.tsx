import {
  AcademicCapIcon,
  BriefcaseIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  SparklesIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { yupResolver } from '@hookform/resolvers/yup';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import Button from '../../components/ui/Button';
import { useAppDispatch } from '../../hooks/redux';
import { useAuth } from '../../hooks/useAuth';
import { createMyDoctorProfile, CreateMyDoctorProfileRequest } from '../../store/slices/doctorSlice';

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
    watch,
    setValue,
  } = useForm<CreateMyDoctorProfileRequest>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      defaultConsultationDuration: 30,
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      generalAvailableStart: '09:00',
      generalAvailableEnd: '17:00',
    },
  });

  const selectedDays = watch('availableDays') || [];

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

  const handleDayToggle = (day: string) => {
    const currentDays = selectedDays || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    setValue('availableDays', newDays);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/20 to-secondary-50/10 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">


        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
              {/* Basic Information - Left Side */}
              <div className="p-6 md:p-8 bg-gradient-to-br from-primary-50/50 via-white to-secondary-50/30">
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-primary-200/50">
                  <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-3 rounded-xl shadow-lg">
                    <UserCircleIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Basic Information</h2>
                    <p className="text-sm text-gray-600">Your professional details and credentials</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('name')}
                      type="text"
                      className="input-field w-full mt-1.5"
                      placeholder="Dr. John Doe"
                    />
                    {errors.name && (
                      <p className="mt-1.5 text-sm text-error-600 flex items-center gap-1">
                        <InformationCircleIcon className="h-4 w-4" />
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <AcademicCapIcon className="h-4 w-4 text-primary-600" />
                      Specialization <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('specialization')}
                      type="text"
                      className="input-field w-full mt-1.5"
                      placeholder="e.g., Cardiology, Pediatrics, Neurology"
                    />
                    {errors.specialization && (
                      <p className="mt-1.5 text-sm text-error-600 flex items-center gap-1">
                        <InformationCircleIcon className="h-4 w-4" />
                        {errors.specialization.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <DocumentTextIcon className="h-4 w-4 text-primary-600" />
                      License Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('licenseNumber')}
                      type="text"
                      className="input-field w-full mt-1.5 font-mono"
                      placeholder="BM-12345"
                    />
                    <p className="text-xs text-gray-500 mt-1">Your medical license registration number</p>
                    {errors.licenseNumber && (
                      <p className="mt-1.5 text-sm text-error-600 flex items-center gap-1">
                        <InformationCircleIcon className="h-4 w-4" />
                        {errors.licenseNumber.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <AcademicCapIcon className="h-4 w-4 text-primary-600" />
                      Qualification <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('qualification')}
                      type="text"
                      className="input-field w-full mt-1.5"
                      placeholder="MBBS, MD, MS, etc."
                    />
                    {errors.qualification && (
                      <p className="mt-1.5 text-sm text-error-600 flex items-center gap-1">
                        <InformationCircleIcon className="h-4 w-4" />
                        {errors.qualification.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <BriefcaseIcon className="h-4 w-4 text-primary-600" />
                      Years of Experience
                    </label>
                    <input
                      {...register('experience', { valueAsNumber: true })}
                      type="number"
                      min="0"
                      className="input-field w-full mt-1.5"
                      placeholder="10"
                    />
                    <p className="text-xs text-gray-500 mt-1">Total years of professional experience</p>
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <CurrencyDollarIcon className="h-4 w-4 text-primary-600" />
                      Consultation Fee (৳) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-1.5">
                      <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                      <input
                        {...register('consultationFee', { valueAsNumber: true })}
                        type="number"
                        step="0.01"
                        min="0.01"
                        className="pl-10 input-field w-full"
                        placeholder="1000.00"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Standard consultation fee per visit</p>
                    {errors.consultationFee && (
                      <p className="mt-1.5 text-sm text-error-600 flex items-center gap-1">
                        <InformationCircleIcon className="h-4 w-4" />
                        {errors.consultationFee.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <DocumentTextIcon className="h-4 w-4 text-primary-600" />
                      Professional Bio
                    </label>
                    <textarea
                      {...register('bio')}
                      rows={4}
                      className="input-field w-full mt-1.5 resize-none"
                      placeholder="Write a brief professional biography highlighting your expertise, achievements, and approach to patient care..."
                    />
                    <p className="text-xs text-gray-500 mt-1">This will be visible to patients</p>
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <UserCircleIcon className="h-4 w-4 text-primary-600" />
                      Profile Image URL
                    </label>
                    <input
                      {...register('profileImage')}
                      type="url"
                      className="input-field w-full mt-1.5"
                      placeholder="https://example.com/your-profile-image.jpg"
                    />
                    <p className="text-xs text-gray-500 mt-1">URL to your professional profile photo</p>
                  </div>
                </div>
              </div>

              {/* Availability & Schedule - Right Side */}
              <div className="p-6 md:p-8 bg-gradient-to-br from-blue-50/50 via-white to-cyan-50/30 lg:pl-8">
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-blue-200/50">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-xl shadow-lg">
                    <CalendarIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Availability & Schedule</h2>
                    <p className="text-sm text-gray-600">Set your working hours and consultation preferences</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <CalendarIcon className="h-4 w-4 text-blue-600" />
                      Available Days
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {daysOfWeek.map(day => {
                        const isSelected = selectedDays.includes(day);
                        return (
                          <motion.label
                            key={day}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`
                              flex items-center gap-2.5 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200
                              ${isSelected 
                                ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                                : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                              }
                            `}
                          >
                            <input
                              type="checkbox"
                              value={day}
                              checked={isSelected}
                              onChange={() => handleDayToggle(day)}
                              className="sr-only"
                            />
                            <div className={`
                              w-4 h-4 rounded border-2 flex items-center justify-center transition-all
                              ${isSelected 
                                ? 'border-white bg-white' 
                                : 'border-gray-400 bg-white'
                              }
                            `}>
                              {isSelected && (
                                <CheckCircleIcon className="h-3 w-3 text-blue-600" />
                              )}
                            </div>
                            <span className="text-sm font-medium">{day.slice(0, 3)}</span>
                          </motion.label>
                        );
                      })}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Select the days you're available for consultations</p>
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-1">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <ClockIcon className="h-4 w-4 text-blue-600" />
                        General Start Time
                      </label>
                      <input
                        {...register('generalAvailableStart')}
                        type="time"
                        className="input-field w-full mt-1.5"
                      />
                      <p className="text-xs text-gray-500 mt-1">Your typical start time</p>
                    </div>

                    <div className="space-y-1">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <ClockIcon className="h-4 w-4 text-blue-600" />
                        General End Time
                      </label>
                      <input
                        {...register('generalAvailableEnd')}
                        type="time"
                        className="input-field w-full mt-1.5"
                      />
                      <p className="text-xs text-gray-500 mt-1">Your typical end time</p>
                    </div>

                    <div className="space-y-1">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <ClockIcon className="h-4 w-4 text-blue-600" />
                        Consultation Duration (minutes)
                      </label>
                      <input
                        {...register('defaultConsultationDuration', { valueAsNumber: true })}
                        type="number"
                        min="15"
                        step="15"
                        className="input-field w-full mt-1.5"
                        placeholder="30"
                      />
                      <p className="text-xs text-gray-500 mt-1">Default duration for each appointment (15, 30, 45, or 60 minutes)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 md:p-8 bg-gray-50 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-600">
                  <p className="flex items-center gap-2">
                    <InformationCircleIcon className="h-4 w-4 text-gray-400" />
                    All fields marked with <span className="text-red-500">*</span> are required
                  </p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate('/dashboard')}
                    className="flex-1 sm:flex-none"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={isLoading}
                    size="lg"
                    className="flex-1 sm:flex-none"
                  >
                    {!isLoading && <SparklesIcon className="h-5 w-5 mr-2" />}
                    Create Profile
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateDoctorProfilePage;

