import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useAuth } from '../../hooks/useAuth';
import { fetchTokenAppointments } from '../../store/slices/appointmentSlice';
import { fetchClinics } from '../../store/slices/clinicSlice';
import { fetchDoctors, fetchCurrentDoctorProfile } from '../../store/slices/doctorSlice';
import Modal from '../../components/ui/Modal';
import Calendar from '../../components/ui/Calendar';
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
  
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | undefined>(undefined);
  const [selectedLocation, setSelectedLocation] = useState<number | ''>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<number | ''>('');
  const [filteredPatients, setFilteredPatients] = useState<TokenAppointment[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<TokenAppointment | null>(null);
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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
      setRefreshing(true);
      const doctorIdToUse = isAssistant && currentDoctorProfile 
        ? currentDoctorProfile.id 
        : (selectedDoctorFilter ? Number(selectedDoctorFilter) : undefined);
      
      const result = await dispatch(fetchTokenAppointments({ 
        clinicId: Number(selectedLocation), 
        date: selectedDate,
        doctorId: doctorIdToUse,
      })).unwrap();
      
      setFilteredPatients(result);
      
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
    } finally {
      setRefreshing(false);
    }
  };

  const selectedClinic = clinics.find(c => c.id === Number(selectedLocation));

  // Calculate stats
  const statsData = useMemo(() => {
    const totalPatients = filteredPatients.length;
    const confirmed = filteredPatients.filter(p => p.status === 'Confirmed').length;
    const pending = filteredPatients.filter(p => p.status === 'Pending').length;
    const completed = filteredPatients.filter(p => p.status === 'Completed').length;
    const cancelled = filteredPatients.filter(p => p.status === 'Cancelled').length;

    return {
      totalPatients,
      confirmed,
      pending,
      completed,
      cancelled,
    };
  }, [filteredPatients]);

  const { totalPatients, confirmed, pending, completed, cancelled } = statsData;

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'text-green-600 dark:text-green-500 bg-green-100 dark:bg-green-900/50';
      case 'Pending':
        return 'text-yellow-600 dark:text-yellow-500 bg-yellow-100 dark:bg-yellow-900/50';
      case 'Completed':
        return 'text-blue-600 dark:text-blue-500 bg-blue-100 dark:bg-blue-900/50';
      case 'Cancelled':
        return 'text-red-600 dark:text-red-500 bg-red-100 dark:bg-red-900/50';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800';
    }
  };

  const handleCalendarDateSelect = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    setSelectedDate(dateStr);
    setSelectedCalendarDate(date);
    setShowCalendarModal(false);
    toast.success(`Selected date: ${format(date, 'MMM dd, yyyy')}`);
  };

  useEffect(() => {
    if (selectedDate) {
      setSelectedCalendarDate(new Date(selectedDate));
    } else {
      setSelectedCalendarDate(undefined);
    }
  }, [selectedDate]);

  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-gray-800 dark:text-gray-200 w-full">
      <div className="w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center justify-center size-8 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Patient Management</h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">View patients by location, date and doctor</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleFilter}
              disabled={refreshing || !selectedLocation || !selectedDate}
              className="flex items-center justify-center gap-1 sm:gap-2 rounded-lg h-10 px-2 sm:px-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold leading-normal border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-xl">refresh</span>
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={() => setShowCalendarModal(true)}
              className="flex items-center justify-center gap-1 sm:gap-2 rounded-lg h-10 px-2 sm:px-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold leading-normal border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <span className="material-symbols-outlined text-xl">calendar_month</span>
              <span className="hidden sm:inline">Calendar</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {selectedLocation && selectedDate && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-lg flex items-center gap-4">
              <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">people</span>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalPatients}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-lg flex items-center gap-4">
              <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400">check_circle</span>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Confirmed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{confirmed}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-lg flex items-center gap-4">
              <div className="bg-yellow-100 dark:bg-yellow-900/50 p-3 rounded-full">
                <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400">schedule</span>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{pending}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-lg flex items-center gap-4">
              <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-full">
                <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400">done_all</span>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{completed}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-lg flex items-center gap-4">
              <div className="bg-red-100 dark:bg-red-900/50 p-3 rounded-full">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400">cancel</span>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Cancelled</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{cancelled}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters Section */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 sm:p-4 rounded-lg mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
            {(selectedLocation || selectedDate || selectedDoctorFilter) && (
              <button
                onClick={() => {
                  setSelectedLocation('');
                  setSelectedDate('');
                  setSelectedDoctorFilter('');
                  setFilteredPatients([]);
                  setSelectedDoctor(null);
                }}
                className="flex items-center justify-center gap-1 sm:gap-2 rounded-lg h-8 px-2 sm:px-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-medium border border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <span className="material-symbols-outlined text-lg">close</span>
                <span>Clear Filters</span>
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="relative">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                <span className="material-symbols-outlined text-sm align-middle mr-1">location_on</span>
                Location
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value ? Number(e.target.value) : '')}
                className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 shadow-sm focus:border-primary focus:ring-primary px-3 py-2 text-sm"
              >
                <option value="">Choose location...</option>
                {clinics.map((clinic) => (
                  <option key={clinic.id} value={clinic.id}>
                    {clinic.locationName} - {clinic.city}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                <span className="material-symbols-outlined text-sm align-middle mr-1">calendar_month</span>
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 shadow-sm focus:border-primary focus:ring-primary px-3 py-2 text-sm"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="relative">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                <span className="material-symbols-outlined text-sm align-middle mr-1">person</span>
                Doctor
              </label>
              <select
                value={isAssistant && currentDoctorProfile ? currentDoctorProfile.id : selectedDoctorFilter}
                onChange={(e) => setSelectedDoctorFilter(e.target.value ? Number(e.target.value) : '')}
                disabled={isAssistant}
                className={`w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 shadow-sm focus:border-primary focus:ring-primary px-3 py-2 text-sm ${
                  isAssistant ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-60' : ''
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
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Showing patients for your assigned doctor</p>
              )}
            </div>

            <div className="flex items-end">
              <button
                onClick={handleFilter}
                disabled={!selectedLocation || !selectedDate || isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-xl">search</span>
                    <span>View Patients</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Selected Filters Info */}
          {(selectedLocation || selectedDate || selectedDoctorFilter) && (
            <div className="mt-4 p-3 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-md border border-primary-200 dark:border-primary-800">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {selectedClinic && (
                  <div className="flex items-center gap-1 bg-white dark:bg-gray-800 px-2 py-1 rounded-md shadow-sm">
                    <span className="material-symbols-outlined text-sm text-primary-600 dark:text-primary-400">location_on</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{selectedClinic.locationName}</span>
                  </div>
                )}
                {selectedDate && (
                  <div className="flex items-center gap-1 bg-white dark:bg-gray-800 px-2 py-1 rounded-md shadow-sm">
                    <span className="material-symbols-outlined text-sm text-primary-600 dark:text-primary-400">calendar_month</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {format(new Date(selectedDate), 'MMM dd, yyyy')}
                    </span>
                  </div>
                )}
                {(selectedDoctorFilter || (isAssistant && currentDoctorProfile)) && (
                  <div className="flex items-center gap-1 bg-white dark:bg-gray-800 px-2 py-1 rounded-md shadow-sm">
                    <span className="material-symbols-outlined text-sm text-primary-600 dark:text-primary-400">person</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
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
                    <span className="material-symbols-outlined text-sm">people</span>
                    <span className="font-bold">
                      {filteredPatients.length} Patient{filteredPatients.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Main Content - Split View */}
        {selectedLocation && selectedDate ? (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
            {/* Left Side - Doctor Information */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
              {isLoading ? (
                <div className="p-8 text-center">
                  <LoadingSpinner size="md" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">Loading doctor information...</p>
                </div>
              ) : selectedDoctor ? (
                <div className="p-4 space-y-3">
                  {/* Doctor Header */}
                  <div className="flex items-center space-x-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-xl">person</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">Dr. {selectedDoctor.name}</h3>
                      <p className="text-primary-600 dark:text-primary-400 text-sm truncate mt-0.5">{selectedDoctor.specialization}</p>
                    </div>
                  </div>

                  {/* Doctor Details - Simple Design */}
                  <div className="space-y-2.5">
                    {selectedDoctor.experience && (
                      <div className="flex items-center gap-2.5">
                        <div className="bg-primary-100 dark:bg-primary-900/50 p-1.5 rounded">
                          <span className="material-symbols-outlined text-primary-600 dark:text-primary-400 text-base">school</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Experience</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedDoctor.experience} years</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2.5">
                      <div className="bg-primary-100 dark:bg-primary-900/50 p-1.5 rounded">
                        <span className="material-symbols-outlined text-primary-600 dark:text-primary-400 text-base">workspace_premium</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Qualification</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{selectedDoctor.qualification}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="bg-primary-100 dark:bg-primary-900/50 p-1.5 rounded">
                        <span className="material-symbols-outlined text-primary-600 dark:text-primary-400 text-base">payments</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Consultation Fee</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">${selectedDoctor.consultationFee}</p>
                      </div>
                    </div>

                    {selectedClinic && (
                      <div className="flex items-center gap-2.5">
                        <div className="bg-primary-100 dark:bg-primary-900/50 p-1.5 rounded">
                          <span className="material-symbols-outlined text-primary-600 dark:text-primary-400 text-base">location_on</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Clinic Location</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{selectedClinic.locationName}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{selectedClinic.address}, {selectedClinic.city}</p>
                        </div>
                      </div>
                    )}

                    {selectedDoctor.bio && (
                      <div className="pt-1">
                        <p className="text-xs font-medium text-primary-900 dark:text-primary-300 mb-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">info</span>
                          About Doctor
                        </p>
                        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{selectedDoctor.bio}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : filteredPatients.length === 0 && !isLoading ? (
                <div className="p-8 text-center">
                  <span className="material-symbols-outlined text-5xl text-gray-400 dark:text-gray-500 mb-3 block">person_off</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">No doctor information available</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Please select location and date to view doctor details</p>
                </div>
              ) : null}
            </div>

            {/* Right Side - Patient List */}
            <div className="lg:col-span-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
              {isLoading ? (
                <div className="p-8 text-center">
                  <LoadingSpinner size="md" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">Loading patients...</p>
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="p-8 text-center">
                  <span className="material-symbols-outlined text-5xl text-gray-400 dark:text-gray-500 mb-3 block">person_off</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-1">No patients found</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {selectedLocation && selectedDate 
                      ? 'No patients scheduled for the selected location and date'
                      : 'Please select location and date to view patients'
                    }
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">SI No.</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Phone Number</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Gender</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Time</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredPatients.map((patient, index) => (
                        <tr
                          key={patient.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedPatient(patient);
                            setShowPatientDetails(true);
                          }}
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{index + 1}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                                {patient.patientName?.charAt(0).toUpperCase() || '?'}
                              </div>
                              <div>
                                <div className="text-sm font-bold text-gray-900 dark:text-white">
                                  {patient.patientName || 'Unknown'}
                                </div>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold mt-1 ${getStatusBadgeClass(patient.status)}`}>
                                  {patient.status}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-sm text-gray-900 dark:text-white">
                              <span className="material-symbols-outlined text-sm text-primary-600 dark:text-primary-400">phone</span>
                              <span>{patient.patientPhone || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-sm text-gray-900 dark:text-white">
                              <span className="material-symbols-outlined text-sm text-primary-600 dark:text-primary-400">favorite</span>
                              <span>{patient.patientGender || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-sm text-gray-900 dark:text-white">
                              <span className="material-symbols-outlined text-sm text-primary-600 dark:text-primary-400">schedule</span>
                              <span>{formatTimeTo12Hour(patient.time || '')}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/patients/live?location=${selectedLocation}&date=${selectedDate}&doctor=${selectedDoctorFilter}&patientId=${patient.id}`);
                              }}
                              className="p-2 hover:bg-primary-100 dark:hover:bg-primary-900/20 rounded-lg transition-all"
                            >
                              <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">arrow_forward</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-8 sm:p-12 text-center">
            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-4xl text-primary-600 dark:text-primary-400">calendar_month</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Select Location & Date</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Please select a location and date from the filters above to view patients
            </p>
            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-md inline-flex">
              <span className="material-symbols-outlined text-sm text-primary-600 dark:text-primary-400">info</span>
              <span>Filter by location and date to see patient appointments</span>
            </div>
          </div>
        )}
      </div>

      {/* Calendar Modal */}
      <Modal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        title="Select Date"
        size="md"
      >
        <Calendar
          appointments={[]}
          onDateSelect={handleCalendarDateSelect}
          selectedDate={selectedCalendarDate}
        />
      </Modal>

      {/* Patient Details Modal */}
      <Modal
        isOpen={showPatientDetails}
        onClose={() => {
          setShowPatientDetails(false);
          setSelectedPatient(null);
        }}
        title="Patient Details"
        size="md"
      >
        {selectedPatient && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 p-4 rounded-lg border border-primary-100 dark:border-primary-800">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary-600 dark:text-primary-400">person</span>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Patient Information</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">Name</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedPatient.patientName || 'N/A'}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">Age</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedPatient.patientAge || 'N/A'} years</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">Gender</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedPatient.patientGender || 'N/A'}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">Phone</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedPatient.patientPhone || 'N/A'}</p>
                </div>
                <div className="col-span-2 bg-white dark:bg-gray-800 p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">Email</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{selectedPatient.patientEmail || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">event</span>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Appointment Details</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">Token Number</p>
                  <p className="text-sm font-bold text-primary-600 dark:text-primary-400">#{selectedPatient.tokenNumber}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">Status</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadgeClass(selectedPatient.status)}`}>
                    {selectedPatient.status}
                  </span>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">Date</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {format(new Date(selectedPatient.date), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">Time</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {selectedPatient.time ? formatTimeTo12Hour(selectedPatient.time) : 'N/A'}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">Doctor</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Dr. {selectedPatient.doctor?.name || 'N/A'}
                  </p>
                </div>
                {selectedPatient.reasonForVisit && (
                  <div className="col-span-2 bg-white dark:bg-gray-800 p-3 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">Reason for Visit</p>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedPatient.reasonForVisit}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PatientsViewPage;
