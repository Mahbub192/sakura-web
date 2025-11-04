import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  UserIcon,
  CalendarDaysIcon,
  ClockIcon,
  EnvelopeIcon,
  PhoneIcon,
  EyeIcon,
  IdentificationIcon,
} from '@heroicons/react/24/outline';
import { TokenAppointment } from '../../types';
import Button from '../ui/Button';

interface PatientCardProps {
  appointment: TokenAppointment;
  onStatusUpdate: (id: number, status: string) => void;
  onViewDetails: (appointment: TokenAppointment) => void;
  userRole: string;
}

const PatientCard: React.FC<PatientCardProps> = ({
  appointment,
  onStatusUpdate,
  onViewDetails,
  userRole,
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'badge-success';
      case 'pending':
        return 'badge-warning';
      case 'completed':
        return 'badge-primary';
      case 'cancelled':
      case 'no show':
        return 'badge-error';
      default:
        return 'badge-primary';
    }
  };

  const canUpdateStatus = ['Admin', 'Doctor', 'Assistant'].includes(userRole);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2.5">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="bg-gradient-to-br from-primary-100 to-primary-50 p-1.5 rounded-md flex-shrink-0">
            <UserIcon className="h-4 w-4 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-900 truncate">{appointment.patientName}</h3>
            <p className="text-xs text-gray-600">{appointment.patientAge} years, {appointment.patientGender}</p>
          </div>
        </div>
        
        <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 ${
          appointment.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
          appointment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
          appointment.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
          'bg-red-100 text-red-800'
        }`}>
          {appointment.status}
        </span>
      </div>

      {/* Contact Information */}
      <div className="space-y-1.5 mb-2.5">
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <EnvelopeIcon className="h-3.5 w-3.5 text-primary-500 flex-shrink-0" />
          <span className="truncate">{appointment.patientEmail}</span>
        </div>
        
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <PhoneIcon className="h-3.5 w-3.5 text-primary-500 flex-shrink-0" />
          <span>{appointment.patientPhone}</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <IdentificationIcon className="h-3.5 w-3.5 text-primary-500 flex-shrink-0" />
          <span className="truncate">Token: <span className="font-semibold">{appointment.tokenNumber}</span></span>
        </div>
      </div>

      {/* Appointment Details */}
      <div className="bg-gray-50 p-2 rounded-md mb-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <CalendarDaysIcon className="h-3.5 w-3.5 text-primary-500" />
            <span>{format(new Date(appointment.date), 'MMM dd, yyyy')}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <ClockIcon className="h-3.5 w-3.5 text-primary-500" />
            <span>{appointment.time}</span>
          </div>
        </div>
        
        <div className="text-xs text-gray-700 space-y-0.5">
          <p className="truncate"><span className="font-medium">Doctor:</span> Dr. {appointment.doctor?.name || 'N/A'}</p>
          <p className="truncate"><span className="font-medium">Specialization:</span> {appointment.doctor?.specialization || 'N/A'}</p>
        </div>
      </div>

      {/* Reason for Visit */}
      <div className="mb-2.5">
        <p className="text-xs text-gray-600 mb-0.5">Reason for Visit:</p>
        <p className="text-xs text-gray-900 font-medium line-clamp-2">{appointment.reasonForVisit || 'Not specified'}</p>
        {appointment.notes && (
          <div className="mt-1">
            <p className="text-xs text-gray-600 mb-0.5">Notes:</p>
            <p className="text-xs text-gray-700 line-clamp-2">{appointment.notes}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
        <button
          onClick={() => onViewDetails(appointment)}
          className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
        >
          <EyeIcon className="h-3.5 w-3.5" />
          View
        </button>

        {canUpdateStatus && (
          <select
            value={appointment.status}
            onChange={(e) => onStatusUpdate(appointment.id, e.target.value)}
            className="text-xs border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="No Show">No Show</option>
          </select>
        )}
      </div>

      {/* Timestamps */}
      <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
        <p className="truncate">Booked: {format(new Date(appointment.createdAt), 'MMM dd, yyyy h:mm a')}</p>
      </div>
    </motion.div>
  );
};

export default PatientCard;
