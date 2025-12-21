import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { CreateDoctorRequest } from '../../types';
import Button from '../ui/Button';

interface CreateDoctorFormProps {
  onSubmit: (data: CreateDoctorRequest) => void;
  onCancel: () => void;
}

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  specialization: yup.string().required('Specialization is required'),
  experience: yup.number().min(0, 'Experience cannot be negative').max(50, 'Experience cannot exceed 50 years'),
  licenseNumber: yup.string().required('License number is required'),
  qualification: yup.string().required('Qualification is required'),
  bio: yup.string().max(500, 'Bio cannot exceed 500 characters'),
  consultationFee: yup.number().min(0, 'Fee cannot be negative').required('Consultation fee is required'),
  userId: yup.number().required('User ID is required'),
});

const CreateDoctorForm: React.FC<CreateDoctorFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateDoctorRequest>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      experience: 0,
      consultationFee: 100,
    },
  });

  const handleFormSubmit = async (data: CreateDoctorRequest) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      console.error('Error creating doctor:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const specializations = [
    'General Medicine',
    'Cardiology',
    'Dermatology',
    'Endocrinology',
    'Gastroenterology',
    'Neurology',
    'Oncology',
    'Orthopedics',
    'Pediatrics',
    'Psychiatry',
    'Radiology',
    'Surgery',
    'Urology',
    'Gynecology',
    'Ophthalmology',
    'ENT (Ear, Nose, Throat)',
  ];

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-6"
    >
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            {...register('name')}
            type="text"
            id="name"
            className="input-field"
            placeholder="Enter doctor's full name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-error-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-2">
            Specialization *
          </label>
          <select
            {...register('specialization')}
            id="specialization"
            className="input-field"
          >
            <option value="">Select specialization</option>
            {specializations.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
          {errors.specialization && (
            <p className="mt-1 text-sm text-error-600">{errors.specialization.message}</p>
          )}
        </div>
      </div>

      {/* Professional Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="qualification" className="block text-sm font-medium text-gray-700 mb-2">
            Qualification *
          </label>
          <input
            {...register('qualification')}
            type="text"
            id="qualification"
            className="input-field"
            placeholder="e.g., MBBS, MD, PhD"
          />
          {errors.qualification && (
            <p className="mt-1 text-sm text-error-600">{errors.qualification.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-2">
            License Number *
          </label>
          <input
            {...register('licenseNumber')}
            type="text"
            id="licenseNumber"
            className="input-field"
            placeholder="Enter medical license number"
          />
          {errors.licenseNumber && (
            <p className="mt-1 text-sm text-error-600">{errors.licenseNumber.message}</p>
          )}
        </div>
      </div>

      {/* Experience and Fee */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
            Years of Experience
          </label>
          <input
            {...register('experience', { valueAsNumber: true })}
            type="number"
            id="experience"
            min="0"
            max="50"
            className="input-field"
            placeholder="Enter years of experience"
          />
          {errors.experience && (
            <p className="mt-1 text-sm text-error-600">{errors.experience.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="consultationFee" className="block text-sm font-medium text-gray-700 mb-2">
            Consultation Fee (৳) *
          </label>
          <input
            {...register('consultationFee', { valueAsNumber: true })}
            type="number"
            id="consultationFee"
            min="0"
            step="0.01"
            className="input-field"
            placeholder="Enter consultation fee"
          />
          {errors.consultationFee && (
            <p className="mt-1 text-sm text-error-600">{errors.consultationFee.message}</p>
          )}
        </div>
      </div>

      {/* User ID */}
      <div>
        <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
          User ID *
        </label>
        <input
          {...register('userId', { valueAsNumber: true })}
          type="number"
          id="userId"
          className="input-field"
          placeholder="Enter associated user ID"
        />
        <p className="mt-1 text-xs text-gray-500">
          The user ID of the existing user account for this doctor
        </p>
        {errors.userId && (
          <p className="mt-1 text-sm text-error-600">{errors.userId.message}</p>
        )}
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
          Bio (Optional)
        </label>
        <textarea
          {...register('bio')}
          id="bio"
          rows={4}
          className="input-field"
          placeholder="Enter a brief biography or description"
        />
        {errors.bio && (
          <p className="mt-1 text-sm text-error-600">{errors.bio.message}</p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={isLoading}
        >
          Create Doctor
        </Button>
      </div>
    </motion.form>
  );
};

export default CreateDoctorForm;
