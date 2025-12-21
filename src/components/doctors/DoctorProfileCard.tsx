import React from 'react';
import { motion } from 'framer-motion';
import { 
  UserIcon,
  AcademicCapIcon,
  ClockIcon,
  CurrencyDollarIcon,
  PencilIcon,
  IdentificationIcon,
  EnvelopeIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import { Doctor } from '../../types';
import Button from '../ui/Button';

interface DoctorProfileCardProps {
  doctor: Doctor;
  onEdit?: () => void;
}

const DoctorProfileCard: React.FC<DoctorProfileCardProps> = ({
  doctor,
  onEdit,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-primary-100 p-4 rounded-full">
            <UserIcon className="h-12 w-12 text-primary-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dr. {doctor.name}</h2>
            <p className="text-lg text-gray-600">{doctor.specialization}</p>
          </div>
        </div>
        {onEdit && (
          <Button
            variant="outline"
            onClick={onEdit}
            icon={<PencilIcon className="h-4 w-4" />}
          >
            Edit Profile
          </Button>
        )}
      </div>

      {/* Professional Information */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <AcademicCapIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Qualification</p>
              <p className="font-medium text-gray-900">{doctor.qualification}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <IdentificationIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">License Number</p>
              <p className="font-medium text-gray-900">{doctor.licenseNumber}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <ClockIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Experience</p>
              <p className="font-medium text-gray-900">{doctor.experience || 0} years</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Consultation Fee</p>
              <p className="font-medium text-gray-900">৳{doctor.consultationFee}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <EnvelopeIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium text-gray-900">{doctor.user.email}</p>
            </div>
          </div>
          
          {doctor.user.phone && (
            <div className="flex items-center space-x-3">
              <PhoneIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium text-gray-900">{doctor.user.phone}</p>
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-3">
            <UserIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Full Name</p>
              <p className="font-medium text-gray-900">{doctor.user.firstName} {doctor.user.lastName}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="h-5 w-5 flex items-center justify-center">
              <div className={`h-3 w-3 rounded-full ${doctor.user.isActive ? 'bg-success-500' : 'bg-error-500'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Account Status</p>
              <p className={`font-medium ${doctor.user.isActive ? 'text-success-600' : 'text-error-600'}`}>
                {doctor.user.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      {doctor.bio && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
          <p className="text-gray-700 leading-relaxed">{doctor.bio}</p>
        </div>
      )}

      {/* Assistants */}
      {doctor.assistants && doctor.assistants.length > 0 && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Assistants</h3>
          <div className="space-y-3">
            {doctor.assistants.map(assistant => (
              <div key={assistant.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{assistant.name}</p>
                  <p className="text-sm text-gray-600">{assistant.email}</p>
                  {assistant.phone && (
                    <p className="text-sm text-gray-600">{assistant.phone}</p>
                  )}
                </div>
                <div className={`badge ${assistant.isActive ? 'badge-success' : 'badge-error'}`}>
                  {assistant.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Account Details */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">User ID</p>
            <p className="font-medium text-gray-900">{doctor.userId}</p>
          </div>
          <div>
            <p className="text-gray-600">Doctor ID</p>
            <p className="font-medium text-gray-900">{doctor.id}</p>
          </div>
          <div>
            <p className="text-gray-600">Created</p>
            <p className="font-medium text-gray-900">
              {new Date(doctor.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Last Updated</p>
            <p className="font-medium text-gray-900">
              {new Date(doctor.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DoctorProfileCard;
