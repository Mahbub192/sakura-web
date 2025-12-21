import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  MapPinIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { CreateTokenAppointmentRequest, Appointment } from '../../types';
import Button from '../ui/Button';

interface BookingFormProps {
  appointment: Appointment;
  onSubmit: (data: CreateTokenAppointmentRequest) => void;
  onCancel: () => void;
}

const schema = yup.object().shape({
  patientName: yup.string().required('Patient name is required'),
  patientEmail: yup.string().email('Invalid email').required('Email is required'),
  patientPhone: yup.string().required('Phone number is required'),
  patientAge: yup.number().min(1, 'Age must be at least 1').max(120, 'Age cannot exceed 120').required('Age is required'),
  patientGender: yup.string().oneOf(['Male', 'Female', 'Other']).required('Gender is required'),
  reasonForVisit: yup.string().required('Reason for visit is required'),
  notes: yup.string().max(500, 'Notes cannot exceed 500 characters'),
});

const BookingForm: React.FC<BookingFormProps> = ({
  appointment,
  onSubmit,
  onCancel,
}) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Omit<CreateTokenAppointmentRequest, 'doctorId' | 'appointmentId' | 'date' | 'time'>>({
    resolver: yupResolver(schema) as any,
  });

  const handleFormSubmit = async (data: Omit<CreateTokenAppointmentRequest, 'doctorId' | 'appointmentId' | 'date' | 'time'>) => {
    setIsLoading(true);
    try {
      const bookingData: CreateTokenAppointmentRequest = {
        ...data,
        doctorId: appointment.doctorId,
        appointmentId: appointment.id,
        date: appointment.date,
        time: appointment.startTime,
      };
      await onSubmit(bookingData);
    } catch (error) {
      console.error('Error booking appointment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Appointment Summary */}
      <div className="bg-primary-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Appointment Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <UserIcon className="h-4 w-4 text-primary-600" />
            <span>Dr. {appointment.doctor.name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <CalendarDaysIcon className="h-4 w-4 text-primary-600" />
            <span>{format(new Date(appointment.date), 'MMM dd, yyyy')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <ClockIcon className="h-4 w-4 text-primary-600" />
            <span>{appointment.startTime} - {appointment.endTime}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPinIcon className="h-4 w-4 text-primary-600" />
            <span>{appointment.clinic.locationName}</span>
          </div>
          <div className="flex items-center space-x-2">
            <CurrencyDollarIcon className="h-4 w-4 text-primary-600" />
            <span>৳{appointment.doctor.consultationFee}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Patient Information */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">Patient Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                {...register('patientName')}
                type="text"
                id="patientName"
                className="input-field"
                placeholder="Enter patient's full name"
              />
              {errors.patientName && (
                <p className="mt-1 text-sm text-error-600">{errors.patientName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="patientEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                {...register('patientEmail')}
                type="email"
                id="patientEmail"
                className="input-field"
                placeholder="Enter email address"
              />
              {errors.patientEmail && (
                <p className="mt-1 text-sm text-error-600">{errors.patientEmail.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label htmlFor="patientPhone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                {...register('patientPhone')}
                type="tel"
                id="patientPhone"
                className="input-field"
                placeholder="Enter phone number"
              />
              {errors.patientPhone && (
                <p className="mt-1 text-sm text-error-600">{errors.patientPhone.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="patientAge" className="block text-sm font-medium text-gray-700 mb-2">
                Age *
              </label>
              <input
                {...register('patientAge', { valueAsNumber: true })}
                type="number"
                id="patientAge"
                min="1"
                max="120"
                className="input-field"
                placeholder="Enter age"
              />
              {errors.patientAge && (
                <p className="mt-1 text-sm text-error-600">{errors.patientAge.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="patientGender" className="block text-sm font-medium text-gray-700 mb-2">
                Gender *
              </label>
              <select
                {...register('patientGender')}
                id="patientGender"
                className="input-field"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.patientGender && (
                <p className="mt-1 text-sm text-error-600">{errors.patientGender.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Appointment Details */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">Visit Information</h4>
          
          <div>
            <label htmlFor="reasonForVisit" className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Visit *
            </label>
            <input
              {...register('reasonForVisit')}
              type="text"
              id="reasonForVisit"
              className="input-field"
              placeholder="Enter the reason for your visit"
            />
            {errors.reasonForVisit && (
              <p className="mt-1 text-sm text-error-600">{errors.reasonForVisit.message}</p>
            )}
          </div>

          <div className="mt-4">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              {...register('notes')}
              id="notes"
              rows={3}
              className="input-field"
              placeholder="Any additional information or special requests..."
            />
            {errors.notes && (
              <p className="mt-1 text-sm text-error-600">{errors.notes.message}</p>
            )}
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h5 className="font-medium text-gray-900 mb-2">Important Information</h5>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Please arrive 15 minutes before your appointment time</li>
            <li>• Bring a valid ID and any relevant medical documents</li>
            <li>• Cancellations must be made at least 24 hours in advance</li>
            <li>• Consultation fee: ৳{appointment.doctor.consultationFee}</li>
          </ul>
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
            Confirm Booking
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default BookingForm;
