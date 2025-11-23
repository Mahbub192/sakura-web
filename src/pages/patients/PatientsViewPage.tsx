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
import { TokenAppointment } from '../../types';

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { clinics } = useAppSelector(state => state.clinics);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { doctors, currentDoctorProfile } = useAppSelector(state => state.doctors);
  
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | undefined>(undefined);
  const [selectedLocation, setSelectedLocation] = useState<number | ''>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<number | ''>('');
  const [filteredPatients, setFilteredPatients] = useState<TokenAppointment[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<TokenAppointment | null>(null);
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [showSidebar, setShowSidebar] = useState(false);

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
    }
  }, [isAssistant, currentDoctorProfile]);

  useEffect(() => {
    if (selectedLocation && selectedDate) {
      handleFilter();
    } else {
      setFilteredPatients([]);
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
      })).unwrap();
      
      setFilteredPatients(result);
    } catch (error: any) {
      console.error('Failed to fetch patients:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load patients';
      toast.error(errorMessage);
      setFilteredPatients([]);
    }
  };


  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  // Filter patients by search query, status, and location
  const searchedPatients = useMemo(() => {
    let filtered = filteredPatients;
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(patient => 
        patient.patientName?.toLowerCase().includes(query) ||
        patient.patientPhone?.includes(query) ||
        patient.patientEmail?.toLowerCase().includes(query) ||
        patient.tokenNumber?.toLowerCase().includes(query) ||
        patient.reasonForVisit?.toLowerCase().includes(query)
      );
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(patient => patient.status === statusFilter);
    }
    
    // Filter by location (already filtered in handleFilter via API call)
    
    return filtered;
  }, [filteredPatients, searchQuery, statusFilter, selectedLocation]);

  // Pagination
  const totalPages = Math.ceil(searchedPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPatients = searchedPatients.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, selectedLocation, filteredPatients.length]);

  const handleExport = () => {
    const csvContent = [
      ['Patient Name', 'ID', 'Last Visit', 'Diagnosis', 'Status', 'Phone', 'Email', 'Gender'].join(','),
      ...searchedPatients.map(patient => [
        patient.patientName || 'N/A',
        patient.tokenNumber || 'N/A',
        selectedDate ? format(new Date(selectedDate), 'MMM dd, yyyy') : 'N/A',
        patient.reasonForVisit || 'N/A',
        patient.status || 'N/A',
        patient.patientPhone || 'N/A',
        patient.patientEmail || 'N/A',
        patient.patientGender || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `patients_${selectedDate || 'all'}_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Patients data exported successfully');
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
    <div className="font-display bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 w-full min-h-screen">
      <div className="flex h-screen w-full">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-white dark:bg-gray-900">
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex flex-col gap-1">
                <h1 className="text-gray-900 dark:text-white text-3xl font-bold leading-tight">Patient History</h1>
                <p className="text-gray-500 dark:text-gray-400 text-base font-normal leading-normal">Search and manage patient records.</p>
              </div>
              <button 
                onClick={() => navigate('/patients')}
                className="flex items-center justify-center gap-2 rounded-lg h-11 px-5 bg-primary text-white text-sm font-bold leading-normal shadow-sm hover:bg-primary/90"
              >
                <span className="material-symbols-outlined">person_add</span>
                <span className="truncate">Add New Patient</span>
              </button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3">
                {/* Search Field - Smaller */}
                <div className="relative w-full sm:w-auto sm:min-w-[250px]">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                  <input 
                    className="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-background-light dark:bg-background-dark text-sm pl-9 pr-3 focus:border-primary focus:ring-primary/50 text-gray-900 dark:text-white"
                    placeholder="Search..." 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                {/* Status Filter */}
                <select 
                  className="rounded-lg border border-gray-200 dark:border-gray-700 bg-background-light dark:bg-background-dark text-sm focus:border-primary focus:ring-primary/50 h-10 px-3 text-gray-900 dark:text-white min-w-[120px]"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                
                {/* Location Filter */}
                <select 
                  className="rounded-lg border border-gray-200 dark:border-gray-700 bg-background-light dark:bg-background-dark text-sm focus:border-primary focus:ring-primary/50 h-10 px-3 text-gray-900 dark:text-white min-w-[150px]"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value ? Number(e.target.value) : '')}
                >
                  <option value="">All Locations</option>
                  {clinics.map((clinic) => (
                    <option key={clinic.id} value={clinic.id}>
                      {clinic.locationName}
                    </option>
                  ))}
                </select>
                
                {/* Date Filter */}
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 bg-background-light dark:bg-background-dark text-sm focus:border-primary focus:ring-primary/50 h-10 px-3 text-gray-900 dark:text-white min-w-[150px]"
                />
                
                {/* Export Button */}
                <button 
                  onClick={handleExport}
                  disabled={searchedPatients.length === 0}
                  className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-lg">download</span>
                  <span className="hidden sm:inline">Export</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-background-light dark:bg-background-dark dark:text-gray-300">
                    <tr>
                      <th className="px-6 py-3" scope="col">Patient</th>
                      <th className="px-6 py-3" scope="col">Last Visit</th>
                      <th className="px-6 py-3" scope="col">Diagnosis</th>
                      <th className="px-6 py-3" scope="col">Status</th>
                      <th className="px-6 py-3" scope="col"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center">
                          <LoadingSpinner size="md" />
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">Loading patients...</p>
                        </td>
                      </tr>
                    ) : paginatedPatients.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center">
                          <span className="material-symbols-outlined text-5xl text-gray-400 dark:text-gray-500 mb-3 block">person_off</span>
                          <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-1">No patients found</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {selectedLocation && selectedDate 
                              ? 'No patients scheduled for the selected location and date'
                              : 'Please select location and date to view patients'
                            }
                          </p>
                        </td>
                      </tr>
                    ) : (
                      paginatedPatients.map((patient) => (
                        <tr 
                          key={patient.id}
                          className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                          onClick={() => {
                            setSelectedPatient(patient);
                            setShowSidebar(true);
                          }}
                        >
                          <th className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white" scope="row">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                                {patient.patientName?.charAt(0).toUpperCase() || '?'}
                              </div>
                              <div>
                                <p className="font-semibold">{patient.patientName || 'Unknown'}</p>
                                <p className="font-normal text-gray-500 dark:text-gray-400 text-xs">ID: {patient.tokenNumber || 'N/A'}</p>
                              </div>
                            </div>
                          </th>
                          <td className="px-6 py-4">{selectedDate ? format(new Date(selectedDate), 'MMM dd, yyyy') : 'N/A'}</td>
                          <td className="px-6 py-4">{patient.reasonForVisit || 'N/A'}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(patient.status)}`}>
                              {patient.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPatient(patient);
                                setShowSidebar(true);
                              }}
                              className="font-medium text-primary dark:text-primary hover:underline"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              {searchedPatients.length > 0 && (
                <nav aria-label="Table navigation" className="flex items-center justify-between p-4">
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    Showing <span className="font-semibold text-gray-900 dark:text-white">{startIndex + 1}-{Math.min(endIndex, searchedPatients.length)}</span> of <span className="font-semibold text-gray-900 dark:text-white">{searchedPatients.length}</span>
                  </span>
                  <ul className="inline-flex items-center -space-x-px">
                    <li>
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-3 h-8 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                    </li>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <li key={pageNum}>
                          <button
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 h-8 leading-tight ${
                              currentPage === pageNum
                                ? 'z-10 text-primary border border-primary bg-primary/10 hover:bg-primary/20 dark:border-gray-700 dark:bg-gray-700 dark:text-white'
                                : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
                            }`}
                          >
                            {pageNum}
                          </button>
                        </li>
                      );
                    })}
                    <li>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </div>
          </div>
        </main>

        {/* Right Sidebar - Patient Details */}
        {selectedPatient && (
          <aside className={`w-96 flex-col border-l border-gray-200 dark:border-gray-800 bg-background-light dark:bg-background-dark p-6 ${showSidebar ? 'flex' : 'hidden'} xl:flex overflow-y-auto`}>
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Patient Details</h3>
                <button 
                  onClick={() => {
                    setShowSidebar(false);
                    setSelectedPatient(null);
                  }}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white xl:hidden"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="flex flex-col gap-4 p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
                    {selectedPatient.patientName?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">{selectedPatient.patientName || 'Unknown'}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      DOB: {selectedPatient.patientAge ? `${selectedPatient.patientAge} yrs` : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h5 className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-2">Contact Information</h5>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">Phone:</span> {selectedPatient.patientPhone || 'N/A'}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">Email:</span> {selectedPatient.patientEmail || 'N/A'}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">Gender:</span> {selectedPatient.patientGender || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h5 className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-2">Appointment Details</h5>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">Token:</span> #{selectedPatient.tokenNumber}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">Date:</span> {selectedDate ? format(new Date(selectedDate), 'MMM dd, yyyy') : 'N/A'}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">Time:</span> {formatTimeTo12Hour(selectedPatient.time || '')}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">Status:</span>{' '}
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(selectedPatient.status)}`}>
                        {selectedPatient.status}
                      </span>
                    </p>
                    {selectedPatient.reasonForVisit && (
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-semibold">Reason:</span> {selectedPatient.reasonForVisit}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => navigate(`/patients/live?location=${selectedLocation}&date=${selectedDate}&doctor=${selectedDoctorFilter}&patientId=${selectedPatient.id}`)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold hover:bg-primary/90"
                  >
                    <span className="material-symbols-outlined text-base">edit</span>
                    <span>View Chart</span>
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedPatient(selectedPatient);
                      setShowPatientDetails(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary/20 dark:bg-primary/30 text-primary dark:text-primary text-sm font-bold hover:bg-primary/30 dark:hover:bg-primary/40"
                  >
                    <span className="material-symbols-outlined text-base">note_add</span>
                    <span>Add Note</span>
                  </button>
                </div>
              </div>
            </div>
          </aside>
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
