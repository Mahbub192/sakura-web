import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { useAppDispatch } from '../../hooks/redux';
import { useAuth } from '../../hooks/useAuth';
import { createAppointment } from '../../store/slices/appointmentSlice';
import { CreateAppointmentRequest, Doctor, Clinic, Appointment } from '../../types';
import Button from '../ui/Button';
import { toast } from 'react-toastify';

interface CreateAppointmentFormProps {
  onSuccess: () => void;
  doctors: Doctor[];
  clinics: Clinic[];
}

// Dynamic schema based on user role
const createSchema = (isDoctor: boolean) => {
  const baseSchema = {
    clinicId: yup.number().required('Clinic is required'),
    date: yup.string().required('Date is required'),
    startTime: yup.string().required('Start time is required'),
    endTime: yup.string().optional(), // Optional because it's calculated automatically
    duration: yup.number().min(15, 'Minimum 15 minutes').max(240, 'Maximum 240 minutes').required('Duration is required'),
    maxPatients: yup.number().min(1, 'At least 1 patient').max(50, 'Maximum 50 patients').required('Max patients is required'),
  };

  // Doctor ID only required for admin
  if (!isDoctor) {
    return yup.object().shape({
      doctorId: yup.number().required('Doctor is required'),
      ...baseSchema,
    });
  }

  return yup.object().shape(baseSchema);
};

const CreateAppointmentForm: React.FC<CreateAppointmentFormProps> = ({
  onSuccess,
  doctors,
  clinics,
}) => {
  const dispatch = useAppDispatch();
  const { isDoctor } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);

  const schema = React.useMemo(() => createSchema(isDoctor), [isDoctor]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CreateAppointmentRequest>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      duration: 30,
      maxPatients: 1,
      endTime: '',
    },
  });

  const startTime = watch('startTime');
  const duration = watch('duration');

  // Calculate end time based on start time and duration
  React.useEffect(() => {
    if (startTime && duration) {
      const [hours, minutes] = startTime.split(':').map(Number);
      const startMinutes = hours * 60 + minutes;
      const endMinutes = startMinutes + duration;
      const endHours = Math.floor(endMinutes / 60);
      const endMins = endMinutes % 60;
      const endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
      
      // Update the form with calculated end time using setValue
      setValue('endTime', endTime, { shouldValidate: false });
      
      // Also update the display input
      const endTimeInput = document.getElementById('endTime') as HTMLInputElement;
      if (endTimeInput) {
        endTimeInput.value = endTime;
      }
    }
  }, [startTime, duration, setValue]);

  const onSubmit = async (data: CreateAppointmentRequest) => {
    console.log('Form submitted!', data);
    setIsLoading(true);
    try {
      // Calculate end time if not already set
      let endTime = data.endTime;
      if (!endTime && data.startTime && data.duration) {
        const [hours, minutes] = data.startTime.split(':').map(Number);
        const startMinutes = hours * 60 + minutes;
        const endMinutes = startMinutes + data.duration;
        const endHours = Math.floor(endMinutes / 60);
        const endMins = endMinutes % 60;
        endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
      }

      const appointmentData: CreateAppointmentRequest = {
        ...data,
        endTime: endTime || '',
        maxPatients: data.maxPatients || 1,
      };
      console.log('appointmentData', appointmentData);
      const result = await dispatch(createAppointment(appointmentData));
      
      if (createAppointment.fulfilled.match(result)) {
        // Backend returns array of appointments
        const createdSlots = result.payload as Appointment[];
        toast.success(`Successfully created ${createdSlots.length} appointment slot(s)`);
        reset();
        onSuccess();
      } else if (createAppointment.rejected.match(result)) {
        const errorMessage = result.payload as string || 'Failed to create appointment slot';
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      toast.error(error?.message || 'Failed to create appointment slot');
    } finally {
      setIsLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {/* Doctor Selection - Only for Admin */}
      {!isDoctor && (
        <div>
          <label htmlFor="doctorId" className="block text-sm font-medium text-gray-700 mb-2">
            Doctor *
          </label>
          <select
            {...register('doctorId', { valueAsNumber: true })}
            id="doctorId"
            className="input-field"
          >
            <option value="">Select a doctor</option>
            {doctors.map(doctor => (
              <option key={doctor.id} value={doctor.id}>
                Dr. {doctor.name} - {doctor.specialization}
              </option>
            ))}
          </select>
          {errors.doctorId && (
            <p className="mt-1 text-sm text-error-600">{errors.doctorId.message}</p>
          )}
        </div>
      )}

      {/* Clinic Selection */}
      <div>
        <label htmlFor="clinicId" className="block text-sm font-medium text-gray-700 mb-2">
          Clinic *
        </label>
        <select
          {...register('clinicId', { valueAsNumber: true })}
          id="clinicId"
          className="input-field"
        >
          <option value="">Select a clinic</option>
          {clinics.map(clinic => (
            <option key={clinic.id} value={clinic.id}>
              {clinic.locationName} - {clinic.city}
            </option>
          ))}
        </select>
        {errors.clinicId && (
          <p className="mt-1 text-sm text-error-600">{errors.clinicId.message}</p>
        )}
      </div>

      {/* Date and Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
            Date *
          </label>
          <input
            {...register('date')}
            type="date"
            id="date"
            min={today}
            className="input-field"
          />
          {errors.date && (
            <p className="mt-1 text-sm text-error-600">{errors.date.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
            Start Time *
          </label>
          <input
            {...register('startTime')}
            type="time"
            id="startTime"
            className="input-field"
          />
          {errors.startTime && (
            <p className="mt-1 text-sm text-error-600">{errors.startTime.message}</p>
          )}
        </div>
      </div>

      {/* Duration and End Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
            Duration (minutes) *
          </label>
          <select
            {...register('duration', { valueAsNumber: true })}
            id="duration"
            className="input-field"
          >
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>1 hour</option>
            <option value={90}>1.5 hours</option>
            <option value={120}>2 hours</option>
          </select>
          {errors.duration && (
            <p className="mt-1 text-sm text-error-600">{errors.duration.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
            End Time (Calculated)
          </label>
          <input
            {...register('endTime')}
            type="time"
            id="endTime"
            className="input-field bg-gray-50"
            readOnly
          />
          {errors.endTime && (
            <p className="mt-1 text-sm text-error-600">{errors.endTime.message}</p>
          )}
        </div>
      </div>

      {/* Max Patients */}
      <div>
        <label htmlFor="maxPatients" className="block text-sm font-medium text-gray-700 mb-2">
          Maximum Patients *
        </label>
        <input
          {...register('maxPatients', { valueAsNumber: true })}
          type="number"
          id="maxPatients"
          min="1"
          max="50"
          className="input-field"
          placeholder="Enter maximum number of patients"
        />
        {errors.maxPatients && (
          <p className="mt-1 text-sm text-error-600">{errors.maxPatients.message}</p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="secondary"
          onClick={() => reset()}
        >
          Reset
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={isLoading}
        >
          Create Appointment Slot
        </Button>
      </div>
    </motion.form>
  );
};

export default CreateAppointmentForm;
