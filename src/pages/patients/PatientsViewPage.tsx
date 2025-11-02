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
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';
import { TokenAppointment, Clinic, Doctor } from '../../types';

const PatientsViewPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tokenAppointments, isLoading } = useAppSelector(state => state.appointments);
  const { clinics } = useAppSelector(state => state.clinics);
  
  const [selectedLocation, setSelectedLocation] = useState<number | ''>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [filteredPatients, setFilteredPatients] = useState<TokenAppointment[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  useEffect(() => {
    dispatch(fetchClinics());
  }, [dispatch]);

  useEffect(() => {
    if (selectedLocation && selectedDate) {
      handleFilter();
    } else {
      setFilteredPatients([]);
      setSelectedDoctor(null);
    }
  }, [selectedLocation, selectedDate]);

  const handleFilter = async () => {
    if (!selectedLocation || !selectedDate) {
      toast.warning('Please select both location and date');
      return;
    }

    try {
      const result = await dispatch(fetchTokenAppointments({ 
        clinicId: Number(selectedLocation), 
        date: selectedDate 
      })).unwrap();
      
      setFilteredPatients(result);
      
      // Set the first doctor from the filtered results
      if (result.length > 0 && result[0].doctor) {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <UsersIcon className="h-8 w-8 text-primary-600" />
              Patient Management
            </h1>
            <p className="text-gray-600">View patients by location and date</p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Location Select */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPinIcon className="h-5 w-5 inline mr-2 text-primary-600" />
                  Select Location
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value ? Number(e.target.value) : '')}
                  className="w-full input-field appearance-none bg-white pr-8"
                >
                  <option value="">Choose a location...</option>
                  {clinics.map((clinic) => (
                    <option key={clinic.id} value={clinic.id}>
                      {clinic.locationName} - {clinic.city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Select */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CalendarIcon className="h-5 w-5 inline mr-2 text-primary-600" />
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full input-field"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Filter Button */}
              <div className="flex items-end">
                <button
                  onClick={handleFilter}
                  disabled={!selectedLocation || !selectedDate || isLoading}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <UsersIcon className="h-5 w-5" />
                      View Patients
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Selected Filters Info */}
            {(selectedLocation || selectedDate) && (
              <div className="mt-4 p-4 bg-primary-50 rounded-lg border border-primary-200">
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  {selectedClinic && (
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="h-4 w-4 text-primary-600" />
                      <span className="font-medium text-gray-700">{selectedClinic.locationName}</span>
                    </div>
                  )}
                  {selectedDate && (
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-primary-600" />
                      <span className="font-medium text-gray-700">
                        {format(new Date(selectedDate), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  )}
                  {filteredPatients.length > 0 && (
                    <div className="flex items-center gap-2 ml-auto">
                      <UsersIcon className="h-4 w-4 text-primary-600" />
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
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Left Side - Doctor Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-br from-primary-600 to-secondary-600 p-6 text-white">
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <HeartIcon className="h-7 w-7" />
                  Doctor Information
                </h2>
                <p className="text-primary-100">Appointment details</p>
              </div>
              
              {isLoading ? (
                <div className="p-12 text-center">
                  <LoadingSpinner size="lg" />
                  <p className="text-gray-600 mt-4">Loading doctor information...</p>
                </div>
              ) : selectedDoctor ? (
                <div className="p-6 space-y-6">
                  {/* Doctor Header */}
                  <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center shadow-lg">
                      <HeartIcon className="h-10 w-10 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900">Dr. {selectedDoctor.name}</h3>
                      <p className="text-primary-600 font-medium">{selectedDoctor.specialization}</p>
                      <div className="flex items-center gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIconSolid key={star} className="h-4 w-4 text-yellow-400" />
                        ))}
                        <span className="ml-2 text-sm text-gray-600">(4.9)</span>
                      </div>
                    </div>
                  </div>

                  {/* Doctor Details */}
                  <div className="space-y-4">
                    {selectedDoctor.experience && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <AcademicCapIcon className="h-6 w-6 text-primary-600" />
                        <div>
                          <p className="text-sm text-gray-600">Experience</p>
                          <p className="font-semibold text-gray-900">{selectedDoctor.experience} years</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <BuildingOfficeIcon className="h-6 w-6 text-primary-600" />
                      <div>
                        <p className="text-sm text-gray-600">Qualification</p>
                        <p className="font-semibold text-gray-900">{selectedDoctor.qualification}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <HeartIcon className="h-6 w-6 text-primary-600" />
                      <div>
                        <p className="text-sm text-gray-600">Consultation Fee</p>
                        <p className="font-semibold text-gray-900">${selectedDoctor.consultationFee}</p>
                      </div>
                    </div>

                    {selectedClinic && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <MapPinIcon className="h-6 w-6 text-primary-600" />
                        <div>
                          <p className="text-sm text-gray-600">Clinic Location</p>
                          <p className="font-semibold text-gray-900">{selectedClinic.locationName}</p>
                          <p className="text-sm text-gray-600">{selectedClinic.address}, {selectedClinic.city}</p>
                        </div>
                      </div>
                    )}

                    {selectedDoctor.bio && (
                      <div className="p-4 bg-primary-50 rounded-lg border border-primary-100">
                        <p className="text-sm font-medium text-primary-900 mb-2">About Doctor</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{selectedDoctor.bio}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : filteredPatients.length === 0 && !isLoading ? (
                <div className="p-12 text-center">
                  <UserCircleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">No doctor information available</p>
                  <p className="text-sm text-gray-500 mt-2">Please select location and date to view doctor details</p>
                </div>
              ) : null}
            </div>

            {/* Right Side - Patient List */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-br from-secondary-600 to-primary-600 p-6 text-white">
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <UsersIcon className="h-7 w-7" />
                  Patient List
                </h2>
                <p className="text-secondary-100">
                  {filteredPatients.length} Patient{filteredPatients.length !== 1 ? 's' : ''} Found
                </p>
              </div>

              {isLoading ? (
                <div className="p-12 text-center">
                  <LoadingSpinner size="lg" />
                  <p className="text-gray-600 mt-4">Loading patients...</p>
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="p-12 text-center">
                  <UsersIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium mb-2">No patients found</p>
                  <p className="text-sm text-gray-500">
                    {selectedLocation && selectedDate 
                      ? 'No patients scheduled for the selected location and date'
                      : 'Please select location and date to view patients'
                    }
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                  {filteredPatients.map((patient, index) => (
                    <motion.div
                      key={patient.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          {/* Patient Avatar */}
                          <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {patient.patientName.charAt(0).toUpperCase()}
                          </div>

                          {/* Patient Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-bold text-gray-900">{patient.patientName}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                patient.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                                patient.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                patient.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {patient.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-2 text-gray-600">
                                <UserCircleIcon className="h-4 w-4 text-primary-600" />
                                <span className="font-medium">Age:</span>
                                <span>{patient.patientAge} years</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <HeartIcon className="h-4 w-4 text-primary-600" />
                                <span className="font-medium">Gender:</span>
                                <span>{patient.patientGender}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <PhoneIcon className="h-4 w-4 text-primary-600" />
                                <span className="font-medium">Phone:</span>
                                <span>{patient.patientPhone}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <EnvelopeIcon className="h-4 w-4 text-primary-600" />
                                <span className="font-medium">Email:</span>
                                <span className="truncate">{patient.patientEmail}</span>
                              </div>
                            </div>

                            {/* Token and Time */}
                            <div className="mt-3 flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-2 bg-primary-50 px-3 py-1 rounded-lg">
                                <ClockIcon className="h-4 w-4 text-primary-600" />
                                <span className="font-medium text-gray-700">Token:</span>
                                <span className="font-bold text-primary-600">{patient.tokenNumber}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <CalendarIcon className="h-4 w-4" />
                                <span>{patient.time}</span>
                              </div>
                            </div>

                            {patient.reasonForVisit && (
                              <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                                <span className="font-medium">Reason:</span> {patient.reasonForVisit}
                              </div>
                            )}
                          </div>
                        </div>

                        <ArrowRightIcon className="h-5 w-5 text-gray-400 ml-4 flex-shrink-0" />
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
            className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-200"
          >
            <CalendarIcon className="h-20 w-20 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Select Location & Date</h3>
            <p className="text-gray-600 mb-6">
              Please select a location and date from the filters above to view patients
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <CheckCircleIcon className="h-5 w-5" />
              <span>Filter by location and date to see patient appointments</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PatientsViewPage;

