import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  UsersIcon,
  CalendarIcon,
  MapPinIcon,
  HeartIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
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
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false); // Full screen mode

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
            className={isFullScreen ? "mb-0" : "mb-3"}
          >
            <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg shadow-md p-3 border border-gray-200 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-bold text-white mb-0.5 flex items-center gap-2">
                    <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-lg">
                      <UsersIcon className="h-4 w-4 text-white" />
                    </div>
                    Live Patient Management
                  </h1>
                  <p className="text-xs text-white/90">View and manage live patient appointments</p>
                </div>
                {selectedLocation && selectedDate && filteredPatients.length > 0 && (
                  <button
                    onClick={() => setIsFullScreen(!isFullScreen)}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-white font-semibold text-xs shadow-sm hover:shadow-md"
                  >
                    {isFullScreen ? (
                      <>
                        <ArrowsPointingInIcon className="h-4 w-4" />
                        Exit Full Screen
                      </>
                    ) : (
                      <>
                        <ArrowsPointingOutIcon className="h-4 w-4" />
                        Full Screen
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>

        {/* Filters */}
        {!isFullScreen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm p-3 mb-3 border border-gray-100"
          >
          <div className="flex flex-wrap items-end gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <MapPinIcon className="h-3.5 w-3.5 inline mr-1 text-primary-600" />
                Location *
              </label>
              <select
                value={selectedLocation || ''}
                onChange={(e) => setSelectedLocation(e.target.value ? Number(e.target.value) : '')}
                className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="">Select Location</option>
                {clinics.map((clinic) => (
                  <option key={clinic.id} value={clinic.id}>
                    {clinic.locationName} - {clinic.city}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative flex-1 min-w-[150px]">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <CalendarIcon className="h-3.5 w-3.5 inline mr-1 text-primary-600" />
                Date *
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              />
            </div>

            <div className="relative flex-1 min-w-[180px]">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <HeartIcon className="h-3.5 w-3.5 inline mr-1 text-primary-600" />
                Doctor *
              </label>
              <select
                value={selectedDoctorFilter || ''}
                onChange={(e) => setSelectedDoctorFilter(e.target.value ? Number(e.target.value) : '')}
                disabled={isAssistant}
                className={`w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white ${
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
                <p className="text-xs text-gray-500 mt-0.5">Showing patients for your assigned doctor</p>
              )}
            </div>

            <div className="flex-shrink-0">
              <button
                onClick={handleFilter}
                disabled={!selectedLocation || !selectedDate || isLoading}
                className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold text-xs py-1.5 px-4 rounded-md transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Loading...
                  </>
                ) : (
                  <>
                    <UsersIcon className="h-3.5 w-3.5" />
                    View Patients
                  </>
                )}
              </button>
            </div>
          </div>
          </motion.div>
        )}

        {/* Main Content - 25% Doctor Info, 70% Patient List */}
        {selectedLocation && selectedDate && filteredPatients.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`grid grid-cols-1 lg:grid-cols-10 gap-4 ${isFullScreen ? 'fixed inset-0 z-40 bg-gradient-to-br from-gray-50 to-gray-100 p-4' : ''}`}
          >
            {/* Left Column - Doctor Information (25%) */}
            <div className={`lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden ${isFullScreen ? 'lg:h-[calc(100vh-2rem)]' : ''}`}>
              <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 p-3 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="relative">
                  <h2 className="text-base font-bold mb-0.5 flex items-center gap-2">
                    <div className="bg-white/20 backdrop-blur-sm p-1 rounded-lg">
                      <HeartIcon className="h-4 w-4" />
                    </div>
                    Doctor Information
                  </h2>
                  <p className="text-xs text-white/90">Appointment details</p>
                </div>
              </div>

              {selectedDoctor ? (
                <div className="p-3 space-y-2">
                  <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                      <HeartIcon className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-900 truncate">Dr. {selectedDoctor.name}</h3>
                      <p className="text-primary-600 font-semibold text-sm truncate">{selectedDoctor.specialization}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIconSolid key={star} className="h-4 w-4 text-yellow-400" />
                        ))}
                        <span className="ml-1 text-sm text-gray-600">(4.9)</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {selectedDoctor.experience && (
                      <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-md hover:shadow-sm transition-shadow">
                        <div className="bg-primary-100 p-1.5 rounded-md">
                          <AcademicCapIcon className="h-5 w-5 text-primary-600 flex-shrink-0" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-gray-600">Experience</p>
                          <p className="font-bold text-base text-gray-900">{selectedDoctor.experience} years</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-md hover:shadow-sm transition-shadow">
                      <div className="bg-primary-100 p-1.5 rounded-md">
                        <BuildingOfficeIcon className="h-5 w-5 text-primary-600 flex-shrink-0" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-600">Qualification</p>
                        <p className="font-bold text-base text-gray-900 truncate">{selectedDoctor.qualification}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-md hover:shadow-sm transition-shadow">
                      <div className="bg-primary-100 p-1.5 rounded-md">
                        <HeartIcon className="h-5 w-5 text-primary-600 flex-shrink-0" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-600">Consultation Fee</p>
                        <p className="font-bold text-base text-gray-900">${selectedDoctor.consultationFee}</p>
                      </div>
                    </div>

                    {selectedLocation && (
                      <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-md hover:shadow-sm transition-shadow">
                        <div className="bg-primary-100 p-1.5 rounded-md">
                          <MapPinIcon className="h-5 w-5 text-primary-600 flex-shrink-0" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-gray-600">Clinic Location</p>
                          <p className="font-bold text-base text-gray-900 truncate">
                            {clinics.find(c => c.id === selectedLocation)?.locationName || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-600 truncate">
                            {clinics.find(c => c.id === selectedLocation)?.address || ''}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <UserCircleIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-600 font-semibold">No doctor information available</p>
                  <p className="text-xs text-gray-500 mt-1">Please select filters to view doctor details</p>
                </div>
              )}
            </div>

            {/* Right Column - Patient List (70%) */}
            <div className={`lg:col-span-8 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col ${isFullScreen ? 'lg:h-[calc(100vh-2rem)]' : ''}`}>
              <div className="bg-gradient-to-br from-secondary-600 via-secondary-700 to-primary-600 p-3 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="relative">
                  <h2 className="text-base font-bold mb-0.5 flex items-center gap-2">
                    <div className="bg-white/20 backdrop-blur-sm p-1 rounded-lg">
                      <UsersIcon className="h-4 w-4" />
                    </div>
                    Patient List
                  </h2>
                  <p className="text-xs text-white/90">
                    {filteredPatients.length} Patient{filteredPatients.length !== 1 ? 's' : ''} Found
                  </p>
                </div>
              </div>

              {isLoading ? (
                <div className="p-6 text-center">
                  <LoadingSpinner size="md" />
                  <p className="text-xs text-gray-600 mt-2">Loading patients...</p>
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="p-6 text-center">
                  <UsersIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-600 font-semibold mb-1">No patients found</p>
                  <p className="text-xs text-gray-500">Please select filters to view patients</p>
                </div>
              ) : (
                <div className={`overflow-x-auto overflow-y-auto flex-1 ${isFullScreen ? 'max-h-[calc(100vh-200px)]' : 'max-h-[calc(100vh-350px)]'}`}>
                  <table className="w-full text-sm">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200 sticky top-0 z-10">
                      <tr>
                        <th className="px-3 py-3 text-left font-bold text-gray-700 w-12">#</th>
                        <th className="px-3 py-3 text-left font-bold text-gray-700">Name</th>
                        <th className="px-3 py-3 text-left font-bold text-gray-700 w-20">Age</th>
                        <th className="px-3 py-3 text-left font-bold text-gray-700 w-24">Gender</th>
                        <th className="px-3 py-3 text-left font-bold text-gray-700 w-32">Phone</th>
                        <th className="px-3 py-3 text-left font-bold text-gray-700 w-24">Time</th>
                        <th className="px-3 py-3 text-center font-bold text-gray-700 w-28">Status</th>
                        <th className="px-3 py-3 text-center font-bold text-gray-700 w-24">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {filteredPatients.map((patient, index) => {
                        const isActive = index === currentPatientIndex;
                        const isNext = index === getNextPatientIndex();
                        const isReady = readyPatients.has(patient.id);
                        const readyNumber = getReadyCount(patient.id);

                        return (
                          <tr
                            key={patient.id}
                            className={`
                              ${isActive ? 'bg-gradient-to-r from-blue-100 to-blue-50 border-l-4 border-blue-600 shadow-sm' : ''}
                              ${isNext && !isActive ? 'bg-gradient-to-r from-green-50 to-green-100/50 border-l-4 border-green-600 shadow-sm' : ''}
                              ${!isActive && !isNext ? 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-primary-50/30' : ''}
                              transition-all
                            `}
                          >
                            <td className="px-3 py-3 font-bold text-gray-900 text-base">{index + 1}</td>
                            <td className="px-3 py-3 font-semibold text-gray-900 text-base">{patient.patientName}</td>
                            <td className="px-3 py-3 text-gray-700 text-base">{patient.patientAge} yrs</td>
                            <td className="px-3 py-3 text-gray-700 text-base">{patient.patientGender}</td>
                            <td className="px-3 py-3 text-gray-700 text-base">{patient.patientPhone}</td>
                            <td className="px-3 py-3 text-gray-700 font-medium text-base">{formatTimeTo12Hour(patient.time || '')}</td>
                            <td className="px-3 py-3 text-center">
                              {isActive && (
                                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm border border-blue-800">
                                  Active
                                </span>
                              )}
                              {isNext && !isActive && (
                                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r from-green-600 to-green-700 text-white shadow-sm border border-green-800">
                                  Next
                                </span>
                              )}
                              {isReady && !isActive && !isNext && (
                                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-sm border border-yellow-700">
                                  Ready {readyNumber}
                                </span>
                              )}
                              {!isActive && !isNext && !isReady && (
                                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold bg-gray-200 text-gray-700 border border-gray-300">
                                  Waiting
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-3 text-center">
                              <button
                                onClick={() => handleMarkReady(patient.id)}
                                className={`
                                  px-3 py-1.5 rounded-md text-sm font-semibold transition-all shadow-sm hover:shadow-md
                                  ${isReady 
                                    ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-700 border border-red-300 hover:from-red-200 hover:to-red-300' 
                                    : 'bg-gradient-to-r from-green-100 to-green-200 text-green-700 border border-green-300 hover:from-green-200 hover:to-green-300'
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
                <div className="border-t border-gray-200 p-3 bg-gradient-to-r from-gray-50 to-gray-100 flex items-center justify-between">
                  <button
                    onClick={handlePreviousPatient}
                    disabled={currentPatientIndex === 0}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-semibold hover:bg-gray-50 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    ← Previous
                  </button>
                  <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-md border border-gray-200 shadow-sm">
                    <span className="text-base text-gray-700 font-bold">
                      Patient {currentPatientIndex + 1} of {filteredPatients.length}
                    </span>
                  </div>
                  <button
                    onClick={handleNextPatient}
                    disabled={currentPatientIndex === filteredPatients.length - 1}
                    className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-md text-sm font-semibold hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
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
            className="bg-white rounded-lg shadow-sm p-6 text-center border border-gray-100"
          >
            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3">
              <CalendarIcon className="h-10 w-10 text-primary-600" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Select Filters</h3>
            <p className="text-xs text-gray-600 mb-3">Please select location, date, and doctor to view live patients</p>
            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-md inline-flex">
              <CheckCircleIcon className="h-3.5 w-3.5 text-primary-600" />
              <span>Use the filters above to get started</span>
            </div>
          </motion.div>
        )}
        </div>
      </div>
    </div>
  );
};

export default LivePatientPage;

