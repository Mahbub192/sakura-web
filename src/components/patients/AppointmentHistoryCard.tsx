import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  MapPinIcon,
  IdentificationIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { TokenAppointment } from '../../types';

interface AppointmentHistoryCardProps {
  appointment: TokenAppointment;
}

const AppointmentHistoryCard: React.FC<AppointmentHistoryCardProps> = ({
  appointment,
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

  const isUpcoming = new Date(appointment.date) >= new Date() && 
                    ['Confirmed', 'Pending'].includes(appointment.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        border rounded-xl p-6 transition-all duration-200 hover:shadow-md
        ${isUpcoming 
          ? 'bg-primary-50 border-primary-200' 
          : 'bg-white border-gray-200'
        }
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            isUpcoming ? 'bg-primary-100' : 'bg-gray-100'
          }`}>
            <UserIcon className={`h-6 w-6 ${
              isUpcoming ? 'text-primary-600' : 'text-gray-600'
            }`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Dr. {appointment.doctor.name}
            </h3>
            <p className="text-sm text-gray-600">{appointment.doctor.specialization}</p>
          </div>
        </div>
        
        <div className="text-right">
          <span className={`badge ${getStatusColor(appointment.status)}`}>
            {appointment.status}
          </span>
          {isUpcoming && (
            <p className="text-xs text-primary-600 mt-1 font-medium">Upcoming</p>
          )}
        </div>
      </div>

      {/* Appointment Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <CalendarDaysIcon className="h-4 w-4 mr-2 text-gray-400" />
            <span>{format(new Date(appointment.date), 'EEEE, MMMM dd, yyyy')}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
            <span>{appointment.time}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <IdentificationIcon className="h-4 w-4 mr-2 text-gray-400" />
            <span>Token: <span className="font-medium">{appointment.tokenNumber}</span></span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
            <span>{appointment.appointment?.clinic?.locationName || 'Clinic TBD'}</span>
          </div>
        </div>
      </div>

      {/* Visit Information */}
      <div className="bg-white rounded-lg p-4 mb-4">
        <div className="flex items-center mb-2">
          <DocumentTextIcon className="h-4 w-4 mr-2 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Visit Information</span>
        </div>
        
        <div className="space-y-2">
          <div>
            <p className="text-xs text-gray-600">Reason for Visit:</p>
            <p className="text-sm text-gray-900">{appointment.reasonForVisit}</p>
          </div>
          
          {appointment.notes && (
            <div>
              <p className="text-xs text-gray-600">Additional Notes:</p>
              <p className="text-sm text-gray-700">{appointment.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Patient Information */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Patient Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
          <div>
            <p className="text-xs text-gray-600">Name:</p>
            <p className="text-gray-900">{appointment.patientName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Age:</p>
            <p className="text-gray-900">{appointment.patientAge} years</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Gender:</p>
            <p className="text-gray-900">{appointment.patientGender}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
        <span>Booked: {format(new Date(appointment.createdAt), 'MMM dd, yyyy h:mm a')}</span>
        
        {appointment.status === 'Completed' && (
          <span className="text-success-600 font-medium">✓ Completed</span>
        )}
        
        {isUpcoming && (
          <span className="text-primary-600 font-medium">
            {appointment.status === 'Confirmed' ? '✓ Confirmed' : '⏳ Pending Confirmation'}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default AppointmentHistoryCard;
