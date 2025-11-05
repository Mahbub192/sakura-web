import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  UsersIcon,
  CalendarIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  HeartIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  ClockIcon,
  UserCircleIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useAuth } from '../../hooks/useAuth';
import { fetchTokenAppointments } from '../../store/slices/appointmentSlice';
import { fetchClinics } from '../../store/slices/clinicSlice';
import { fetchDoctors, fetchCurrentDoctorProfile } from '../../store/slices/doctorSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
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

const PatientsViewPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAssistant } = useAuth();
  const { isLoading } = useAppSelector(state => state.appointments);
  const { clinics } = useAppSelector(state => state.clinics);
  const { doctors, currentDoctorProfile } = useAppSelector(state => state.doctors);
  
  const [selectedLocation, setSelectedLocation] = useState<number | ''>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<number | ''>('');
  const [filteredPatients, setFilteredPatients] = useState<TokenAppointment[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  useEffect(() => {
    if (isAssistant) {
      // For assistants, fetch their assigned doctor's profile
      dispatch(fetchCurrentDoctorProfile());
    }
    dispatch(fetchClinics());
    dispatch(fetchDoctors());
  }, [dispatch, isAssistant]);
  
  // For assistants, automatically set their assigned doctor
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
      // For assistants, always use their assigned doctor's ID
      const doctorIdToUse = isAssistant && currentDoctorProfile 
        ? currentDoctorProfile.id 
        : (selectedDoctorFilter ? Number(selectedDoctorFilter) : undefined);
      
      const result = await dispatch(fetchTokenAppointments({ 
        clinicId: Number(selectedLocation), 
        date: selectedDate,
        doctorId: doctorIdToUse,
      })).unwrap();
      
      setFilteredPatients(result);
      
      // Set the doctor from filter or first doctor from results
      if (isAssistant && currentDoctorProfile) {
        setSelectedDoctor(currentDoctorProfile);
      } else if (selectedDoctorFilter) {
        const doctor = doctors.find(d => d.id === Number(selectedDoctorFilter));
        setSelectedDoctor(doctor || null);
      } else if (result.length > 0 && result[0].doctor) {
        setSelectedDoctor(result[0].doctor);
      } else {
        setSelectedDoctor(null);
      }
    } catch (error: any) {
      console.error('Failed to fetch patients:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load patients';
      toast.error(errorMessage);
      setFilteredPatients([]);
      setSelectedDoctor(null);
    }
  };

  const selectedClinic = clinics.find(c => c.id === Number(selectedLocation));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 px-4">
      <div className="container mx-auto" style={{ maxWidth: '90%' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3"
        >
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg shadow-md p-3 border border-gray-200 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="relative">
              <h1 className="text-lg font-bold text-white mb-0.5 flex items-center gap-2">
                <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-lg">
                  <UsersIcon className="h-4 w-4 text-white" />
                </div>
                Patient Management
              </h1>
              <p className="text-xs text-white/90">View patients by location, date and doctor</p>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-3"
        >
          <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100">
            <div className="flex flex-wrap items-end gap-2">
              {/* Location Select */}
              <div className="relative flex-1 min-w-[200px]">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <MapPinIcon className="h-3.5 w-3.5 inline mr-1 text-primary-600" />
                  Location
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value ? Number(e.target.value) : '')}
                  className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                >
                  <option value="">Choose location...</option>
                  {clinics.map((clinic) => (
                    <option key={clinic.id} value={clinic.id}>
                      {clinic.locationName} - {clinic.city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Select */}
              <div className="relative flex-1 min-w-[150px]">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <CalendarIcon className="h-3.5 w-3.5 inline mr-1 text-primary-600" />
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Doctor Select */}
              <div className="relative flex-1 min-w-[180px]">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <HeartIcon className="h-3.5 w-3.5 inline mr-1 text-primary-600" />
                  Doctor
                </label>
                <select
                  value={isAssistant && currentDoctorProfile ? currentDoctorProfile.id : selectedDoctorFilter}
                  onChange={(e) => setSelectedDoctorFilter(e.target.value ? Number(e.target.value) : '')}
                  disabled={isAssistant}
                  className={`w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white ${
                    isAssistant ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
                  }`}
                >
                  <option value="">All Doctors</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.name}
                    </option>
                  ))}
                </select>
                {isAssistant && currentDoctorProfile && (
                  <p className="text-xs text-gray-500 mt-0.5">Showing patients for your assigned doctor</p>
                )}
              </div>

              {/* Filter Button */}
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

            {/* Selected Filters Info */}
            {(selectedLocation || selectedDate || selectedDoctorFilter) && (
              <div className="mt-2 p-2 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-md border border-primary-200">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {selectedClinic && (
                    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-md shadow-sm">
                      <MapPinIcon className="h-3 w-3 text-primary-600" />
                      <span className="font-semibold text-gray-700">{selectedClinic.locationName}</span>
                    </div>
                  )}
                  {selectedDate && (
                    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-md shadow-sm">
                      <CalendarIcon className="h-3 w-3 text-primary-600" />
                      <span className="font-semibold text-gray-700">
                        {format(new Date(selectedDate), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  )}
                  {(selectedDoctorFilter || (isAssistant && currentDoctorProfile)) && (
                    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-md shadow-sm">
                      <HeartIcon className="h-3 w-3 text-primary-600" />
                      <span className="font-semibold text-gray-700">
                        {isAssistant && currentDoctorProfile
                          ? `Dr. ${currentDoctorProfile.name}`
                          : doctors.find(d => d.id === Number(selectedDoctorFilter))?.name 
                            ? `Dr. ${doctors.find(d => d.id === Number(selectedDoctorFilter))?.name}` 
                            : 'Doctor'}
                      </span>
                    </div>
                  )}
                  {filteredPatients.length > 0 && (
                    <div className="flex items-center gap-1 bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-2 py-1 rounded-md shadow-sm ml-auto">
                      <UsersIcon className="h-3 w-3" />
                      <span className="font-bold">
                        {filteredPatients.length} Patient{filteredPatients.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Main Content - Split View */}
        {selectedLocation && selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-5 gap-4"
          >
            {/* Left Side - Doctor Information (35% width) */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
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
              
              {isLoading ? (
                <div className="p-6 text-center">
                  <LoadingSpinner size="md" />
                  <p className="text-xs text-gray-600 mt-2">Loading doctor information...</p>
                </div>
              ) : selectedDoctor ? (
                <div className="p-3 space-y-2">
                  {/* Doctor Header */}
                  <div className="flex items-center space-x-2.5 pb-2 border-b border-gray-200">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                      <HeartIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-gray-900 truncate">Dr. {selectedDoctor.name}</h3>
                      <p className="text-primary-600 font-semibold text-xs truncate">{selectedDoctor.specialization}</p>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIconSolid key={star} className="h-2.5 w-2.5 text-yellow-400" />
                        ))}
                        <span className="ml-1 text-xs text-gray-600">(4.9)</span>
                      </div>
                    </div>
                  </div>

                  {/* Doctor Details */}
                  <div className="space-y-1.5">
                    {selectedDoctor.experience && (
                      <div className="flex items-center gap-2 p-1.5 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-md hover:shadow-sm transition-shadow">
                        <div className="bg-primary-100 p-1 rounded-md">
                          <AcademicCapIcon className="h-3.5 w-3.5 text-primary-600 flex-shrink-0" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-600">Experience</p>
                          <p className="font-bold text-xs text-gray-900">{selectedDoctor.experience} years</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 p-1.5 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-md hover:shadow-sm transition-shadow">
                      <div className="bg-primary-100 p-1 rounded-md">
                        <BuildingOfficeIcon className="h-3.5 w-3.5 text-primary-600 flex-shrink-0" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-600">Qualification</p>
                        <p className="font-bold text-xs text-gray-900 truncate">{selectedDoctor.qualification}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-1.5 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-md hover:shadow-sm transition-shadow">
                      <div className="bg-primary-100 p-1 rounded-md">
                        <HeartIcon className="h-3.5 w-3.5 text-primary-600 flex-shrink-0" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-600">Consultation Fee</p>
                        <p className="font-bold text-xs text-gray-900">${selectedDoctor.consultationFee}</p>
                      </div>
                    </div>

                    {selectedClinic && (
                      <div className="flex items-center gap-2 p-1.5 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-md hover:shadow-sm transition-shadow">
                        <div className="bg-primary-100 p-1 rounded-md">
                          <MapPinIcon className="h-3.5 w-3.5 text-primary-600 flex-shrink-0" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-600">Clinic Location</p>
                          <p className="font-bold text-xs text-gray-900 truncate">{selectedClinic.locationName}</p>
                          <p className="text-xs text-gray-600 truncate">{selectedClinic.address}, {selectedClinic.city}</p>
                        </div>
                      </div>
                    )}

                    {selectedDoctor.bio && (
                      <div className="p-2 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-md border border-primary-100">
                        <p className="text-xs font-semibold text-primary-900 mb-1">About Doctor</p>
                        <p className="text-xs text-gray-700 leading-relaxed line-clamp-3">{selectedDoctor.bio}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : filteredPatients.length === 0 && !isLoading ? (
                <div className="p-6 text-center">
                  <UserCircleIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-600 font-semibold">No doctor information available</p>
                  <p className="text-xs text-gray-500 mt-1">Please select location and date to view doctor details</p>
                </div>
              ) : null}
            </div>

            {/* Right Side - Patient List (65% width) */}
            <div className="lg:col-span-3 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
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
                  <p className="text-xs text-gray-500">
                    {selectedLocation && selectedDate 
                      ? 'No patients scheduled for the selected location and date'
                      : 'Please select location and date to view patients'
                    }
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 max-h-[calc(100vh-250px)] overflow-y-auto">
                  {filteredPatients.map((patient, index) => (
                    <motion.div
                      key={patient.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="p-2.5 hover:bg-gradient-to-r hover:from-gray-50 hover:to-primary-50/30 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start space-x-2.5 flex-1 min-w-0">
                          {/* Patient Avatar */}
                          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0 group-hover:scale-110 transition-transform">
                            {patient.patientName.charAt(0).toUpperCase()}
                          </div>

                          {/* Patient Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-bold text-gray-900 truncate">{patient.patientName}</h3>
                              <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold flex-shrink-0 border ${
                                patient.status === 'Confirmed' ? 'bg-green-50 text-green-700 border-green-200' :
                                patient.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                patient.status === 'Completed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                'bg-red-50 text-red-700 border-red-200'
                              }`}>
                                {patient.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-xs">
                              <div className="flex items-center gap-1 text-gray-600">
                                <UserCircleIcon className="h-3 w-3 text-primary-600 flex-shrink-0" />
                                <span className="font-semibold">Age:</span>
                                <span>{patient.patientAge} yrs</span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-600">
                                <HeartIcon className="h-3 w-3 text-primary-600 flex-shrink-0" />
                                <span className="font-semibold">Gender:</span>
                                <span>{patient.patientGender}</span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-600">
                                <PhoneIcon className="h-3 w-3 text-primary-600 flex-shrink-0" />
                                <span className="font-semibold">Phone:</span>
                                <span className="truncate">{patient.patientPhone}</span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-600">
                                <EnvelopeIcon className="h-3 w-3 text-primary-600 flex-shrink-0" />
                                <span className="font-semibold">Email:</span>
                                <span className="truncate">{patient.patientEmail}</span>
                              </div>
                            </div>

                            {/* Token and Time */}
                            <div className="mt-1.5 flex items-center gap-2 text-xs">
                              <div className="flex items-center gap-1 bg-gradient-to-r from-primary-50 to-secondary-50 px-2 py-0.5 rounded-md border border-primary-100">
                                <ClockIcon className="h-3 w-3 text-primary-600" />
                                <span className="font-semibold text-gray-700">Token:</span>
                                <span className="font-bold text-primary-600">{patient.tokenNumber}</span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-600 bg-gray-50 px-2 py-0.5 rounded-md">
                                <CalendarIcon className="h-3 w-3" />
                                <span className="font-semibold">{formatTimeTo12Hour(patient.time || '')}</span>
                              </div>
                            </div>

                            {patient.reasonForVisit && (
                              <div className="mt-1 p-1.5 bg-gray-50 rounded text-xs text-gray-600 border border-gray-100">
                                <span className="font-semibold">Reason:</span> {patient.reasonForVisit}
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            navigate(`/patients/live?location=${selectedLocation}&date=${selectedDate}&doctor=${selectedDoctorFilter}&patientId=${patient.id}`);
                          }}
                          className="p-1.5 hover:bg-primary-100 rounded-lg transition-all group/btn"
                        >
                          <ArrowRightIcon className="h-4 w-4 text-gray-400 group-hover/btn:text-primary-600 flex-shrink-0 transition-colors" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {(!selectedLocation || !selectedDate) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-lg shadow-sm p-6 text-center border border-gray-100"
          >
            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3">
              <CalendarIcon className="h-10 w-10 text-primary-600" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Select Location & Date</h3>
            <p className="text-xs text-gray-600 mb-3">
              Please select a location and date from the filters above to view patients
            </p>
            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-md inline-flex">
              <CheckCircleIcon className="h-3.5 w-3.5 text-primary-600" />
              <span>Filter by location and date to see patient appointments</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PatientsViewPage;

