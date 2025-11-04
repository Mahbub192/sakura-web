import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  CalendarIcon,
  ClockIcon,
  UserCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  HeartIcon,
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useAuth } from '../../hooks/useAuth';
import { fetchClinics } from '../../store/slices/clinicSlice';
import { fetchDoctors, fetchCurrentDoctorProfile } from '../../store/slices/doctorSlice';
import { assistantBookingService, CreatePatientBookingRequest } from '../../services/assistantBookingService';
import { fetchAvailableSlots } from '../../store/slices/appointmentSlice';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';
import { Doctor, Clinic, Appointment } from '../../types';

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

const AssistantBookingPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAssistant, user } = useAuth();
  
  console.log('[AssistantBookingPage] Component rendered, isAssistant:', isAssistant, 'user:', user);
  const { clinics } = useAppSelector(state => state.clinics);
  const { currentDoctorProfile } = useAppSelector(state => state.doctors);
  const { availableSlots, isLoading: slotsLoading } = useAppSelector(state => state.appointments);
  
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedClinic, setSelectedClinic] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Appointment | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  
  const [bookingData, setBookingData] = useState<CreatePatientBookingRequest>({
    doctorId: 0,
    appointmentId: 0,
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    patientAge: 0,
    patientGender: '',
    patientLocation: '',
    isOldPatient: false,
    doctorFee: 0,
    reasonForVisit: '',
    notes: '',
    date: '',
    time: '',
  });

  useEffect(() => {
    if (isAssistant) {
      dispatch(fetchCurrentDoctorProfile());
      dispatch(fetchClinics());
    }
  }, [dispatch, isAssistant]);

  useEffect(() => {
    if (currentDoctorProfile && selectedDate && selectedClinic) {
      dispatch(fetchAvailableSlots({
        doctorId: currentDoctorProfile.id,
        date: selectedDate,
        clinicId: selectedClinic,
      }));
    }
  }, [dispatch, currentDoctorProfile, selectedDate, selectedClinic]);

  useEffect(() => {
    if (currentDoctorProfile) {
      setBookingData(prev => ({
        ...prev,
        doctorId: currentDoctorProfile.id,
        doctorFee: currentDoctorProfile.consultationFee,
      }));
    }
  }, [currentDoctorProfile]);

  const handleSlotSelect = (slot: Appointment) => {
    setSelectedSlot(slot);
    setBookingData(prev => ({
      ...prev,
      appointmentId: slot.id,
      date: slot.date,
      time: slot.startTime,
      doctorFee: slot.doctor?.consultationFee || currentDoctorProfile?.consultationFee || 0,
    }));
    setShowBookingModal(true);
  };

  const handleBookAppointment = async () => {
    if (!bookingData.patientName || !bookingData.patientEmail || !bookingData.patientPhone || 
        !bookingData.patientAge || !bookingData.patientGender) {
      toast.error('Please fill in all required patient information');
      return;
    }

    if (bookingData.patientAge < 1 || bookingData.patientAge > 150) {
      toast.error('Please enter a valid age');
      return;
    }

    try {
      setIsBooking(true);
      console.log('[AssistantBookingPage] Calling assistantBookingService.bookPatient with:', bookingData);
      const result = await assistantBookingService.bookPatient(bookingData);
      console.log('[AssistantBookingPage] Booking successful, result:', result);
      toast.success('Appointment booked successfully!');
      setShowBookingModal(false);
      setSelectedSlot(null);
      setBookingData({
        doctorId: currentDoctorProfile?.id || 0,
        appointmentId: 0,
        patientName: '',
        patientEmail: '',
        patientPhone: '',
        patientAge: 0,
        patientGender: '',
        patientLocation: '',
        isOldPatient: false,
        doctorFee: currentDoctorProfile?.consultationFee || 0,
        reasonForVisit: '',
        notes: '',
        date: selectedDate,
        time: '',
      });
      // Refresh slots
      if (currentDoctorProfile && selectedDate && selectedClinic) {
        dispatch(fetchAvailableSlots({
          doctorId: currentDoctorProfile.id,
          date: selectedDate,
          clinicId: selectedClinic,
        }));
      }
    } catch (error: any) {
      console.error('Booking error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to book appointment';
      toast.error(errorMessage);
      
      // If 403 Forbidden, it might be a role issue
      if (error?.response?.status === 403) {
        console.error('403 Forbidden - Check user role in JWT token');
      }
    } finally {
      setIsBooking(false);
    }
  };

  const filteredSlots = availableSlots.filter(slot => {
    if (!selectedDate) return true;
    const slotDate = new Date(slot.date).toISOString().split('T')[0];
    return slotDate === selectedDate;
  });

  if (!isAssistant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Only assistants can book appointments for patients.</p>
        </div>
      </div>
    );
  }

  if (!currentDoctorProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <h1 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary-600" />
              Book Appointment for Patient
            </h1>
            <p className="text-sm text-gray-600">
              Doctor: Dr. {currentDoctorProfile.name} | Fee: ${currentDoctorProfile.consultationFee}
            </p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <CalendarIcon className="h-4 w-4 inline mr-1 text-primary-600" />
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <BuildingOfficeIcon className="h-4 w-4 inline mr-1 text-primary-600" />
                  Select Clinic
                </label>
                <select
                  value={selectedClinic || ''}
                  onChange={(e) => setSelectedClinic(e.target.value ? Number(e.target.value) : null)}
                  className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Clinics</option>
                  {clinics.map((clinic) => (
                    <option key={clinic.id} value={clinic.id}>
                      {clinic.locationName} - {clinic.city}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Available Slots */}
        {selectedDate && selectedClinic ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-md p-4 border border-gray-200"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-primary-600" />
              Available Slots
            </h2>
            {slotsLoading ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : filteredSlots.length === 0 ? (
              <div className="text-center py-12">
                <ClockIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No available slots found</p>
                <p className="text-sm text-gray-500 mt-2">Try selecting a different date or clinic</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSlots.map((slot, index) => (
                  <motion.button
                    key={slot.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSlotSelect(slot)}
                    className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-primary-500 hover:shadow-md transition-all text-left"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <ClockIcon className="h-4 w-4 text-primary-600" />
                        <span className="font-bold text-gray-900">
                          {formatTimeTo12Hour(slot.startTime)}
                        </span>
                      </div>
                      <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                        {slot.maxPatients - (slot.currentBookings || 0)} available
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      {slot.clinic && (
                        <div className="flex items-center gap-1">
                          <BuildingOfficeIcon className="h-3.5 w-3.5" />
                          <span className="truncate">{slot.clinic.locationName}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <span>Fee: ${slot.doctor?.consultationFee || currentDoctorProfile.consultationFee}</span>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center border border-gray-200">
            <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Select Date and Clinic</h3>
            <p className="text-sm text-gray-600">Please select a date and clinic to view available appointment slots</p>
          </div>
        )}

        {/* Booking Modal */}
        <Modal
          isOpen={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedSlot(null);
          }}
          title="Book Appointment for Patient"
        >
          <div className="space-y-4">
            <div className="bg-primary-50 p-3 rounded-md mb-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Selected Slot:</p>
              <p className="text-sm text-gray-600">
                {selectedSlot && (
                  <>
                    {formatTimeTo12Hour(selectedSlot.startTime)} on {format(new Date(selectedSlot.date), 'MMM dd, yyyy')}
                    {selectedSlot.clinic && ` at ${selectedSlot.clinic.locationName}`}
                  </>
                )}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name *</label>
              <input
                type="text"
                value={bookingData.patientName}
                onChange={(e) => setBookingData({ ...bookingData, patientName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={bookingData.patientEmail}
                  onChange={(e) => setBookingData({ ...bookingData, patientEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  value={bookingData.patientPhone}
                  onChange={(e) => setBookingData({ ...bookingData, patientPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
                <input
                  type="number"
                  min="1"
                  max="150"
                  value={bookingData.patientAge || ''}
                  onChange={(e) => setBookingData({ ...bookingData, patientAge: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                <select
                  value={bookingData.patientGender}
                  onChange={(e) => setBookingData({ ...bookingData, patientGender: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={bookingData.patientLocation || ''}
                onChange={(e) => setBookingData({ ...bookingData, patientLocation: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isOldPatient"
                checked={bookingData.isOldPatient}
                onChange={(e) => setBookingData({ ...bookingData, isOldPatient: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="isOldPatient" className="text-sm text-gray-700">
                Is this a returning patient?
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit</label>
              <textarea
                value={bookingData.reasonForVisit || ''}
                onChange={(e) => setBookingData({ ...bookingData, reasonForVisit: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={bookingData.notes || ''}
                onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Consultation Fee:</span> ${bookingData.doctorFee}
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => {
                setShowBookingModal(false);
                setSelectedSlot(null);
              }}>
                Cancel
              </Button>
              <Button onClick={handleBookAppointment} disabled={isBooking}>
                {isBooking ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Booking...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    Book Appointment
                  </>
                )}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default AssistantBookingPage;

