import React from 'react';
import { motion } from 'framer-motion';
import { 
  UserIcon,
  AcademicCapIcon,
  ClockIcon,
  CurrencyDollarIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { Doctor } from '../../types';

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
      whileHover={{ y: -2 }}
      className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="bg-gradient-to-br from-primary-100 to-primary-50 p-1.5 rounded-md flex-shrink-0">
            <UserIcon className="h-4 w-4 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-900 truncate">Dr. {doctor.name}</h3>
            <p className="text-xs text-gray-500 truncate">{doctor.specialization}</p>
          </div>
        </div>
        
        {(canEdit || canDelete) && (
          <div className="flex gap-1 flex-shrink-0 ml-2">
            {canEdit && onEdit && (
              <button
                onClick={() => onEdit(doctor)}
                className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                title="Edit"
              >
                <PencilIcon className="h-3.5 w-3.5" />
              </button>
            )}
            {canDelete && onDelete && (
              <button
                onClick={() => onDelete(doctor.id)}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Delete"
              >
                <TrashIcon className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <AcademicCapIcon className="h-3.5 w-3.5 text-primary-500 flex-shrink-0" />
          <span className="truncate">{doctor.qualification}</span>
        </div>
        
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <ClockIcon className="h-3.5 w-3.5 text-primary-500 flex-shrink-0" />
          <span>{doctor.experience || 0} years experience</span>
        </div>
        
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <CurrencyDollarIcon className="h-3.5 w-3.5 text-primary-500 flex-shrink-0" />
          <span className="font-semibold text-gray-900">${doctor.consultationFee}</span>
        </div>

        {doctor.licenseNumber && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="font-medium">License:</span>
            <span className="truncate">{doctor.licenseNumber}</span>
          </div>
        )}
      </div>

      {/* Bio */}
      {doctor.bio && (
        <div className="mb-3 pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-600 line-clamp-2">{doctor.bio}</p>
        </div>
      )}

      {/* User Info */}
      <div className="mb-3 pt-2 border-t border-gray-200">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="text-xs text-gray-600 truncate">
            <span className="font-medium">Email:</span> <span className="truncate">{doctor.user?.email || 'N/A'}</span>
          </div>
          <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 ${
            doctor.user?.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {doctor.user?.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        {doctor.user?.phone && (
          <div className="text-xs text-gray-600">
            <span className="font-medium">Phone:</span> {doctor.user.phone}
          </div>
        )}
      </div>

      {/* Assistants */}
      {doctor.assistants && doctor.assistants.length > 0 && (
        <div className="mb-3 pt-2 border-t border-gray-200">
          <div className="text-xs">
            <span className="font-medium text-gray-700">Assistants ({doctor.assistants.length}):</span>
            <div className="mt-1 space-y-0.5">
              {doctor.assistants.slice(0, 2).map(assistant => (
                <div key={assistant.id} className="text-xs text-gray-600 truncate">
                  {assistant.name} - {assistant.email}
                </div>
              ))}
              {doctor.assistants.length > 2 && (
                <div className="text-xs text-primary-600 font-medium">
                  +{doctor.assistants.length - 2} more
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="pt-2 border-t border-gray-200">
        <button
          onClick={() => {
            console.log('View appointments for', doctor.name);
          }}
          className="w-full py-1.5 px-3 text-xs font-semibold bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-md hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          View Appointments
        </button>
      </div>
    </motion.div>
  );
};

export default DoctorCard;
