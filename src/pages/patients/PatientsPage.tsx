import React, { useState, useEffect } from 'react';
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
} from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useAuth } from '../../hooks/useAuth';
import { 
  fetchTokenAppointments,
  updateTokenAppointmentStatus,
} from '../../store/slices/appointmentSlice';
import { fetchMyAppointments, fetchAppointmentByToken } from '../../store/slices/patientSlice';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import PatientCard from '../../components/patients/PatientCard';
import AppointmentHistoryCard from '../../components/patients/AppointmentHistoryCard';
import { toast } from 'react-toastify';

const PatientsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isAdmin, isDoctor, isAssistant, isPatient } = useAuth();
  const { tokenAppointments, isLoading } = useAppSelector(state => state.appointments);
  const { myAppointments } = useAppSelector(state => state.patients);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [tokenSearch, setTokenSearch] = useState('');

  useEffect(() => {
    if (isAdmin || isDoctor || isAssistant) {
      dispatch(fetchTokenAppointments());
    }
    if (isPatient && user?.email) {
      dispatch(fetchMyAppointments(user.email));
    }
  }, [dispatch, isAdmin, isDoctor, isAssistant, isPatient, user?.email]);

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
      try {
        const result = await dispatch(fetchAppointmentByToken(tokenSearch.trim()));
        if (fetchAppointmentByToken.fulfilled.match(result)) {
          setSelectedPatient(result.payload);
          setShowPatientDetails(true);
        }
      } catch (error) {
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
    
    return matchesSearch && matchesStatus && matchesDate;
  });

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
      color: 'bg-primary-600',
    },
    {
      title: 'Total Appointments',
      value: tokenAppointments.length,
      icon: CalendarDaysIcon,
      color: 'bg-success-600',
    },
    {
      title: 'Upcoming',
      value: tokenAppointments.filter(apt => 
        new Date(apt.date) >= new Date() && 
        ['Confirmed', 'Pending'].includes(apt.status)
      ).length,
      icon: ClockIcon,
      color: 'bg-warning-600',
    },
    {
      title: 'Completed',
      value: tokenAppointments.filter(apt => apt.status === 'Completed').length,
      icon: DocumentTextIcon,
      color: 'bg-secondary-600',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isPatient ? 'My Appointments' : 'Patient Management'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isPatient 
              ? 'View and manage your appointment history' 
              : 'Manage patient appointments and medical records'
            }
          </p>
        </div>
      </div>

      {/* Stats */}
      {!isPatient && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-soft p-6 border border-gray-200"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Token Search */}
      {!isPatient && (
        <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Find Appointment by Token</h3>
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="Enter token number..."
              value={tokenSearch}
              onChange={(e) => setTokenSearch(e.target.value)}
              className="flex-1 input-field"
            />
            <Button
              variant="primary"
              onClick={handleTokenSearch}
              disabled={!tokenSearch.trim()}
            >
              Search
            </Button>
          </div>
        </div>
      )}

      {/* Filters */}
      {!isPatient && (
        <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 input-field"
              />
            </div>

            {/* Filters */}
            <div className="flex space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field min-w-[120px]"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no show">No Show</option>
              </select>

              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {isPatient ? (
        /* Patient View - My Appointments */
        <div className="bg-white rounded-xl shadow-soft border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">My Appointment History</h2>
          </div>
          <div className="p-6">
            {myAppointments.length === 0 ? (
              <div className="text-center py-8">
                <CalendarDaysIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No appointments found</p>
                <Button
                  variant="primary"
                  onClick={() => window.open('/book-appointment', '_blank')}
                  className="mt-4"
                >
                  Book Your First Appointment
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {myAppointments.map(appointment => (
                  <AppointmentHistoryCard
                    key={appointment.id}
                    appointment={appointment}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Staff View - Patient Management */
        <div className="bg-white rounded-xl shadow-soft border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Patient Appointments ({filteredAppointments.length})
            </h2>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading patients...</p>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-8">
                <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No patients found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredAppointments.map(appointment => (
                  <PatientCard
                    key={appointment.id}
                    appointment={appointment}
                    onStatusUpdate={handleStatusUpdate}
                    onViewDetails={(appointment) => {
                      setSelectedPatient(appointment);
                      setShowPatientDetails(true);
                    }}
                    userRole={user?.role || 'User'}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
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
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Patient Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium text-gray-900">{selectedPatient.patientName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Age</p>
                  <p className="font-medium text-gray-900">{selectedPatient.patientAge} years</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Gender</p>
                  <p className="font-medium text-gray-900">{selectedPatient.patientGender}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900">{selectedPatient.patientPhone}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{selectedPatient.patientEmail}</p>
                </div>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Appointment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Token Number</p>
                  <p className="font-medium text-gray-900">{selectedPatient.tokenNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`badge ${
                    selectedPatient.status === 'Confirmed' ? 'badge-success' :
                    selectedPatient.status === 'Pending' ? 'badge-warning' :
                    selectedPatient.status === 'Completed' ? 'badge-primary' :
                    'badge-error'
                  }`}>
                    {selectedPatient.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date & Time</p>
                  <p className="font-medium text-gray-900">
                    {format(new Date(selectedPatient.date), 'MMM dd, yyyy')} at {selectedPatient.time}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Doctor</p>
                  <p className="font-medium text-gray-900">Dr. {selectedPatient.doctor.name}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Reason for Visit</p>
                  <p className="font-medium text-gray-900">{selectedPatient.reasonForVisit}</p>
                </div>
                {selectedPatient.notes && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Notes</p>
                    <p className="font-medium text-gray-900">{selectedPatient.notes}</p>
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