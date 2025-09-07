import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon, 
  UserGroupIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { Appointment } from '../../types';
import Button from '../ui/Button';

interface AppointmentCardProps {
  appointment: Appointment;
  onStatusUpdate: (id: number, status: string) => void;
  userRole: string;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onStatusUpdate,
  userRole,
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'badge-success';
      case 'booked':
        return 'badge-warning';
      case 'completed':
        return 'badge-primary';
      case 'cancelled':
        return 'badge-error';
      default:
        return 'badge-primary';
    }
  };

  const canEditStatus = ['Admin', 'Doctor', 'Assistant'].includes(userRole);

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
          <div className="bg-primary-100 p-2 rounded-lg">
            <CalendarIcon className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Dr. {appointment.doctor.name}</h3>
            <p className="text-sm text-gray-600">{appointment.doctor.specialization}</p>
          </div>
        </div>
        <span className={`badge ${getStatusColor(appointment.status)}`}>
          {appointment.status}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-3">
        <div className="flex items-center text-sm text-gray-600">
          <CalendarIcon className="h-4 w-4 mr-2" />
          <span>{format(new Date(appointment.date), 'MMM dd, yyyy')}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <ClockIcon className="h-4 w-4 mr-2" />
          <span>{appointment.startTime} - {appointment.endTime} ({appointment.duration} min)</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <MapPinIcon className="h-4 w-4 mr-2" />
          <span>{appointment.clinic.locationName}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <UserGroupIcon className="h-4 w-4 mr-2" />
          <span>{appointment.currentBookings}/{appointment.maxPatients} patients</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <CurrencyDollarIcon className="h-4 w-4 mr-2" />
          <span>${appointment.doctor.consultationFee}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>Bookings</span>
          <span>{appointment.currentBookings}/{appointment.maxPatients}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              appointment.currentBookings >= appointment.maxPatients
                ? 'bg-error-500'
                : appointment.currentBookings > 0
                ? 'bg-warning-500'
                : 'bg-success-500'
            }`}
            style={{
              width: `${Math.min((appointment.currentBookings / appointment.maxPatients) * 100, 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Actions */}
      {canEditStatus && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <select
              value={appointment.status}
              onChange={(e) => onStatusUpdate(appointment.id, e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="Available">Available</option>
              <option value="Booked">Booked</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AppointmentCard;
