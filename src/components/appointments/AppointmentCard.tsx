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
      className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-primary-100 to-primary-50 p-1.5 rounded-md">
            <CalendarIcon className="h-4 w-4 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-900 truncate">Dr. {appointment.doctor?.name || 'Unknown'}</h3>
            <p className="text-xs text-gray-500 truncate">{appointment.doctor?.specialization || ''}</p>
          </div>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${
          appointment.status === 'Available' ? 'bg-green-100 text-green-700' :
          appointment.status === 'Booked' ? 'bg-yellow-100 text-yellow-700' :
          appointment.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
          'bg-red-100 text-red-700'
        }`}>
          {appointment.status}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <CalendarIcon className="h-3.5 w-3.5 text-primary-500 flex-shrink-0" />
          <span className="truncate">{format(new Date(appointment.date), 'MMM dd, yyyy')}</span>
        </div>
        
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <ClockIcon className="h-3.5 w-3.5 text-primary-500 flex-shrink-0" />
          <span className="truncate">{appointment.startTime} - {appointment.endTime} ({appointment.duration} min)</span>
        </div>
        
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <MapPinIcon className="h-3.5 w-3.5 text-primary-500 flex-shrink-0" />
          <span className="truncate">{appointment.clinic?.locationName || 'N/A'}</span>
        </div>
        
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <UserGroupIcon className="h-3.5 w-3.5 text-primary-500 flex-shrink-0" />
          <span>{appointment.currentBookings}/{appointment.maxPatients} patients</span>
        </div>
        
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <CurrencyDollarIcon className="h-3.5 w-3.5 text-primary-500 flex-shrink-0" />
          <span className="font-semibold text-gray-900">${appointment.doctor?.consultationFee || '0.00'}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span className="font-medium">Bookings</span>
          <span className="font-semibold">{appointment.currentBookings}/{appointment.maxPatients}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${
              appointment.currentBookings >= appointment.maxPatients
                ? 'bg-red-500'
                : appointment.currentBookings > 0
                ? 'bg-orange-500'
                : 'bg-green-500'
            }`}
            style={{
              width: `${Math.min((appointment.currentBookings / appointment.maxPatients) * 100, 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Actions */}
      {canEditStatus && (
        <div className="pt-2 border-t border-gray-200">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-gray-700">Status:</span>
            <select
              value={appointment.status}
              onChange={(e) => onStatusUpdate(appointment.id, e.target.value)}
              className="text-xs border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500 flex-1 max-w-[120px]"
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
