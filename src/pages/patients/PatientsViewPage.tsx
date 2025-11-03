import React, { useState, useEffect } from 'react';
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
import { fetchTokenAppointments } from '../../store/slices/appointmentSlice';
import { fetchClinics } from '../../store/slices/clinicSlice';
import { fetchDoctors } from '../../store/slices/doctorSlice';
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
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector(state => state.appointments);
  const { clinics } = useAppSelector(state => state.clinics);
  const { doctors } = useAppSelector(state => state.doctors);
  
  const [selectedLocation, setSelectedLocation] = useState<number | ''>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<number | ''>('');
  const [filteredPatients, setFilteredPatients] = useState<TokenAppointment[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  useEffect(() => {
    dispatch(fetchClinics());
    dispatch(fetchDoctors());
  }, [dispatch]);

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
      const result = await dispatch(fetchTokenAppointments({ 
        clinicId: Number(selectedLocation), 
        date: selectedDate,
        doctorId: selectedDoctorFilter ? Number(selectedDoctorFilter) : undefined,
      })).unwrap();
      
      setFilteredPatients(result);
      
      // Set the doctor from filter or first doctor from results
      if (selectedDoctorFilter) {
        const doctor = doctors.find(d => d.id === Number(selectedDoctorFilter));
        setSelectedDoctor(doctor || null);
      } else if (result.length > 0 && result[0].doctor) {
        setSelectedDoctor(result[0].doctor);
      } else {
        setSelectedDoctor(null);
      }
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      toast.error('Failed to load patients');
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
          className="mb-4"
        >
          <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <h1 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
              <UsersIcon className="h-5 w-5 text-primary-600" />
              Patient Management
            </h1>
            <p className="text-sm text-gray-600">View patients by location, date and doctor</p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4"
        >
          <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Location Select */}
              <div className="relative">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <MapPinIcon className="h-4 w-4 inline mr-1 text-primary-600" />
                  Location
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value ? Number(e.target.value) : '')}
                  className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
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
              <div className="relative">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <CalendarIcon className="h-4 w-4 inline mr-1 text-primary-600" />
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Doctor Select */}
              <div className="relative">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <HeartIcon className="h-4 w-4 inline mr-1 text-primary-600" />
                  Doctor
                </label>
                <select
                  value={selectedDoctorFilter}
                  onChange={(e) => setSelectedDoctorFilter(e.target.value ? Number(e.target.value) : '')}
                  className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Doctors</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Button */}
              <div className="flex items-end">
                <button
                  onClick={handleFilter}
                  disabled={!selectedLocation || !selectedDate || isLoading}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <UsersIcon className="h-4 w-4" />
                      View Patients
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Selected Filters Info */}
            {(selectedLocation || selectedDate || selectedDoctorFilter) && (
              <div className="mt-3 p-3 bg-primary-50 rounded-md border border-primary-200">
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  {selectedClinic && (
                    <div className="flex items-center gap-1.5">
                      <MapPinIcon className="h-3.5 w-3.5 text-primary-600" />
                      <span className="font-medium text-gray-700">{selectedClinic.locationName}</span>
                    </div>
                  )}
                  {selectedDate && (
                    <div className="flex items-center gap-1.5">
                      <CalendarIcon className="h-3.5 w-3.5 text-primary-600" />
                      <span className="font-medium text-gray-700">
                        {format(new Date(selectedDate), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  )}
                  {selectedDoctorFilter && (
                    <div className="flex items-center gap-1.5">
                      <HeartIcon className="h-3.5 w-3.5 text-primary-600" />
                      <span className="font-medium text-gray-700">
                        {doctors.find(d => d.id === Number(selectedDoctorFilter))?.name ? `Dr. ${doctors.find(d => d.id === Number(selectedDoctorFilter))?.name}` : 'Doctor'}
                      </span>
                    </div>
                  )}
                  {filteredPatients.length > 0 && (
                    <div className="flex items-center gap-1.5 ml-auto">
                      <UsersIcon className="h-3.5 w-3.5 text-primary-600" />
                      <span className="font-medium text-primary-600">
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
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-br from-primary-600 to-secondary-600 p-4 text-white">
                <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
                  <HeartIcon className="h-5 w-5" />
                  Doctor Information
                </h2>
                <p className="text-xs text-primary-100">Appointment details</p>
              </div>
              
              {isLoading ? (
                <div className="p-8 text-center">
                  <LoadingSpinner size="md" />
                  <p className="text-sm text-gray-600 mt-3">Loading doctor information...</p>
                </div>
              ) : selectedDoctor ? (
                <div className="p-4 space-y-3">
                  {/* Doctor Header */}
                  <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                      <HeartIcon className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 truncate">Dr. {selectedDoctor.name}</h3>
                      <p className="text-primary-600 font-medium text-sm truncate">{selectedDoctor.specialization}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIconSolid key={star} className="h-3 w-3 text-yellow-400" />
                        ))}
                        <span className="ml-1 text-xs text-gray-600">(4.9)</span>
                      </div>
                    </div>
                  </div>

                  {/* Doctor Details */}
                  <div className="space-y-2">
                    {selectedDoctor.experience && (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                        <AcademicCapIcon className="h-4 w-4 text-primary-600 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-600">Experience</p>
                          <p className="font-semibold text-sm text-gray-900">{selectedDoctor.experience} years</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                      <BuildingOfficeIcon className="h-4 w-4 text-primary-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-600">Qualification</p>
                        <p className="font-semibold text-sm text-gray-900 truncate">{selectedDoctor.qualification}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                      <HeartIcon className="h-4 w-4 text-primary-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-600">Consultation Fee</p>
                        <p className="font-semibold text-sm text-gray-900">${selectedDoctor.consultationFee}</p>
                      </div>
                    </div>

                    {selectedClinic && (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                        <MapPinIcon className="h-4 w-4 text-primary-600 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-600">Clinic Location</p>
                          <p className="font-semibold text-sm text-gray-900 truncate">{selectedClinic.locationName}</p>
                          <p className="text-xs text-gray-600 truncate">{selectedClinic.address}, {selectedClinic.city}</p>
                        </div>
                      </div>
                    )}

                    {selectedDoctor.bio && (
                      <div className="p-3 bg-primary-50 rounded-md border border-primary-100">
                        <p className="text-xs font-medium text-primary-900 mb-1">About Doctor</p>
                        <p className="text-xs text-gray-700 leading-relaxed line-clamp-3">{selectedDoctor.bio}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : filteredPatients.length === 0 && !isLoading ? (
                <div className="p-8 text-center">
                  <UserCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 font-medium">No doctor information available</p>
                  <p className="text-xs text-gray-500 mt-1">Please select location and date to view doctor details</p>
                </div>
              ) : null}
            </div>

            {/* Right Side - Patient List (65% width) */}
            <div className="lg:col-span-3 bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-br from-secondary-600 to-primary-600 p-4 text-white">
                <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
                  <UsersIcon className="h-5 w-5" />
                  Patient List
                </h2>
                <p className="text-xs text-secondary-100">
                  {filteredPatients.length} Patient{filteredPatients.length !== 1 ? 's' : ''} Found
                </p>
              </div>

              {isLoading ? (
                <div className="p-8 text-center">
                  <LoadingSpinner size="md" />
                  <p className="text-sm text-gray-600 mt-3">Loading patients...</p>
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="p-8 text-center">
                  <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 font-medium mb-1">No patients found</p>
                  <p className="text-xs text-gray-500">
                    {selectedLocation && selectedDate 
                      ? 'No patients scheduled for the selected location and date'
                      : 'Please select location and date to view patients'
                    }
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 max-h-[calc(100vh-250px)] overflow-y-auto">
                  {filteredPatients.map((patient, index) => (
                    <motion.div
                      key={patient.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start space-x-3 flex-1 min-w-0">
                          {/* Patient Avatar */}
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white font-bold text-base shadow-sm flex-shrink-0">
                            {patient.patientName.charAt(0).toUpperCase()}
                          </div>

                          {/* Patient Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <h3 className="text-base font-bold text-gray-900 truncate">{patient.patientName}</h3>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${
                                patient.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                                patient.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                patient.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {patient.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                              <div className="flex items-center gap-1.5 text-gray-600">
                                <UserCircleIcon className="h-3.5 w-3.5 text-primary-600 flex-shrink-0" />
                                <span className="font-medium">Age:</span>
                                <span>{patient.patientAge} yrs</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-gray-600">
                                <HeartIcon className="h-3.5 w-3.5 text-primary-600 flex-shrink-0" />
                                <span className="font-medium">Gender:</span>
                                <span>{patient.patientGender}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-gray-600">
                                <PhoneIcon className="h-3.5 w-3.5 text-primary-600 flex-shrink-0" />
                                <span className="font-medium">Phone:</span>
                                <span className="truncate">{patient.patientPhone}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-gray-600">
                                <EnvelopeIcon className="h-3.5 w-3.5 text-primary-600 flex-shrink-0" />
                                <span className="font-medium">Email:</span>
                                <span className="truncate">{patient.patientEmail}</span>
                              </div>
                            </div>

                            {/* Token and Time */}
                            <div className="mt-2 flex items-center gap-3 text-xs">
                              <div className="flex items-center gap-1.5 bg-primary-50 px-2 py-1 rounded-md">
                                <ClockIcon className="h-3.5 w-3.5 text-primary-600" />
                                <span className="font-medium text-gray-700">Token:</span>
                                <span className="font-bold text-primary-600">{patient.tokenNumber}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-gray-600">
                                <CalendarIcon className="h-3.5 w-3.5" />
                                <span>{formatTimeTo12Hour(patient.time || '')}</span>
                              </div>
                            </div>

                            {patient.reasonForVisit && (
                              <div className="mt-1.5 p-1.5 bg-gray-50 rounded text-xs text-gray-600">
                                <span className="font-medium">Reason:</span> {patient.reasonForVisit}
                              </div>
                            )}
                          </div>
                        </div>

                        <ArrowRightIcon className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
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
            className="bg-white rounded-lg shadow-md p-8 text-center border border-gray-200"
          >
            <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">Select Location & Date</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please select a location and date from the filters above to view patients
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <CheckCircleIcon className="h-4 w-4" />
              <span>Filter by location and date to see patient appointments</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PatientsViewPage;

