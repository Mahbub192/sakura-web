import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchAvailableSlots, createTokenAppointment } from '../../store/slices/appointmentSlice';
import { fetchDoctors } from '../../store/slices/doctorSlice';
import { fetchClinics } from '../../store/slices/clinicSlice';
import { CreateTokenAppointmentRequest } from '../../types';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Calendar from '../../components/ui/Calendar';
import BookingForm from '../../components/forms/BookingForm';
import { toast } from 'react-toastify';

const BookAppointmentPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { availableSlots, isLoading } = useAppSelector(state => state.appointments);
  const { doctors } = useAppSelector(state => state.doctors);
  const { clinics } = useAppSelector(state => state.clinics);
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [maxFeeFilter, setMaxFeeFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [step, setStep] = useState(1); // 1: Find Doctor, 2: Select Date/Time, 3: Book

  useEffect(() => {
    dispatch(fetchDoctors());
    dispatch(fetchClinics());
    dispatch(fetchAvailableSlots());
  }, [dispatch]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setStep(2);
    // Fetch available slots for selected date
    dispatch(fetchAvailableSlots({ date: format(date, 'yyyy-MM-dd') }));
  };

  const handleSlotSelect = (slot: any) => {
    setSelectedSlot(slot);
    setShowBookingForm(true);
  };

  const handleBookAppointment = async (bookingData: CreateTokenAppointmentRequest) => {
    try {
      const result = await dispatch(createTokenAppointment(bookingData));
      if (createTokenAppointment.fulfilled.match(result)) {
        setShowBookingForm(false);
        toast.success('Appointment booked successfully!');
        // Show success screen or redirect
        setStep(3);
      }
    } catch (error) {
      toast.error('Failed to book appointment');
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = 
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialization = 
      !specializationFilter || 
      doctor.specialization.toLowerCase().includes(specializationFilter.toLowerCase());
    
    const matchesFee = 
      !maxFeeFilter || 
      doctor.consultationFee <= parseInt(maxFeeFilter);
    
    return matchesSearch && matchesSpecialization && matchesFee;
  });

  const availableSlotsForDate = availableSlots.filter(slot => 
    slot.date === format(selectedDate, 'yyyy-MM-dd') && 
    slot.status === 'Available' &&
    slot.currentBookings < slot.maxPatients
  );

  const specializations = Array.from(new Set(doctors.map(d => d.specialization)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Book Your Appointment</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find the right doctor and schedule your visit in just a few simple steps
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="flex items-center space-x-8">
            {[
              { number: 1, title: 'Find Doctor', icon: UserIcon },
              { number: 2, title: 'Select Date & Time', icon: CalendarDaysIcon },
              { number: 3, title: 'Confirm Booking', icon: CheckCircleIcon },
            ].map((stepItem, index) => (
              <div key={stepItem.number} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-200
                  ${step >= stepItem.number 
                    ? 'bg-primary-600 border-primary-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-400'
                  }
                `}>
                  {step > stepItem.number ? (
                    <CheckCircleIcon className="h-6 w-6" />
                  ) : (
                    <stepItem.icon className="h-6 w-6" />
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    step >= stepItem.number ? 'text-primary-600' : 'text-gray-400'
                  }`}>
                    Step {stepItem.number}
                  </p>
                  <p className={`text-xs ${
                    step >= stepItem.number ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {stepItem.title}
                  </p>
                </div>
                {index < 2 && (
                  <div className={`ml-8 w-8 h-0.5 ${
                    step > stepItem.number ? 'bg-primary-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Step 1: Find Doctor */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-6xl mx-auto"
          >
            {/* Search and Filters */}
            <div className="bg-white rounded-2xl shadow-medium p-6 mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search doctors by name or specialization..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 input-field"
                  />
                </div>

                {/* Filter Toggle */}
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  icon={<FunnelIcon className="h-4 w-4" />}
                >
                  Filters
                </Button>
              </div>

              {/* Filters */}
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 pt-4 border-t border-gray-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select
                      value={specializationFilter}
                      onChange={(e) => setSpecializationFilter(e.target.value)}
                      className="input-field"
                    >
                      <option value="">All Specializations</option>
                      {specializations.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>

                    <input
                      type="number"
                      placeholder="Max consultation fee ($)"
                      value={maxFeeFilter}
                      onChange={(e) => setMaxFeeFilter(e.target.value)}
                      className="input-field"
                    />

                    <select
                      value={cityFilter}
                      onChange={(e) => setCityFilter(e.target.value)}
                      className="input-field"
                    >
                      <option value="">All Cities</option>
                      {Array.from(new Set(clinics.map(c => c.city))).map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Doctors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map(doctor => (
                <motion.div
                  key={doctor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl shadow-soft hover:shadow-medium transition-all duration-200 p-6 cursor-pointer"
                  onClick={() => {
                    setStep(2);
                    dispatch(fetchAvailableSlots({ doctorId: doctor.id }));
                  }}
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="bg-primary-100 p-3 rounded-full">
                      <UserIcon className="h-8 w-8 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Dr. {doctor.name}</h3>
                      <p className="text-sm text-gray-600">{doctor.specialization}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      <span>{doctor.experience || 0} years experience</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                      <span>${doctor.consultationFee} consultation fee</span>
                    </div>
                  </div>

                  {doctor.bio && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">{doctor.bio}</p>
                  )}

                  <Button variant="primary" className="w-full">
                    Select Doctor
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Select Date & Time */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-6xl mx-auto"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Calendar */}
              <div>
                <Calendar
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                  appointments={availableSlots.map(slot => ({
                    date: slot.date,
                    count: slot.currentBookings,
                    status: slot.currentBookings >= slot.maxPatients ? 'full' as const :
                            slot.currentBookings > 0 ? 'booked' as const : 'available' as const,
                  }))}
                />
              </div>

              {/* Available Slots */}
              <div className="bg-white rounded-2xl shadow-medium p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Available Times for {format(selectedDate, 'MMMM d, yyyy')}
                </h3>
                
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Loading available slots...</p>
                  </div>
                ) : availableSlotsForDate.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarDaysIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No available slots for this date</p>
                    <Button
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="mt-4"
                    >
                      Choose Different Doctor
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {availableSlotsForDate.map(slot => (
                      <motion.div
                        key={slot.id}
                        whileHover={{ scale: 1.02 }}
                        className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 cursor-pointer transition-colors"
                        onClick={() => handleSlotSelect(slot)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <ClockIcon className="h-4 w-4 text-gray-400" />
                              <span className="font-medium text-gray-900">
                                {slot.startTime} - {slot.endTime}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                              <span>Dr. {slot.doctor.name}</span>
                              <span>{slot.clinic.locationName}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">${slot.doctor.consultationFee}</p>
                            <p className="text-xs text-gray-600">
                              {slot.maxPatients - slot.currentBookings} slots left
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center mt-8">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
              >
                Back to Doctor Selection
              </Button>
            </div>
          </motion.div>
        )}

        {/* Booking Form Modal */}
        <Modal
          isOpen={showBookingForm}
          onClose={() => setShowBookingForm(false)}
          title="Complete Your Booking"
          size="lg"
        >
          {selectedSlot && (
            <BookingForm
              appointment={selectedSlot}
              onSubmit={handleBookAppointment}
              onCancel={() => setShowBookingForm(false)}
            />
          )}
        </Modal>
      </div>
    </div>
  );
};

export default BookAppointmentPage;