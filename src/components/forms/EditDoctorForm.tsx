import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { Doctor, CreateDoctorRequest } from '../../types';
import Button from '../ui/Button';

interface EditDoctorFormProps {
  doctor: Doctor;
  onSubmit: (data: Partial<CreateDoctorRequest>) => void;
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
});

const EditDoctorForm: React.FC<EditDoctorFormProps> = ({
  doctor,
  onSubmit,
  onCancel,
}) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Partial<CreateDoctorRequest>>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      name: doctor.name,
      specialization: doctor.specialization,
      experience: doctor.experience || 0,
      licenseNumber: doctor.licenseNumber,
      qualification: doctor.qualification,
      bio: doctor.bio || '',
      consultationFee: doctor.consultationFee,
    },
  });

  const handleFormSubmit = async (data: Partial<CreateDoctorRequest>) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Error updating doctor:', error);
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

      {/* Current User Info (Read Only) */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Associated User Account</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p><span className="font-medium">Email:</span> {doctor.user.email}</p>
          <p><span className="font-medium">Name:</span> {doctor.user.firstName} {doctor.user.lastName}</p>
          <p><span className="font-medium">Status:</span> 
            <span className={`ml-2 badge ${doctor.user.isActive ? 'badge-success' : 'badge-error'}`}>
              {doctor.user.isActive ? 'Active' : 'Inactive'}
            </span>
          </p>
        </div>
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
          Update Doctor
        </Button>
      </div>
    </motion.form>
  );
};

export default EditDoctorForm;
