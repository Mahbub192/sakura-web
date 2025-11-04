import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  UsersIcon,
  CalendarIcon,
  MapPinIcon,
  PhoneIcon,
  HeartIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  ClockIcon,
  CheckCircleIcon,
  UserCircleIcon,
  ArrowRightIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useAuth } from '../../hooks/useAuth';
import { fetchTokenAppointments } from '../../store/slices/appointmentSlice';
import { fetchClinics } from '../../store/slices/clinicSlice';
import { fetchDoctors, fetchCurrentDoctorProfile } from '../../store/slices/doctorSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';
import { toast } from 'react-toastify';
import { TokenAppointment, Doctor } from '../../types';

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

const LivePatientPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { isAssistant, isAuthenticated, user } = useAuth();
  const canAccessLivePatient = isAuthenticated && user && ['Admin', 'Doctor', 'Assistant'].includes(user.role);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isLoading } = useAppSelector(state => state.appointments);
  const { clinics } = useAppSelector(state => state.clinics);
  const { doctors, currentDoctorProfile } = useAppSelector(state => state.doctors);
  
  const [selectedLocation, setSelectedLocation] = useState<number | ''>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<number | ''>('');
  const [filteredPatients, setFilteredPatients] = useState<TokenAppointment[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [currentPatientIndex, setCurrentPatientIndex] = useState<number>(0); // Current active patient
  const [readyPatients, setReadyPatients] = useState<Set<number>>(new Set()); // Patients marked as ready

  // Get initial filters from URL params
  useEffect(() => {
    const locationParam = searchParams.get('location');
    const dateParam = searchParams.get('date');
    const doctorParam = searchParams.get('doctor');
    const patientIdParam = searchParams.get('patientId');

    if (locationParam) setSelectedLocation(Number(locationParam));
    if (dateParam) setSelectedDate(dateParam);
    if (doctorParam) setSelectedDoctorFilter(Number(doctorParam));
    if (patientIdParam) {
      // Find the index of the patient with this ID after loading
      const patientId = Number(patientIdParam);
      setTimeout(() => {
        const index = filteredPatients.findIndex(p => p.id === patientId);
        if (index !== -1) {
          setCurrentPatientIndex(index);
        }
      }, 500);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isAssistant) {
      dispatch(fetchCurrentDoctorProfile());
    }
    dispatch(fetchClinics());
    dispatch(fetchDoctors());
  }, [dispatch, isAssistant]);
  
  useEffect(() => {
    if (isAssistant && currentDoctorProfile) {
      setSelectedDoctorFilter(currentDoctorProfile.id);
      setSelectedDoctor(currentDoctorProfile);
    }
  }, [isAssistant, currentDoctorProfile]);

  useEffect(() => {
    if (selectedLocation && selectedDate) {
      handleFilter();
    } else {
      setFilteredPatients([]);
      setSelectedDoctor(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLocation, selectedDate, selectedDoctorFilter]);

  const handleFilter = async () => {
    if (!selectedLocation || !selectedDate) {
      toast.warning('Please select both location and date');
      return;
    }

    try {
      const doctorIdToUse = isAssistant && currentDoctorProfile 
        ? currentDoctorProfile.id 
        : (selectedDoctorFilter ? Number(selectedDoctorFilter) : undefined);
      
      const result = await dispatch(fetchTokenAppointments({ 
        clinicId: Number(selectedLocation), 
        date: selectedDate,
        doctorId: doctorIdToUse,
      }));

      if (fetchTokenAppointments.fulfilled.match(result)) {
        const patients = result.payload as TokenAppointment[];
        // Sort by time
        const sortedPatients = [...patients].sort((a, b) => {
          const timeA = a.time || '';
          const timeB = b.time || '';
          return timeA.localeCompare(timeB);
        });
        setFilteredPatients(sortedPatients);
        
        // Find and set the doctor
        if (sortedPatients.length > 0) {
          const doctorId = sortedPatients[0].doctorId;
          const doctor = doctors.find(d => d.id === doctorId);
          if (doctor) {
            setSelectedDoctor(doctor);
          } else if (sortedPatients[0].doctor) {
            setSelectedDoctor(sortedPatients[0].doctor);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to fetch patients');
    }
  };

  const handleMarkReady = (patientId: number) => {
    setReadyPatients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(patientId)) {
        newSet.delete(patientId);
      } else {
        newSet.add(patientId);
      }
      return newSet;
    });
  };

  const handleNextPatient = () => {
    if (currentPatientIndex < filteredPatients.length - 1) {
      setCurrentPatientIndex(currentPatientIndex + 1);
    }
  };

  const handlePreviousPatient = () => {
    if (currentPatientIndex > 0) {
      setCurrentPatientIndex(currentPatientIndex - 1);
    }
  };

  const getNextPatientIndex = () => {
    if (currentPatientIndex < filteredPatients.length - 1) {
      return currentPatientIndex + 1;
    }
    return -1;
  };

  const getReadyCount = (patientId: number) => {
    const readyArray = Array.from(readyPatients);
    const sortedReady = filteredPatients
      .map((p, idx) => ({ id: p.id, index: idx }))
      .filter(p => readyArray.includes(p.id))
      .sort((a, b) => a.index - b.index);
    
    const patientIndex = sortedReady.findIndex(p => p.id === patientId);
    return patientIndex !== -1 ? patientIndex + 1 : 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-md border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="bg-gradient-to-br from-primary-600 to-secondary-600 p-2 rounded-lg">
                <HeartIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">HealthCare</h1>
                <p className="text-xs text-gray-600">Management System</p>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link
                to="/"
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                Home
              </Link>
              <Link
                to="/book-appointment"
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                Book Appointment
              </Link>
              {isAuthenticated && (
                <Link
                  to="/doctors"
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Doctors
                </Link>
              )}
              <Link
                to="/patients/view"
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                Patients
              </Link>
              {canAccessLivePatient && (
                <Link
                  to="/patients/live"
                  className="text-primary-600 font-medium transition-colors border-b-2 border-primary-600 pb-1"
                >
                  Live Patient
                </Link>
              )}
              <a
                href="#services"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/#services');
                }}
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors cursor-pointer"
              >
                Services
              </a>
              <a
                href="#faq"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/#faq');
                }}
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors cursor-pointer"
              >
                FAQ
              </a>
            </div>

            {/* Action Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => navigate('/patients/book')}
                  >
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    Book Now
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/login')}
                  >
                    Login
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => navigate('/book-appointment')}
                  >
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    Book Appointment
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-gray-200 py-4 space-y-4"
            >
              <Link
                to="/"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/book-appointment"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Book Appointment
              </Link>
              {isAuthenticated && (
                <Link
                  to="/doctors"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Doctors
                </Link>
              )}
              <Link
                to="/patients/view"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Patients
              </Link>
              {canAccessLivePatient && (
                <Link
                  to="/patients/live"
                  className="block px-4 py-2 text-primary-600 bg-primary-50 rounded-md transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Live Patient
                </Link>
              )}
              <a
                href="#services"
                onClick={(e) => {
                  e.preventDefault();
                  setMobileMenuOpen(false);
                  navigate('/#services');
                }}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors cursor-pointer"
              >
                Services
              </a>
              <a
                href="#faq"
                onClick={(e) => {
                  e.preventDefault();
                  setMobileMenuOpen(false);
                  navigate('/#faq');
                }}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors cursor-pointer"
              >
                FAQ
              </a>
              <div className="px-4 pt-4 space-y-2 border-t border-gray-200">
                {isAuthenticated ? (
                  <>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        navigate('/dashboard');
                        setMobileMenuOpen(false);
                      }}
                    >
                      Dashboard
                    </Button>
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={() => {
                        navigate('/patients/book');
                        setMobileMenuOpen(false);
                      }}
                    >
                      <CalendarIcon className="h-5 w-5 mr-2" />
                      Book Now
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        navigate('/login');
                        setMobileMenuOpen(false);
                      }}
                    >
                      Login
                    </Button>
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={() => {
                        navigate('/book-appointment');
                        setMobileMenuOpen(false);
                      }}
                    >
                      <CalendarIcon className="h-5 w-5 mr-2" />
                      Book Appointment
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Main Content - with top padding for fixed nav */}
      <div className="pt-20">
        <div className="container mx-auto max-w-full px-4 py-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
              <h1 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <UsersIcon className="h-6 w-6 text-primary-600" />
                Live Patient Management
              </h1>
              <p className="text-sm text-gray-600">View and manage live patient appointments</p>
            </div>
          </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-md p-4 mb-4 border border-gray-200"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Location *</label>
              <select
                value={selectedLocation || ''}
                onChange={(e) => setSelectedLocation(e.target.value ? Number(e.target.value) : '')}
                className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select Location</option>
                {clinics.map((clinic) => (
                  <option key={clinic.id} value={clinic.id}>
                    {clinic.locationName} - {clinic.city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Doctor *</label>
              <select
                value={selectedDoctorFilter || ''}
                onChange={(e) => setSelectedDoctorFilter(e.target.value ? Number(e.target.value) : '')}
                disabled={isAssistant}
                className={`w-full text-xs px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  isAssistant ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
                }`}
              >
                <option value="">Select Doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    Dr. {doctor.name} - {doctor.specialization}
                  </option>
                ))}
              </select>
              {isAssistant && (
                <p className="text-xs text-gray-500 mt-1">Showing patients for your assigned doctor</p>
              )}
            </div>

            <div className="flex items-end">
              <button
                onClick={handleFilter}
                disabled={!selectedLocation || !selectedDate}
                className="w-full bg-primary-600 text-white px-4 py-1.5 rounded-md hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                <UsersIcon className="h-4 w-4" />
                View Patients
              </button>
            </div>
          </div>
        </motion.div>

        {/* Main Content - 25% Doctor Info, 70% Patient List */}
        {selectedLocation && selectedDate && filteredPatients.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-10 gap-4"
          >
            {/* Left Column - Doctor Information (25%) */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-br from-primary-600 to-secondary-600 p-3 text-white">
                <h2 className="text-sm font-bold mb-1 flex items-center gap-1.5">
                  <HeartIcon className="h-4 w-4" />
                  Doctor Information
                </h2>
                <p className="text-xs text-primary-100">Appointment details</p>
              </div>

              {selectedDoctor ? (
                <div className="p-3 space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                      <HeartIcon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-gray-900 truncate">Dr. {selectedDoctor.name}</h3>
                      <p className="text-xs text-gray-600 truncate">{selectedDoctor.specialization}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <StarIconSolid key={i} className="h-3 w-3 text-yellow-400" />
                    ))}
                    <span className="text-xs text-gray-600 ml-1">(4.9)</span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-gray-700">
                      <AcademicCapIcon className="h-3.5 w-3.5 text-primary-600 flex-shrink-0" />
                      <span className="font-medium">Experience:</span>
                      <span>{selectedDoctor.experience || 0} years</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-700">
                      <BuildingOfficeIcon className="h-3.5 w-3.5 text-primary-600 flex-shrink-0" />
                      <span className="font-medium">Qualification:</span>
                      <span className="truncate">{selectedDoctor.qualification}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-700">
                      <HeartIcon className="h-3.5 w-3.5 text-primary-600 flex-shrink-0" />
                      <span className="font-medium">Consultation Fee:</span>
                      <span className="font-bold text-primary-600">${selectedDoctor.consultationFee}</span>
                    </div>
                    {selectedLocation && (
                      <div className="flex items-start gap-1.5 text-gray-700 pt-1 border-t border-gray-200">
                        <MapPinIcon className="h-3.5 w-3.5 text-primary-600 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium">Clinic Location</p>
                          <p className="text-xs text-gray-600 truncate">
                            {clinics.find(c => c.id === selectedLocation)?.locationName || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {clinics.find(c => c.id === selectedLocation)?.address || ''}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-xs text-gray-500">No doctor information available</p>
                </div>
              )}
            </div>

            {/* Right Column - Patient List (70%) */}
            <div className="lg:col-span-8 bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-br from-secondary-600 to-primary-600 p-3 text-white">
                <h2 className="text-sm font-bold mb-1 flex items-center gap-1.5">
                  <UsersIcon className="h-4 w-4" />
                  Patient List
                </h2>
                <p className="text-xs text-secondary-100">
                  {filteredPatients.length} Patient{filteredPatients.length !== 1 ? 's' : ''} Found
                </p>
              </div>

              {isLoading ? (
                <div className="p-8 text-center">
                  <LoadingSpinner size="md" />
                  <p className="text-xs text-gray-600 mt-3">Loading patients...</p>
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="p-8 text-center">
                  <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-xs text-gray-600 font-medium">No patients found</p>
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[calc(100vh-350px)] overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                      <tr>
                        <th className="px-2 py-2 text-left font-semibold text-gray-700 w-12">#</th>
                        <th className="px-2 py-2 text-left font-semibold text-gray-700">Name</th>
                        <th className="px-2 py-2 text-left font-semibold text-gray-700 w-16">Age</th>
                        <th className="px-2 py-2 text-left font-semibold text-gray-700 w-20">Gender</th>
                        <th className="px-2 py-2 text-left font-semibold text-gray-700 w-24">Phone</th>
                        <th className="px-2 py-2 text-left font-semibold text-gray-700 w-20">Time</th>
                        <th className="px-2 py-2 text-center font-semibold text-gray-700 w-24">Status</th>
                        <th className="px-2 py-2 text-center font-semibold text-gray-700 w-20">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {filteredPatients.map((patient, index) => {
                        const isActive = index === currentPatientIndex;
                        const isNext = index === getNextPatientIndex();
                        const isReady = readyPatients.has(patient.id);
                        const readyNumber = getReadyCount(patient.id);

                        return (
                          <tr
                            key={patient.id}
                            className={`
                              ${isActive ? 'bg-blue-100 border-l-4 border-blue-500' : ''}
                              ${isNext ? 'bg-green-50 border-l-4 border-green-500' : ''}
                              ${!isActive && !isNext ? 'hover:bg-gray-50' : ''}
                              transition-colors
                            `}
                          >
                            <td className="px-2 py-2 font-semibold text-gray-900">{index + 1}</td>
                            <td className="px-2 py-2 font-medium text-gray-900">{patient.patientName}</td>
                            <td className="px-2 py-2 text-gray-700">{patient.patientAge} yrs</td>
                            <td className="px-2 py-2 text-gray-700">{patient.patientGender}</td>
                            <td className="px-2 py-2 text-gray-700">{patient.patientPhone}</td>
                            <td className="px-2 py-2 text-gray-700">{formatTimeTo12Hour(patient.time || '')}</td>
                            <td className="px-2 py-2 text-center">
                              {isActive && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-600 text-white">
                                  Active
                                </span>
                              )}
                              {isNext && !isActive && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-600 text-white">
                                  Next
                                </span>
                              )}
                              {isReady && !isActive && !isNext && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-500 text-white">
                                  Ready {readyNumber}
                                </span>
                              )}
                              {!isActive && !isNext && !isReady && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-200 text-gray-700">
                                  Waiting
                                </span>
                              )}
                            </td>
                            <td className="px-2 py-2 text-center">
                              <button
                                onClick={() => handleMarkReady(patient.id)}
                                className={`
                                  px-2 py-1 rounded text-xs font-medium transition-colors
                                  ${isReady 
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                  }
                                `}
                              >
                                {isReady ? 'Unready' : 'Ready'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Navigation Controls */}
              {filteredPatients.length > 0 && (
                <div className="border-t border-gray-200 p-3 bg-gray-50 flex items-center justify-between">
                  <button
                    onClick={handlePreviousPatient}
                    disabled={currentPatientIndex === 0}
                    className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Previous
                  </button>
                  <span className="text-xs text-gray-600 font-medium">
                    Patient {currentPatientIndex + 1} of {filteredPatients.length}
                  </span>
                  <button
                    onClick={handleNextPatient}
                    disabled={currentPatientIndex === filteredPatients.length - 1}
                    className="px-3 py-1.5 bg-primary-600 text-white rounded-md text-xs font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-lg shadow-md p-12 text-center border border-gray-200"
          >
            <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Select Filters</h3>
            <p className="text-sm text-gray-600">Please select location, date, and doctor to view live patients</p>
          </motion.div>
        )}
        </div>
      </div>
    </div>
  );
};

export default LivePatientPage;

