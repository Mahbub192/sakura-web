import React from 'react';
import { motion } from 'framer-motion';
import { 
  UserIcon,
  AcademicCapIcon,
  ClockIcon,
  CurrencyDollarIcon,
  PencilIcon,
  TrashIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { Doctor } from '../../types';
import Button from '../ui/Button';

interface DoctorCardProps {
  doctor: Doctor;
  onEdit?: (doctor: Doctor) => void;
  onDelete?: (doctorId: number) => void;
  userRole: string;
}

const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  onEdit,
  onDelete,
  userRole,
}) => {
  const canEdit = ['Admin'].includes(userRole);
  const canDelete = ['Admin'].includes(userRole);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white border border-gray-200 rounded-xl p-6 shadow-soft hover:shadow-medium transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-primary-100 p-3 rounded-full">
            <UserIcon className="h-8 w-8 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Dr. {doctor.name}</h3>
            <p className="text-sm text-gray-600">{doctor.specialization}</p>
          </div>
        </div>
        
        {(canEdit || canDelete) && (
          <div className="flex space-x-2">
            {canEdit && onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(doctor)}
                icon={<PencilIcon className="h-4 w-4" />}
              >
                Edit
              </Button>
            )}
            {canDelete && onDelete && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => onDelete(doctor.id)}
                icon={<TrashIcon className="h-4 w-4" />}
              >
                Delete
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="space-y-3">
        <div className="flex items-center text-sm text-gray-600">
          <AcademicCapIcon className="h-4 w-4 mr-2 text-gray-400" />
          <span>{doctor.qualification}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
          <span>{doctor.experience || 0} years experience</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <CurrencyDollarIcon className="h-4 w-4 mr-2 text-gray-400" />
          <span>${doctor.consultationFee} consultation fee</span>
        </div>

        {doctor.licenseNumber && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">License:</span> {doctor.licenseNumber}
          </div>
        )}
      </div>

      {/* Bio */}
      {doctor.bio && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 line-clamp-3">{doctor.bio}</p>
        </div>
      )}

      {/* User Info */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-600">
            <span className="font-medium">Email:</span> {doctor.user.email}
          </div>
          <div className={`badge ${doctor.user.isActive ? 'badge-success' : 'badge-error'}`}>
            {doctor.user.isActive ? 'Active' : 'Inactive'}
          </div>
        </div>
        {doctor.user.phone && (
          <div className="text-sm text-gray-600 mt-1">
            <span className="font-medium">Phone:</span> {doctor.user.phone}
          </div>
        )}
      </div>

      {/* Assistants */}
      {doctor.assistants && doctor.assistants.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm">
            <span className="font-medium text-gray-700">Assistants:</span>
            <div className="mt-1 space-y-1">
              {doctor.assistants.map(assistant => (
                <div key={assistant.id} className="text-gray-600">
                  {assistant.name} - {assistant.email}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="mt-6">
        <Button
          variant="primary"
          className="w-full"
          onClick={() => {
            // Handle view appointments or booking
            console.log('View appointments for', doctor.name);
          }}
        >
          View Appointments
        </Button>
      </div>
    </motion.div>
  );
};

export default DoctorCard;
