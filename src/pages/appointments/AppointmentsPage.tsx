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
  MapPinIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowDownTrayIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useAuth } from '../../hooks/useAuth';
import { 
  fetchAppointments, 
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
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';

const AppointmentsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isAdmin, isDoctor, isAssistant } = useAuth();
  const { appointments, tokenAppointments, isLoading } = useAppSelector(state => state.appointments);
  const { doctors } = useAppSelector(state => state.doctors);
  const { clinics } = useAppSelector(state => state.clinics);
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCalendarView, setShowCalendarView] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState<number | ''>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'slots' | 'bookings'>('slots');

  useEffect(() => {
    // Fetch initial data
    fetchAllData();
  }, [dispatch]);

  const fetchAllData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        dispatch(fetchAppointments()),
        dispatch(fetchTokenAppointments()),
        dispatch(fetchDoctors()),
        dispatch(fetchClinics()),
      ]);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setRefreshing(false);
    }
  };

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
    const matchesLocation = !locationFilter || apt.clinicId === Number(locationFilter);
    const matchesDate = !dateFilter || apt.date === dateFilter;
    return matchesSearch && matchesStatus && matchesDoctor && matchesLocation && matchesDate;
  });

  const filteredTokenAppointments = tokenAppointments.filter(apt => {
    const matchesSearch = apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.patientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.patientPhone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || apt.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesDoctor = doctorFilter === 'all' || apt.doctorId.toString() === doctorFilter;
    const matchesLocation = !locationFilter || apt.appointment?.clinicId === Number(locationFilter);
    const matchesDate = !dateFilter || apt.date === dateFilter;
    return matchesSearch && matchesStatus && matchesDoctor && matchesLocation && matchesDate;
  });

  const calendarAppointments = appointments.map(apt => ({
    date: apt.date,
    count: tokenAppointments.filter(ta => ta.date === apt.date).length,
    status: apt.currentBookings >= apt.maxPatients ? 'full' as const : 
            apt.currentBookings > 0 ? 'booked' as const : 'available' as const,
  }));

  const totalBooked = tokenAppointments.filter(apt => 
    ['Confirmed', 'Pending'].includes(apt.status)
  ).length;
  const todayAppointments = appointments.filter(apt => apt.date === format(new Date(), 'yyyy-MM-dd')).length;
  const upcomingAppointments = appointments.filter(apt => new Date(apt.date) >= new Date()).length;

  const stats = [
    {
      title: 'Total Appointments',
      value: appointments.length,
      icon: CalendarIcon,
      color: 'from-primary-600 to-primary-700',
      bg: 'bg-primary-50',
      textColor: 'text-primary-600',
      subtitle: `${upcomingAppointments} upcoming`,
    },
    {
      title: 'Available Slots',
      value: appointments.filter(apt => apt.status === 'Available').length,
      icon: ClockIcon,
      color: 'from-success-600 to-success-700',
      bg: 'bg-success-50',
      textColor: 'text-success-600',
      subtitle: 'Open for booking',
    },
    {
      title: 'Patient Bookings',
      value: tokenAppointments.length,
      icon: UserGroupIcon,
      color: 'from-secondary-600 to-secondary-700',
      bg: 'bg-secondary-50',
      textColor: 'text-secondary-600',
      subtitle: `${totalBooked} confirmed`,
    },
    {
      title: 'Today\'s Appointments',
      value: todayAppointments,
      icon: CheckCircleIcon,
      color: 'from-purple-600 to-purple-700',
      bg: 'bg-purple-50',
      textColor: 'text-purple-600',
      subtitle: format(new Date(), 'MMM dd'),
    },
  ];

  const handleExport = () => {
    const data = viewMode === 'slots' ? filteredAppointments : filteredTokenAppointments;
    const csvContent = [
      ['Type', viewMode === 'slots' ? 'Doctor,Date,Time,Status,Location' : 'Patient,Email,Phone,Date,Time,Token,Status,Doctor'],
      ...data.map(item => {
        if (viewMode === 'slots') {
          const apt = item as any;
          return [`Slot`, `${apt.doctor.name},${apt.date},${apt.startTime}-${apt.endTime},${apt.status},${apt.clinic.locationName}`];
        } else {
          const booking = item as any;
          return [`Booking`, `${booking.patientName},${booking.patientEmail},${booking.patientPhone},${booking.date},${booking.time},${booking.tokenNumber},${booking.status},${booking.doctor.name}`];
        }
      }),
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `appointments-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    toast.success('Data exported successfully');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Enhanced Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 rounded-2xl p-8 text-white shadow-xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <SparklesIcon className="h-8 w-8" />
                <h1 className="text-4xl font-bold">Appointments Management</h1>
              </div>
              <p className="text-xl text-primary-100">Manage appointment slots and patient bookings efficiently</p>
            </div>
            <div className="mt-6 sm:mt-0 flex flex-wrap gap-3">
              <button
                onClick={fetchAllData}
                disabled={refreshing}
                className="flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
              >
                {refreshing ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <ArrowPathIcon className="h-5 w-5" />
                )}
                Refresh
              </button>
              <Button
                variant={showCalendarView ? 'primary' : 'outline'}
                onClick={() => setShowCalendarView(!showCalendarView)}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 border-white/30 text-white"
              >
                <CalendarIcon className="h-5 w-5 mr-2" />
                Calendar View
              </Button>
              {(isAdmin || isDoctor) && (
                <Button
                  variant="primary"
                  onClick={() => setShowCreateModal(true)}
                  className="bg-white text-primary-600 hover:bg-gray-50"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create Slot
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.03, y: -4 }}
              className="group relative bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Gradient Background */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-5 rounded-full -mr-16 -mt-16`}></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                    <stat.icon className="h-7 w-7 text-white" />
                  </div>
                  <div className={`${stat.bg} px-3 py-1 rounded-full`}>
                    <span className={`text-xs font-semibold ${stat.textColor}`}>
                      {stat.subtitle}
                    </span>
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <FunnelIcon className="h-6 w-6 text-primary-600" />
            <h3 className="text-xl font-bold text-gray-900">Filters & Search</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 input-field"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="booked">Booked</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              {viewMode === 'bookings' && (
                <>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="no show">No Show</option>
                </>
              )}
            </select>

            {/* Doctor Filter */}
            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Doctors</option>
              {doctors.map(doctor => (
                <option key={doctor.id} value={doctor.id}>
                  Dr. {doctor.name}
                </option>
              ))}
            </select>

            {/* Location Filter */}
            <div className="relative">
              <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value ? Number(e.target.value) : '')}
                className="pl-10 input-field appearance-none bg-white pr-8"
              >
                <option value="">All Locations</option>
                {clinics.map(clinic => (
                  <option key={clinic.id} value={clinic.id}>
                    {clinic.locationName} - {clinic.city}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-10 input-field"
              />
            </div>

            {/* Clear Filters */}
            {(statusFilter !== 'all' || doctorFilter !== 'all' || locationFilter || dateFilter || searchTerm) && (
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setDoctorFilter('all');
                  setLocationFilter('');
                  setDateFilter('');
                  setSearchTerm('');
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
              >
                <XCircleIcon className="h-5 w-5" />
                Clear All
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('slots')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode === 'slots'
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <CalendarIcon className="h-5 w-5 inline mr-2" />
                Appointment Slots
              </button>
              <button
                onClick={() => setViewMode('bookings')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode === 'bookings'
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <UserGroupIcon className="h-5 w-5 inline mr-2" />
                Patient Bookings
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                title="Export to CSV"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Calendar View */}
        {showCalendarView && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <Calendar
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                appointments={calendarAppointments}
              />
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {format(selectedDate, 'MMMM d, yyyy')}
                </h3>
                <p className="text-sm text-gray-600">
                  {appointments.filter(apt => apt.date === format(selectedDate, 'yyyy-MM-dd')).length} appointments scheduled
                </p>
              </div>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {appointments
                  .filter(apt => apt.date === format(selectedDate, 'yyyy-MM-dd'))
                  .map(apt => (
                    <motion.div
                      key={apt.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">Dr. {apt.doctor.name}</div>
                          <div className="text-sm text-gray-600 mt-1">{apt.doctor.specialization}</div>
                        </div>
                        <span className={`badge ${
                          apt.status === 'Available' ? 'badge-success' :
                          apt.status === 'Booked' ? 'badge-warning' :
                          'badge-error'
                        }`}>
                          {apt.status}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <ClockIcon className="h-4 w-4" />
                          <span>{apt.startTime} - {apt.endTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPinIcon className="h-4 w-4" />
                          <span>{apt.clinic.locationName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <UserGroupIcon className="h-4 w-4" />
                          <span>{apt.currentBookings}/{apt.maxPatients} patients</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                {appointments.filter(apt => apt.date === format(selectedDate, 'yyyy-MM-dd')).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No appointments on this date</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Appointment Slots */}
        {!showCalendarView && viewMode === 'slots' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-secondary-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-6 w-6 text-primary-600" />
                  <h2 className="text-xl font-bold text-gray-900">
                    Appointment Slots
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
                  <p className="text-gray-600 mt-4">Loading appointments...</p>
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No appointment slots found</h3>
                  <p className="text-gray-600">
                    {searchTerm || statusFilter !== 'all' || doctorFilter !== 'all' || locationFilter || dateFilter
                      ? 'Try adjusting your filters'
                      : 'Create your first appointment slot to get started'
                    }
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAppointments.map((appointment, index) => (
                    <motion.div
                      key={appointment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <AppointmentCard
                        appointment={appointment}
                        onStatusUpdate={handleStatusUpdate}
                        userRole={user?.role || 'User'}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Patient Bookings */}
        {!showCalendarView && viewMode === 'bookings' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-secondary-50 to-primary-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserGroupIcon className="h-6 w-6 text-secondary-600" />
                  <h2 className="text-xl font-bold text-gray-900">
                    Patient Bookings
                    <span className="ml-3 text-lg font-semibold text-secondary-600">
                      ({filteredTokenAppointments.length})
                    </span>
                  </h2>
                </div>
              </div>
            </div>
            <div className="p-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <LoadingSpinner size="lg" />
                  <p className="text-gray-600 mt-4">Loading patient bookings...</p>
                </div>
              ) : filteredTokenAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <UserGroupIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No patient bookings found</h3>
                  <p className="text-gray-600">
                    {searchTerm || statusFilter !== 'all' || doctorFilter !== 'all' || locationFilter || dateFilter
                      ? 'Try adjusting your filters'
                      : 'No bookings available yet'
                    }
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredTokenAppointments.map((booking, index) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-primary-300 hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                            {booking.patientName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{booking.patientName}</h3>
                            <p className="text-sm text-gray-600">{booking.patientEmail}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          booking.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <ClockIcon className="h-4 w-4 text-primary-600" />
                            <span className="font-medium">Token:</span>
                            <span className="font-bold text-primary-600">{booking.tokenNumber}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <CalendarIcon className="h-4 w-4 text-primary-600" />
                            <span>{format(new Date(booking.date), 'MMM dd, yyyy')} at {booking.time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <UserGroupIcon className="h-4 w-4 text-primary-600" />
                            <span>Dr. {booking.doctor.name}</span>
                          </div>
                          {booking.appointment?.clinic && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <MapPinIcon className="h-4 w-4 text-primary-600" />
                              <span className="truncate">{booking.appointment.clinic.locationName}</span>
                            </div>
                          )}
                        </div>
                        {booking.reasonForVisit && (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs font-medium text-gray-500 mb-1">Reason for Visit</p>
                            <p className="text-sm text-gray-700">{booking.reasonForVisit}</p>
                          </div>
                        )}
                      </div>

                      {(isAdmin || isDoctor || isAssistant) && (
                        <div className="pt-4 border-t border-gray-200">
                          <label className="block text-xs font-medium text-gray-700 mb-2">Update Status:</label>
                          <select
                            value={booking.status}
                            onChange={(e) => handleStatusUpdate(booking.id, e.target.value, true)}
                            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="No Show">No Show</option>
                          </select>
                        </div>
                      )}
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
              fetchAllData();
              toast.success('Appointment slot created successfully');
            }}
            doctors={doctors}
            clinics={clinics}
          />
        </Modal>
      </motion.div>
    </div>
  );
};

export default AppointmentsPage;