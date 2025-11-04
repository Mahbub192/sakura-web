import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  CalendarIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CheckCircleIcon,
  SparklesIcon,
  HeartIcon,
  ArrowRightIcon,
  UserCircleIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useAuth } from '../../hooks/useAuth';
import { fetchAvailableSlots } from '../../store/slices/appointmentSlice';
import { fetchDoctors } from '../../store/slices/doctorSlice';
import { fetchClinics } from '../../store/slices/clinicSlice';
import { bookAppointment } from '../../store/slices/patientSlice';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

// Helper function to convert 24-hour time to 12-hour AM/PM format
const formatTimeTo12Hour = (time24: string): string => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  const hour24 = parseInt(hours, 10);
  const mins = minutes || '00';
  
  if (hour24 === 0) {
    return `12:${mins} AM`;
  } else if (hour24 < 12) {
    return `${hour24}:${mins} AM`;
  } else if (hour24 === 12) {
    return `12:${mins} PM`;
  } else {
    return `${hour24 - 12}:${mins} PM`;
  }
};

// Helper function to calculate time in minutes from time string (HH:MM)
const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + (minutes || 0);
};

// Helper function to format minutes to time string (HH:MM)
const minutesToTime = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Helper function to calculate individual patient slot time
const calculatePatientSlotTime = (startTime: string, endTime: string, slotIndex: number, totalPatients: number): string => {
  if (!startTime || !endTime || totalPatients === 0) return startTime;
  
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const totalDuration = endMinutes - startMinutes;
  const durationPerPatient = totalDuration / totalPatients;
  
  const slotStartMinutes = startMinutes + (slotIndex * durationPerPatient);
  return minutesToTime(Math.floor(slotStartMinutes));
};

const schema = yup.object({
  patientName: yup.string().required('Patient name is required'),
  patientEmail: yup.string().email('Invalid email').required('Email is required'),
  patientPhone: yup.string().required('Phone number is required'),
  patientAge: yup.number().min(1, 'Age must be at least 1').required('Age is required'),
  patientGender: yup.string().required('Gender is required'),
  patientLocation: yup.string().optional(),
  isOldPatient: yup.boolean().optional(),
  appointmentId: yup.number().required('Please select an appointment slot'),
  reasonForVisit: yup.string().optional(),
  notes: yup.string().optional(),
}).required();

type FormData = yup.InferType<typeof schema>;

const PatientBookingPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isAssistant } = useAuth();
  const { availableSlots, isLoading: slotsLoading } = useAppSelector(state => state.appointments);
  
  // Redirect assistants to their booking page
  React.useEffect(() => {
    if (isAssistant) {
      console.log('[PatientBookingPage] Assistant detected, redirecting to /assistants/booking');
      navigate('/assistants/booking', { replace: true });
      return;
    }
  }, [isAssistant, navigate]);
  
  // Early return if assistant (while redirecting)
  if (isAssistant) {
    return null;
  }
  const { doctors } = useAppSelector(state => state.doctors);
  const { clinics } = useAppSelector(state => state.clinics);
  const { isLoading: bookingLoading } = useAppSelector(state => state.patients);

  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedClinic, setSelectedClinic] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [selectedSlotUniqueId, setSelectedSlotUniqueId] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      patientEmail: user?.email || '',
      isOldPatient: false,
    },
  });

  const selectedAppointmentId = watch('appointmentId');

  useEffect(() => {
    // Fetch doctors and clinics if not already loaded
    if (doctors.length === 0) {
      dispatch(fetchDoctors());
    }
    if (clinics.length === 0) {
      dispatch(fetchClinics());
    }
  }, [dispatch, doctors.length, clinics.length]);

  // Initial fetch - load all available slots when component mounts
  useEffect(() => {
    dispatch(fetchAvailableSlots({}));
  }, [dispatch]);

  useEffect(() => {
    // Fetch available slots when doctor, date, or clinic changes
    // Always fetch slots, even without filters, to show all available slots
    dispatch(fetchAvailableSlots({
      doctorId: selectedDoctor || undefined,
      date: selectedDate || undefined,
      clinicId: selectedClinic || undefined,
    }));
  }, [dispatch, selectedDoctor, selectedDate, selectedClinic]);

  console.log('=== Patient Booking Page State ===');
  console.log('availableSlots from Redux:', availableSlots);
  console.log('availableSlots count:', availableSlots?.length || 0);
  console.log('isLoading:', slotsLoading);
  console.log('selectedDate:', selectedDate);
  console.log('selectedDoctor:', selectedDoctor);
  console.log('selectedClinic:', selectedClinic);

  // Filter available slots based on selection (additional client-side filtering)
  const filteredSlots = (availableSlots || []).filter(slot => {
    // Only filter by doctor if one is selected
    if (selectedDoctor && slot.doctorId !== selectedDoctor) {
      console.log('Filtered out - doctor mismatch:', slot.id, slot.doctorId, 'vs', selectedDoctor);
      return false;
    }
    
    // Compare dates properly - extract date part from slot.date (which is ISO string)
    if (selectedDate) {
      const slotDate = slot.date ? new Date(slot.date).toISOString().split('T')[0] : '';
      if (slotDate !== selectedDate) {
        console.log('Filtered out - date mismatch:', slot.id, slotDate, 'vs', selectedDate);
        return false;
      }
    }
    
    // Only filter by clinic if one is selected
    if (selectedClinic && slot.clinicId !== selectedClinic) {
      console.log('Filtered out - clinic mismatch:', slot.id, slot.clinicId, 'vs', selectedClinic);
      return false;
    }
    
    // Ensure slot is available and has space
    if (slot.status !== 'Available') {
      console.log('Filtered out - status not available:', slot.id, slot.status);
      return false;
    }
    if (slot.currentBookings >= slot.maxPatients) {
      console.log('Filtered out - fully booked:', slot.id, slot.currentBookings, '>=', slot.maxPatients);
      return false;
    }
    
    // Only show future or today's appointments
    const slotDateObj = slot.date ? new Date(slot.date) : null;
    if (slotDateObj) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (slotDateObj < today) {
        console.log('Filtered out - past date:', slot.id, slotDateObj);
        return false;
      }
    }
    
    return true;
  });

  console.log('filteredSlots after filtering:', filteredSlots);
  console.log('filteredSlots count:', filteredSlots.length);
  console.log('==============================');

  // Create individual patient slot cards
  // For each slot, create cards for each available patient position
  const individualSlots = filteredSlots.flatMap(slot => {
    const availableSpots = slot.maxPatients - (slot.currentBookings || 0);
    const bookedSpots = slot.currentBookings || 0;
    const cards = [];
    for (let i = 0; i < availableSpots; i++) {
      // Calculate individual slot time based on position
      // slotIndex is the position AFTER already booked spots
      const slotPosition = bookedSpots + i; // 0-based position in the slot
      const individualStartTime = calculatePatientSlotTime(
        slot.startTime,
        slot.endTime,
        slotPosition,
        slot.maxPatients
      );
      
      cards.push({
        ...slot,
        slotIndex: bookedSpots + i + 1, // Position number (1, 2, 3, ...)
        totalAvailable: availableSpots,
        individualStartTime, // Each card has its own calculated start time
        uniqueId: `${slot.id}-${slotPosition}`, // Unique identifier for selection
      });
    }
    return cards;
  });

  console.log('individualSlots created:', individualSlots.length);
  console.log('individualSlots:', individualSlots);

  const onSubmit = async (data: any) => {
    // Verify email matches logged-in user
    if (isAuthenticated && user?.email && data.patientEmail !== user.email) {
      toast.error('Email mismatch. You can only book appointments for your own account.');
      return;
    }

    try {
      const result = await dispatch(bookAppointment(data as any));
      if (bookAppointment.fulfilled.match(result)) {
        setBookingDetails(result.payload);
        setShowSuccessModal(true);
        toast.success('Appointment booked successfully!');
        
        // Refresh available slots after successful booking
        dispatch(fetchAvailableSlots({
          doctorId: selectedDoctor || undefined,
          date: selectedDate || undefined,
          clinicId: selectedClinic || undefined,
        }));
        
        // Reset form
        setSelectedDoctor(null);
        setSelectedDate('');
        setSelectedClinic(null);
        setValue('appointmentId', undefined as any);
        setSelectedSlotUniqueId(null);
      } else {
        toast.error(result.payload as string || 'Failed to book appointment');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to book appointment');
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-secondary-50/20 px-4 sm:px-6 lg:px-8 overflow-hidden flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col overflow-hidden">
        {/* Header Section - Compact */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex-shrink-0"
        >
          <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 rounded-xl p-4 text-white shadow-lg">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}></div>
            </div>
            <div className="relative z-10 flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                <CalendarIcon className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Book an Appointment</h1>
                <p className="text-sm text-primary-100">
                  Select a doctor, date, and time slot
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-100 flex-1 overflow-y-auto"
        >
          <style>{`
            .booking-form::-webkit-scrollbar {
              width: 6px;
            }
            .booking-form::-webkit-scrollbar-thumb {
              background: rgba(99, 102, 241, 0.3);
              border-radius: 3px;
            }
            .booking-form::-webkit-scrollbar-thumb:hover {
              background: rgba(99, 102, 241, 0.5);
            }
          `}</style>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 booking-form">
            {/* Patient Information */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg p-4 space-y-3 border border-primary-100"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-primary-600 p-2 rounded-lg">
                  <UserCircleIcon className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Patient Information</h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      {...register('patientName')}
                      type="text"
                      className="pl-8 input-field w-full text-sm py-2"
                      placeholder="Full name"
                    />
                  </div>
                  {errors.patientName && (
                    <p className="text-red-600 text-xs mt-0.5">{errors.patientName.message}</p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      {...register('patientEmail')}
                      type="email"
                      className="pl-8 input-field w-full text-sm py-2"
                      placeholder="Email"
                      disabled={isAuthenticated}
                    />
                  </div>
                  {errors.patientEmail && (
                    <p className="text-red-600 text-xs mt-0.5">{errors.patientEmail.message}</p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      {...register('patientPhone')}
                      type="tel"
                      className="pl-8 input-field w-full text-sm py-2"
                      placeholder="Phone"
                    />
                  </div>
                  {errors.patientPhone && (
                    <p className="text-red-600 text-xs mt-0.5">{errors.patientPhone.message}</p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 }}
                >
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('patientAge', { valueAsNumber: true })}
                    type="number"
                    min="1"
                    max="120"
                    className="input-field w-full text-sm py-2"
                    placeholder="Age"
                  />
                  {errors.patientAge && (
                    <p className="text-red-600 text-xs mt-0.5">{errors.patientAge.message}</p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select {...register('patientGender')} className="input-field w-full text-sm py-2">
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.patientGender && (
                    <p className="text-red-600 text-xs mt-0.5">{errors.patientGender.message}</p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 }}
                >
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Location
                  </label>
                  <div className="relative">
                    <MapPinIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      {...register('patientLocation')}
                      type="text"
                      className="pl-8 input-field w-full text-sm py-2"
                      placeholder="Address (optional)"
                    />
                  </div>
                </motion.div>
              </div>

              <div className="flex items-center pt-2">
                <input
                  {...register('isOldPatient')}
                  type="checkbox"
                  id="isOldPatient"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="isOldPatient" className="ml-2 text-xs font-medium text-gray-700 cursor-pointer">
                  I'm a returning patient
                </label>
              </div>
            </motion.div>

            {/* Appointment Selection */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 space-y-3 border border-blue-100"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <CalendarIcon className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Select Appointment</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Doctor Selection */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    <AcademicCapIcon className="h-4 w-4 text-blue-600" />
                    Doctor
                  </label>
                  <select
                    value={selectedDoctor || ''}
                    onChange={(e) => {
                      setSelectedDoctor(e.target.value ? parseInt(e.target.value) : null);
                      setValue('appointmentId', undefined as any);
                    }}
                    className="input-field w-full text-sm py-2"
                  >
                    <option value="">All Doctors</option>
                    {doctors.map(doctor => (
                      <option key={doctor.id} value={doctor.id}>
                        Dr. {doctor.name} - {doctor.specialization}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Selection */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4 text-blue-600" />
                    Date
                  </label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setValue('appointmentId', undefined as any);
                      }}
                      min={new Date().toISOString().split('T')[0]}
                      className="pl-8 input-field w-full text-sm py-2"
                    />
                  </div>
                </div>

                {/* Location/Clinic Selection */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    <BuildingOfficeIcon className="h-4 w-4 text-blue-600" />
                    Location
                  </label>
                  <div className="relative">
                    <MapPinIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <select
                      value={selectedClinic || ''}
                      onChange={(e) => {
                        setSelectedClinic(e.target.value ? parseInt(e.target.value) : null);
                        setValue('appointmentId', undefined as any);
                      }}
                      className="pl-8 input-field w-full text-sm py-2 appearance-none bg-white pr-8"
                    >
                      <option value="">All Locations</option>
                      {clinics.map(clinic => (
                        <option key={clinic.id} value={clinic.id}>
                          {clinic.locationName} - {clinic.city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Available Slots */}
              {slotsLoading ? (
                <div className="flex flex-col items-center justify-center py-6">
                  <LoadingSpinner size="md" />
                  <p className="text-gray-600 mt-2 text-xs">Loading slots...</p>
                </div>
              ) : individualSlots.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6 bg-white rounded-lg border border-gray-200"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-2">
                    <ClockIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">No Slots Available</h3>
                  <p className="text-xs text-gray-600">
                    {selectedDoctor || selectedDate || selectedClinic
                      ? 'Try different filters or clear filters to see all available slots'
                      : 'No available appointment slots found. Please check back later or contact support.'}
                  </p>
                </motion.div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <ClockIcon className="h-4 w-4 text-blue-600" />
                    Time Slots <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto">
                    {individualSlots.map((slot, index) => {
                      const doctor = doctors.find(d => d.id === slot.doctorId);
                      const isSelected = selectedSlotUniqueId === slot.uniqueId;
                      return (
                        <motion.button
                          key={`${slot.id}-${slot.slotIndex}`}
                          type="button"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.01 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setSelectedSlotUniqueId(slot.uniqueId);
                            setValue('appointmentId', slot.id); // Still set appointmentId for form submission
                          }}
                          className={`
                            p-3 rounded-lg border-2 transition-all duration-200 text-left relative min-h-[120px] w-full
                            ${isSelected
                              ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-primary-100 shadow-lg ring-2 ring-primary-300'
                              : 'border-gray-200 hover:border-primary-300 bg-white hover:shadow-md'
                            }
                          `}
                        >
                          {isSelected && (
                            <div className="absolute top-1 right-1">
                              <CheckCircleIcon className="h-3.5 w-3.5 text-primary-600" />
                            </div>
                          )}
                          <div className="space-y-1.5">
                            {/* Start Time - Prominent (Individual slot time) */}
                            <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-md p-2 mb-1.5">
                              <div className="flex items-center gap-1.5">
                                <ClockIcon className="h-4 w-4 text-primary-600" />
                                <p className={`text-xs font-bold ${isSelected ? 'text-primary-900' : 'text-gray-900'}`}>
                                  {formatTimeTo12Hour(slot.individualStartTime || slot.startTime)}
                                </p>
                              </div>
                            </div>
                            
                            {/* Patient Info - Single Patient Spot */}
                            <div className="flex items-center justify-between bg-primary-50 rounded-md px-2 py-1.5 border border-primary-200">
                              <div className="flex items-center gap-1.5">
                                <UsersIcon className="h-3.5 w-3.5 text-primary-600" />
                                <span className="text-xs text-gray-600 font-medium">Patient:</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-bold text-green-600">
                                  {slot.slotIndex}
                                </span>
                                <span className="text-xs text-gray-400">/</span>
                                <span className="text-xs font-bold text-gray-700">
                                  {slot.totalAvailable}
                                </span>
                              </div>
                            </div>
                            
                            {/* Doctor Name */}
                            {doctor && (
                              <div className="flex items-center gap-1">
                                <AcademicCapIcon className="h-3 w-3 text-gray-500" />
                                <p className="text-xs text-gray-600 truncate">Dr. {doctor.name.split(' ')[0]}</p>
                              </div>
                            )}
                            
                            {/* Price */}
                            <div className="flex items-center justify-between pt-1 border-t border-gray-200">
                              <span className="text-xs text-gray-500">Fee:</span>
                              <p className="text-xs font-bold text-primary-600">
                                ${doctor?.consultationFee || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                  {errors.appointmentId && (
                    <p className="text-red-600 text-xs mt-1">{errors.appointmentId.message}</p>
                  )}
                </div>
              )}
            </motion.div>

            {/* Reason for Visit & Notes - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Reason for Visit
                </label>
                <textarea
                  {...register('reasonForVisit')}
                  rows={2}
                  className="input-field w-full text-sm"
                  placeholder="Reason..."
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  {...register('notes')}
                  rows={2}
                  className="input-field w-full text-sm"
                  placeholder="Notes..."
                />
              </motion.div>
            </div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex gap-3 pt-3 border-t border-gray-200"
            >
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(-1)}
                className="flex-1 sm:flex-none sm:min-w-[100px] text-sm py-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={bookingLoading || !selectedAppointmentId}
                className="flex-1 flex items-center justify-center gap-2 font-semibold py-2"
              >
                {bookingLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Booking...
                  </>
                ) : (
                  <>
                    <CalendarIcon className="h-4 w-4" />
                    Book Appointment
                    <ArrowRightIcon className="h-4 w-4" />
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </motion.div>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigate('/patients');
        }}
        title="Appointment Booked Successfully!"
        size="md"
      >
        {bookingDetails && (
          <div className="space-y-6">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4"
              >
                <CheckCircleIcon className="h-12 w-12 text-green-600" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Appointment Confirmed!</h3>
              <p className="text-gray-600">Your appointment has been successfully booked</p>
            </div>

            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl p-6 border border-primary-100 space-y-4">
              <div className="bg-white p-4 rounded-lg flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <SparklesIcon className="h-5 w-5 text-primary-600" />
                  <span className="text-gray-700 font-medium">Token Number:</span>
                </div>
                <span className="font-bold text-2xl text-primary-600">{bookingDetails.tokenNumber}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Date</p>
                  <p className="font-semibold text-gray-900">{format(new Date(bookingDetails.date), 'MMM dd, yyyy')}</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Time</p>
                  <p className="font-semibold text-gray-900">{bookingDetails.time}</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Doctor</p>
                <div className="flex items-center gap-2">
                  <HeartIcon className="h-5 w-5 text-primary-600" />
                  <p className="font-semibold text-gray-900">Dr. {bookingDetails.doctor?.name}</p>
                </div>
              </div>
              {bookingDetails.appointment?.clinic && (
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Location</p>
                  <div className="flex items-center gap-2">
                    <BuildingOfficeIcon className="h-5 w-5 text-primary-600" />
                    <p className="font-semibold text-gray-900">{bookingDetails.appointment.clinic.locationName}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900 mb-1">Important Reminder</p>
                  <p className="text-sm text-blue-800">
                    Please arrive 10 minutes before your appointment time. 
                    You will receive a confirmation email shortly.
                  </p>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={() => {
                setShowSuccessModal(false);
                navigate('/patients');
              }}
              className="w-full flex items-center justify-center gap-2 text-lg font-semibold py-3"
            >
              <CalendarIcon className="h-5 w-5" />
              View My Appointments
              <ArrowRightIcon className="h-5 w-5" />
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PatientBookingPage;

