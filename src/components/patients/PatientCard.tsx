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
      className="bg-white border border-gray-200 rounded-xl p-6 shadow-soft hover:shadow-medium transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-primary-100 p-2 rounded-full">
            <UserIcon className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{appointment.patientName}</h3>
            <p className="text-sm text-gray-600">{appointment.patientAge} years, {appointment.patientGender}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`badge ${getStatusColor(appointment.status)}`}>
            {appointment.status}
          </span>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
          <span>{appointment.patientEmail}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
          <span>{appointment.patientPhone}</span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <IdentificationIcon className="h-4 w-4 mr-2 text-gray-400" />
          <span>Token: <span className="font-medium">{appointment.tokenNumber}</span></span>
        </div>
      </div>

      {/* Appointment Details */}
      <div className="bg-gray-50 p-3 rounded-lg mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center text-sm text-gray-600">
            <CalendarDaysIcon className="h-4 w-4 mr-2 text-gray-400" />
            <span>{format(new Date(appointment.date), 'MMM dd, yyyy')}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
            <span>{appointment.time}</span>
          </div>
        </div>
        
        <div className="text-sm text-gray-700">
          <p><span className="font-medium">Doctor:</span> Dr. {appointment.doctor.name}</p>
          <p><span className="font-medium">Specialization:</span> {appointment.doctor.specialization}</p>
        </div>
      </div>

      {/* Reason for Visit */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-1">Reason for Visit:</p>
        <p className="text-sm text-gray-900 font-medium">{appointment.reasonForVisit}</p>
        {appointment.notes && (
          <>
            <p className="text-sm text-gray-600 mb-1 mt-2">Notes:</p>
            <p className="text-sm text-gray-700">{appointment.notes}</p>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(appointment)}
          icon={<EyeIcon className="h-4 w-4" />}
        >
          View Details
        </Button>

        {canUpdateStatus && (
          <select
            value={appointment.status}
            onChange={(e) => onStatusUpdate(appointment.id, e.target.value)}
            className="text-sm border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
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
      <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
        <p>Booked: {format(new Date(appointment.createdAt), 'MMM dd, yyyy h:mm a')}</p>
      </div>
    </motion.div>
  );
};

export default PatientCard;
