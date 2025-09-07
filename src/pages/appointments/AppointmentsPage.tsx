import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  CalendarIcon, 
  ClockIcon, 
  PlusIcon,
  UserGroupIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useAuth } from '../../hooks/useAuth';
import { 
  fetchAppointments, 
  fetchAvailableSlots, 
  fetchTokenAppointments,
  updateAppointmentStatus,
  updateTokenAppointmentStatus,
} from '../../store/slices/appointmentSlice';
import { fetchDoctors } from '../../store/slices/doctorSlice';
import { fetchClinics } from '../../store/slices/clinicSlice';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Calendar from '../../components/ui/Calendar';
import CreateAppointmentForm from '../../components/forms/CreateAppointmentForm';
import AppointmentCard from '../../components/appointments/AppointmentCard';
import AppointmentFilters from '../../components/appointments/AppointmentFilters';
import { toast } from 'react-toastify';

const AppointmentsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isAdmin, isDoctor, isAssistant } = useAuth();
  const { appointments, availableSlots, tokenAppointments, isLoading } = useAppSelector(state => state.appointments);
  const { doctors } = useAppSelector(state => state.doctors);
  const { clinics } = useAppSelector(state => state.clinics);
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCalendarView, setShowCalendarView] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [doctorFilter, setDoctorFilter] = useState('all');

  useEffect(() => {
    // Fetch initial data
    dispatch(fetchAppointments());
    dispatch(fetchAvailableSlots());
    dispatch(fetchTokenAppointments());
    dispatch(fetchDoctors());
    dispatch(fetchClinics());
  }, [dispatch]);

  const handleStatusUpdate = async (id: number, newStatus: string, isTokenAppointment = false) => {
    try {
      if (isTokenAppointment) {
        await dispatch(updateTokenAppointmentStatus({ id, status: newStatus }));
        toast.success('Booking status updated successfully');
      } else {
        await dispatch(updateAppointmentStatus({ id, status: newStatus }));
        toast.success('Appointment status updated successfully');
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.clinic.locationName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || apt.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesDoctor = doctorFilter === 'all' || apt.doctorId.toString() === doctorFilter;
    return matchesSearch && matchesStatus && matchesDoctor;
  });

  const filteredTokenAppointments = tokenAppointments.filter(apt => {
    const matchesSearch = apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.doctor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || apt.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesDoctor = doctorFilter === 'all' || apt.doctorId.toString() === doctorFilter;
    return matchesSearch && matchesStatus && matchesDoctor;
  });

  const calendarAppointments = appointments.map(apt => ({
    date: apt.date,
    count: tokenAppointments.filter(ta => ta.date === apt.date).length,
    status: apt.currentBookings >= apt.maxPatients ? 'full' as const : 
            apt.currentBookings > 0 ? 'booked' as const : 'available' as const,
  }));

  const stats = [
    {
      title: 'Total Appointments',
      value: appointments.length,
      icon: CalendarIcon,
      color: 'bg-primary-600',
    },
    {
      title: 'Available Slots',
      value: appointments.filter(apt => apt.status === 'Available').length,
      icon: ClockIcon,
      color: 'bg-success-600',
    },
    {
      title: 'Patient Bookings',
      value: tokenAppointments.length,
      icon: UserGroupIcon,
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
          <h1 className="text-2xl font-bold text-gray-900">Appointments Management</h1>
          <p className="text-gray-600 mt-1">Manage appointment slots and patient bookings</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button
            variant={showCalendarView ? 'primary' : 'outline'}
            onClick={() => setShowCalendarView(!showCalendarView)}
            icon={<CalendarIcon className="h-4 w-4" />}
          >
            Calendar View
          </Button>
          {(isAdmin || isDoctor) && (
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
              icon={<PlusIcon className="h-4 w-4" />}
            >
              Create Appointment Slot
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search appointments..."
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
              <option value="available">Available</option>
              <option value="booked">Booked</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="input-field min-w-[140px]"
            >
              <option value="all">All Doctors</option>
              {doctors.map(doctor => (
                <option key={doctor.id} value={doctor.id}>
                  Dr. {doctor.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      {showCalendarView && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              appointments={calendarAppointments}
            />
          </div>
          <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {format(selectedDate, 'MMMM d, yyyy')}
            </h3>
            <div className="space-y-3">
              {appointments
                .filter(apt => apt.date === format(selectedDate, 'yyyy-MM-dd'))
                .map(apt => (
                  <div key={apt.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-900">Dr. {apt.doctor.name}</div>
                    <div className="text-sm text-gray-600">{apt.startTime} - {apt.endTime}</div>
                    <div className="text-sm text-gray-600">{apt.clinic.locationName}</div>
                    <div className="mt-2">
                      <span className={`badge ${
                        apt.status === 'Available' ? 'badge-success' :
                        apt.status === 'Booked' ? 'badge-warning' :
                        'badge-error'
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Appointment Slots */}
      {!showCalendarView && (
        <div className="bg-white rounded-xl shadow-soft border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Appointment Slots</h2>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading appointments...</p>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No appointment slots found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAppointments.map(appointment => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onStatusUpdate={handleStatusUpdate}
                    userRole={user?.role || 'User'}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Patient Bookings */}
      {!showCalendarView && (
        <div className="bg-white rounded-xl shadow-soft border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Patient Bookings</h2>
          </div>
          <div className="p-6">
            {filteredTokenAppointments.length === 0 ? (
              <div className="text-center py-8">
                <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No patient bookings found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTokenAppointments.map(booking => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h3 className="font-semibold text-gray-900">{booking.patientName}</h3>
                            <p className="text-sm text-gray-600">{booking.patientEmail}</p>
                          </div>
                          <div className="text-sm text-gray-600">
                            <p>Token: <span className="font-medium">{booking.tokenNumber}</span></p>
                            <p>{format(new Date(booking.date), 'MMM dd, yyyy')} at {booking.time}</p>
                          </div>
                          <div className="text-sm text-gray-600">
                            <p>Dr. {booking.doctor.name}</p>
                            <p>{booking.reasonForVisit}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`badge ${
                          booking.status === 'Confirmed' ? 'badge-success' :
                          booking.status === 'Pending' ? 'badge-warning' :
                          booking.status === 'Completed' ? 'badge-primary' :
                          'badge-error'
                        }`}>
                          {booking.status}
                        </span>
                        {(isAdmin || isDoctor || isAssistant) && (
                          <select
                            value={booking.status}
                            onChange={(e) => handleStatusUpdate(booking.id, e.target.value, true)}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="No Show">No Show</option>
                          </select>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Appointment Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Appointment Slot"
        size="lg"
      >
        <CreateAppointmentForm
          onSuccess={() => {
            setShowCreateModal(false);
            dispatch(fetchAppointments());
            toast.success('Appointment slot created successfully');
          }}
          doctors={doctors}
          clinics={clinics}
        />
      </Modal>
    </motion.div>
  );
};

export default AppointmentsPage;