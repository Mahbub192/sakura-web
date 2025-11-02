import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  UsersIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  ClockIcon,
  EnvelopeIcon,
  PhoneIcon,
  FunnelIcon,
  DocumentTextIcon,
  SparklesIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  UserCircleIcon,
  CalendarIcon,
  MapPinIcon,
  HeartIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useAuth } from '../../hooks/useAuth';
import { 
  fetchTokenAppointments,
  updateTokenAppointmentStatus,
} from '../../store/slices/appointmentSlice';
import { fetchMyAppointments, cancelAppointment } from '../../store/slices/patientSlice';
import { fetchClinics } from '../../store/slices/clinicSlice';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import PatientCard from '../../components/patients/PatientCard';
import AppointmentHistoryCard from '../../components/patients/AppointmentHistoryCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';
import { TokenAppointment, Clinic, Doctor } from '../../types';

const PatientsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAdmin, isDoctor, isAssistant, isPatient } = useAuth();
  const { tokenAppointments, isLoading } = useAppSelector(state => state.appointments);
  const { myAppointments, isLoading: patientsLoading } = useAppSelector(state => state.patients);
  const { clinics } = useAppSelector(state => state.clinics);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState<number | ''>('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [tokenSearch, setTokenSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  useEffect(() => {
    fetchData();
    dispatch(fetchClinics());
  }, [dispatch, isAdmin, isDoctor, isAssistant, isPatient]);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      if (isAdmin || isDoctor || isAssistant) {
        if (locationFilter && dateFilter) {
          const result = await dispatch(fetchTokenAppointments({ 
            clinicId: Number(locationFilter), 
            date: dateFilter 
          })).unwrap();
          // Set the first doctor from the filtered results
          if (result.length > 0 && result[0].doctor) {
            setSelectedDoctor(result[0].doctor);
          } else {
            setSelectedDoctor(null);
          }
        } else {
          await dispatch(fetchTokenAppointments()).unwrap();
        }
      } else if (isPatient) {
        await dispatch(fetchMyAppointments()).unwrap();
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load appointments');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (locationFilter && dateFilter && (isAdmin || isDoctor || isAssistant)) {
      fetchData();
    }
  }, [locationFilter, dateFilter]);

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      await dispatch(updateTokenAppointmentStatus({ id, status: newStatus }));
      toast.success('Patient status updated successfully');
    } catch (error) {
      toast.error('Failed to update patient status');
    }
  };

  const handleTokenSearch = async () => {
    if (tokenSearch.trim()) {
      // Search through appointments using token number
      const appointment = tokenAppointments.find(apt => 
        apt.tokenNumber.toLowerCase().includes(tokenSearch.trim().toLowerCase())
      );
      if (appointment) {
        setSelectedPatient(appointment);
        setShowPatientDetails(true);
      } else {
        toast.error('Appointment not found');
      }
    }
  };

  const filteredAppointments = tokenAppointments.filter(appointment => {
    const matchesSearch = 
      appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.patientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.patientPhone.includes(searchTerm) ||
      appointment.tokenNumber.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || appointment.status.toLowerCase() === statusFilter.toLowerCase();
    
    const matchesDate = !dateFilter || appointment.date === dateFilter;
    
    const matchesLocation = !locationFilter || appointment.appointment?.clinicId === Number(locationFilter);
    
    return matchesSearch && matchesStatus && matchesDate && matchesLocation;
  });

  const selectedClinic = clinics.find(c => c.id === Number(locationFilter));

  // Group patients by unique email for patient statistics
  const uniquePatients = tokenAppointments.reduce((acc, appointment) => {
    const email = appointment.patientEmail;
    if (!acc[email]) {
      acc[email] = {
        name: appointment.patientName,
        email: appointment.patientEmail,
        phone: appointment.patientPhone,
        appointments: [],
      };
    }
    acc[email].appointments.push(appointment);
    return acc;
  }, {} as Record<string, any>);

  const stats = [
    {
      title: 'Total Patients',
      value: Object.keys(uniquePatients).length,
      icon: UsersIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Appointments',
      value: tokenAppointments.length,
      icon: CalendarDaysIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Upcoming',
      value: tokenAppointments.filter(apt => 
        new Date(apt.date) >= new Date() && 
        ['Confirmed', 'Pending'].includes(apt.status)
      ).length,
      icon: ClockIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Completed',
      value: tokenAppointments.filter(apt => apt.status === 'Completed').length,
      icon: DocumentTextIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-8"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 rounded-2xl p-8 text-white shadow-xl"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <SparklesIcon className="h-8 w-8" />
              <h1 className="text-4xl font-bold">
                {isPatient ? 'My Appointments' : 'Patient Management'}
              </h1>
            </div>
            <p className="text-xl text-primary-100">
              {isPatient 
                ? 'View and manage your appointment history' 
                : 'Manage patient appointments and medical records'
              }
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="hidden md:flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
          >
            {refreshing ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <ClockIcon className="h-5 w-5" />
                Refresh
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      {!isPatient && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.03, y: -4 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-4 rounded-xl`}>
                  <stat.icon className={`h-7 w-7 ${stat.color}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Token Search */}
      {/* {!isPatient && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <MagnifyingGlassIcon className="h-6 w-6 text-primary-600" />
            <h3 className="text-xl font-bold text-gray-900">Find Appointment by Token</h3>
          </div>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Enter token number..."
                value={tokenSearch}
                onChange={(e) => setTokenSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleTokenSearch()}
                className="pl-10 flex-1 input-field"
              />
            </div>
            <Button
              variant="primary"
              onClick={handleTokenSearch}
              disabled={!tokenSearch.trim()}
              className="px-6"
            >
              <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
              Search
            </Button>
          </div>
        </motion.div>
      )} */}

      {/* Filters */}
      {!isPatient && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <FunnelIcon className="h-6 w-6 text-primary-600" />
            <h3 className="text-xl font-bold text-gray-900">Filters & Search</h3>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, phone, or token..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 input-field"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-4 flex-wrap">
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value ? Number(e.target.value) : '')}
                  className="pl-10 input-field min-w-[180px] appearance-none bg-white pr-8"
                >
                  <option value="">All Locations</option>
                  {clinics.map((clinic) => (
                    <option key={clinic.id} value={clinic.id}>
                      {clinic.locationName} - {clinic.city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="pl-10 input-field"
                />
              </div>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input-field min-w-[140px] appearance-none bg-white pr-8"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no show">No Show</option>
                </select>
              </div>

              {(statusFilter !== 'all' || dateFilter || locationFilter) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setStatusFilter('all');
                    setDateFilter('');
                    setLocationFilter('');
                  }}
                  className="px-4"
                >
                  <XCircleIcon className="h-5 w-5 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Content */}
      {isPatient ? (
        /* Patient View - My Appointments */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100"
        >
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-secondary-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CalendarDaysIcon className="h-6 w-6 text-primary-600" />
                <h2 className="text-xl font-bold text-gray-900">My Appointment History</h2>
              </div>
              <Button
                variant="primary"
                onClick={() => navigate('/patients/book')}
                className="flex items-center gap-2"
              >
                <CalendarIcon className="h-5 w-5" />
                Book New Appointment
              </Button>
            </div>
          </div>
          <div className="p-6">
            {patientsLoading ? (
              <div className="text-center py-12">
                <LoadingSpinner size="lg" />
                <p className="text-gray-600 mt-4">Loading your appointments...</p>
              </div>
            ) : myAppointments.length === 0 ? (
              <div className="text-center py-12">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-primary-50 rounded-full mb-6"
                >
                  <CalendarDaysIcon className="h-10 w-10 text-primary-600" />
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No appointments yet</h3>
                <p className="text-gray-600 mb-6">Start by booking your first appointment</p>
                <Button
                  variant="primary"
                  onClick={() => navigate('/patients/book')}
                  className="flex items-center gap-2 mx-auto"
                >
                  <CalendarIcon className="h-5 w-5" />
                  Book Your First Appointment
                  <ArrowRightIcon className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {myAppointments.map((appointment, index) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <AppointmentHistoryCard
                      appointment={appointment}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      ) : (
        /* Staff View - Patient Management */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100"
        >
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-secondary-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UsersIcon className="h-6 w-6 text-primary-600" />
                <h2 className="text-xl font-bold text-gray-900">
                  Patient Appointments
                  <span className="ml-3 text-lg font-semibold text-primary-600">
                    ({filteredAppointments.length})
                  </span>
                </h2>
              </div>
            </div>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <LoadingSpinner size="lg" />
                <p className="text-gray-600 mt-4">Loading patients...</p>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-12">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6"
                >
                  <UsersIcon className="h-10 w-10 text-gray-400" />
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No patients found</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'all' || dateFilter
                    ? 'Try adjusting your filters'
                    : 'No appointments available'
                  }
                </p>
                {(searchTerm || statusFilter !== 'all' || dateFilter) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setDateFilter('');
                    }}
                    className="mt-4"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredAppointments.map((appointment, index) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <PatientCard
                      appointment={appointment}
                      onStatusUpdate={handleStatusUpdate}
                      onViewDetails={(appointment) => {
                        setSelectedPatient(appointment);
                        setShowPatientDetails(true);
                      }}
                      userRole={user?.role || 'User'}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Patient Details Modal */}
      <Modal
        isOpen={showPatientDetails}
        onClose={() => {
          setShowPatientDetails(false);
          setSelectedPatient(null);
        }}
        title="Patient Details"
        size="lg"
      >
        {selectedPatient && (
          <div className="space-y-6">
            {/* Patient Info */}
            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 p-6 rounded-xl border border-primary-100">
              <div className="flex items-center gap-3 mb-4">
                <UserCircleIcon className="h-6 w-6 text-primary-600" />
                <h3 className="text-xl font-bold text-gray-900">Patient Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-1">Name</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedPatient.patientName}</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-1">Age</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedPatient.patientAge} years</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-1">Gender</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedPatient.patientGender}</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-1">Phone</p>
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="h-4 w-4 text-gray-400" />
                    <p className="text-lg font-semibold text-gray-900">{selectedPatient.patientPhone}</p>
                  </div>
                </div>
                <div className="md:col-span-2 bg-white p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                  <div className="flex items-center gap-2">
                    <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                    <p className="text-lg font-semibold text-gray-900">{selectedPatient.patientEmail}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-100">
              <div className="flex items-center gap-3 mb-4">
                <CalendarDaysIcon className="h-6 w-6 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Appointment Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-1">Token Number</p>
                  <p className="text-lg font-bold text-primary-600">{selectedPatient.tokenNumber}</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedPatient.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                    selectedPatient.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    selectedPatient.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedPatient.status === 'Confirmed' && <CheckCircleIcon className="h-4 w-4 mr-1" />}
                    {selectedPatient.status === 'Pending' && <ClockIcon className="h-4 w-4 mr-1" />}
                    {selectedPatient.status === 'Cancelled' && <XCircleIcon className="h-4 w-4 mr-1" />}
                    {selectedPatient.status === 'Completed' && <CheckCircleIcon className="h-4 w-4 mr-1" />}
                    {selectedPatient.status}
                  </span>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-1">Date & Time</p>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <p className="text-lg font-semibold text-gray-900">
                      {format(new Date(selectedPatient.date), 'MMM dd, yyyy')} at {selectedPatient.time}
                    </p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-1">Doctor</p>
                  <p className="text-lg font-semibold text-gray-900">Dr. {selectedPatient.doctor?.name || 'N/A'}</p>
                </div>
                <div className="md:col-span-2 bg-white p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-1">Reason for Visit</p>
                  <p className="text-base font-medium text-gray-900">{selectedPatient.reasonForVisit || 'Not specified'}</p>
                </div>
                {selectedPatient.notes && (
                  <div className="md:col-span-2 bg-white p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500 mb-1">Notes</p>
                    <p className="text-base text-gray-700">{selectedPatient.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Status Update */}
            {(isAdmin || isDoctor || isAssistant) && (
              <div className="flex justify-end">
                <select
                  value={selectedPatient.status}
                  onChange={(e) => {
                    handleStatusUpdate(selectedPatient.id, e.target.value);
                    setSelectedPatient({ ...selectedPatient, status: e.target.value });
                  }}
                  className="input-field"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="No Show">No Show</option>
                </select>
              </div>
            )}
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default PatientsPage;