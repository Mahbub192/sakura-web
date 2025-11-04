import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
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
  ChartBarIcon,
  ArrowTrendingUpIcon as TrendingUpIcon,
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

  // Calculate weekly data for charts
  const weeklyData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    return days.map((day, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const daySlots = appointments.filter(apt => apt.date === dateStr);
      const dayBookings = tokenAppointments.filter(apt => apt.date === dateStr);
      return {
        day,
        slots: daySlots.length,
        bookings: dayBookings.length,
      };
    });
  }, [appointments, tokenAppointments]);

  // Calculate status distribution for slots
  const slotStatusData = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    appointments.forEach(apt => {
      statusCounts[apt.status || 'Unknown'] = (statusCounts[apt.status || 'Unknown'] || 0) + 1;
    });
    
    const colors = {
      'Available': '#10B981',
      'Booked': '#F59E0B',
      'Completed': '#3B82F6',
    };
    
    return Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
      color: colors[name as keyof typeof colors] || '#6B7280',
    }));
  }, [appointments]);

  // Calculate booking status distribution
  const bookingStatusData = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    tokenAppointments.forEach(apt => {
      statusCounts[apt.status] = (statusCounts[apt.status] || 0) + 1;
    });
    
    const colors = {
      'Confirmed': '#3B82F6',
      'Completed': '#10B981',
      'Cancelled': '#EF4444',
      'Pending': '#F59E0B',
    };
    
    return Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
      color: colors[name as keyof typeof colors] || '#6B7280',
    }));
  }, [tokenAppointments]);

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
    const doctorName = apt.doctor?.name || '';
    const clinicLocation = apt.clinic?.locationName || '';
    const matchesSearch = doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         clinicLocation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || apt.status?.toLowerCase() === statusFilter.toLowerCase();
    const matchesDoctor = doctorFilter === 'all' || apt.doctorId?.toString() === doctorFilter;
    const matchesLocation = !locationFilter || apt.clinicId === Number(locationFilter);
    const matchesDate = !dateFilter || apt.date === dateFilter;
    return matchesSearch && matchesStatus && matchesDoctor && matchesLocation && matchesDate;
  });

  const filteredTokenAppointments = tokenAppointments.filter(apt => {
    const doctorName = apt.doctor?.name || '';
    const patientName = apt.patientName || '';
    const patientEmail = apt.patientEmail || '';
    const patientPhone = apt.patientPhone || '';
    const matchesSearch = patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patientPhone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || apt.status?.toLowerCase() === statusFilter.toLowerCase();
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
          return [`Slot`, `${apt.doctor?.name || 'Unknown'},${apt.date},${apt.startTime}-${apt.endTime},${apt.status},${apt.clinic?.locationName || 'N/A'}`];
        } else {
          const booking = item as any;
          return [`Booking`, `${booking.patientName || 'Unknown'},${booking.patientEmail || ''},${booking.patientPhone || ''},${booking.date},${booking.time},${booking.tokenNumber},${booking.status},${booking.doctor?.name || 'Unknown'}`];
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
        className="space-y-4"
      >
        {/* Enhanced Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 rounded-lg p-3 text-white shadow-md">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <SparklesIcon className="h-4 w-4" />
                <h1 className="text-lg font-bold">Appointments Management</h1>
              </div>
              <p className="text-xs text-primary-100">Manage appointment slots and patient bookings efficiently</p>
            </div>
            <div className="mt-2 sm:mt-0 flex flex-wrap gap-1.5">
              <button
                onClick={fetchAllData}
                disabled={refreshing}
                className="flex items-center gap-1 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-md px-2 py-1 text-xs transition-colors disabled:opacity-50"
              >
                {refreshing ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <ArrowPathIcon className="h-3 w-3" />
                )}
                Refresh
              </button>
              <Button
                variant={showCalendarView ? 'primary' : 'outline'}
                onClick={() => setShowCalendarView(!showCalendarView)}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 border-white/30 text-white text-xs px-2 py-1"
              >
                <CalendarIcon className="h-3 w-3 mr-1" />
                Calendar
              </Button>
              {(isAdmin || isDoctor) && (
                <Button
                  variant="primary"
                  onClick={() => setShowCreateModal(true)}
                  className="bg-white text-primary-600 hover:bg-gray-50 text-xs px-2 py-1"
                >
                  <PlusIcon className="h-3 w-3 mr-1" />
                  Create Slot
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="group relative bg-white rounded-lg shadow-sm p-3 border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer"
            >
              {/* Gradient Background */}
              <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${stat.color} opacity-5 rounded-full -mr-8 -mt-8`}></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-1.5">
                  <div className={`p-2 rounded-md bg-gradient-to-br ${stat.color} shadow-sm group-hover:scale-110 transition-transform`}>
                    <stat.icon className="h-4 w-4 text-white" />
                  </div>
                  <div className={`${stat.bg} px-1.5 py-0.5 rounded-full`}>
                    <span className={`text-xs font-medium ${stat.textColor}`}>
                      {stat.subtitle}
                    </span>
                  </div>
                </div>
                <h3 className="text-xs font-medium text-gray-600 mb-0.5">{stat.title}</h3>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Weekly Trends Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm p-3 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <ChartBarIcon className="h-4 w-4 text-primary-600" />
                Weekly Trends
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="day" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #E5E7EB', 
                    borderRadius: '8px',
                    fontSize: '12px'
                  }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="slots" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Appointment Slots"
                />
                <Line 
                  type="monotone" 
                  dataKey="bookings" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Patient Bookings"
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Status Distribution Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-sm p-3 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <ChartBarIcon className="h-4 w-4 text-primary-600" />
                {viewMode === 'slots' ? 'Slot Status' : 'Booking Status'}
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={viewMode === 'slots' ? slotStatusData : bookingStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(viewMode === 'slots' ? slotStatusData : bookingStatusData).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Enhanced Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm p-3 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <FunnelIcon className="h-4 w-4 text-primary-600" />
              <h3 className="text-sm font-bold text-gray-900">Filters & Search</h3>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUpIcon className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">
                {viewMode === 'slots' ? `${filteredAppointments.length} slots` : `${filteredTokenAppointments.length} bookings`} found
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {/* Search */}
            <div className="relative flex-1 min-w-[150px]">
              <MagnifyingGlassIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[120px]"
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
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[140px]"
            >
              <option value="all">All Doctors</option>
              {doctors.map(doctor => (
                <option key={doctor.id} value={doctor.id}>
                  Dr. {doctor.name}
                </option>
              ))}
            </select>

            {/* Location Filter */}
            <div className="relative min-w-[160px]">
              <MapPinIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none z-10" />
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value ? Number(e.target.value) : '')}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none bg-white"
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
            <div className="relative min-w-[140px]">
              <CalendarIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-gray-700 whitespace-nowrap"
              >
                <XCircleIcon className="h-3.5 w-3.5" />
                Clear All
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <div className="flex gap-1.5">
              <button
                onClick={() => setViewMode('slots')}
                className={`px-2 py-1 text-xs rounded-md font-medium transition-all ${
                  viewMode === 'slots'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <CalendarIcon className="h-3.5 w-3.5 inline mr-1" />
                Slots
              </button>
              <button
                onClick={() => setViewMode('bookings')}
                className={`px-2 py-1 text-xs rounded-md font-medium transition-all ${
                  viewMode === 'bookings'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <UserGroupIcon className="h-3.5 w-3.5 inline mr-1" />
                Bookings
              </button>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={handleExport}
                className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-gray-700"
                title="Export to CSV"
              >
                <ArrowDownTrayIcon className="h-3.5 w-3.5" />
                Export
              </button>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Calendar View */}
        {showCalendarView && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-4 border border-gray-200">
              <Calendar
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                appointments={calendarAppointments}
              />
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
              <div className="mb-4">
                <h3 className="text-base font-bold text-gray-900 mb-1">
                  {format(selectedDate, 'MMMM d, yyyy')}
                </h3>
                <p className="text-xs text-gray-600">
                  {appointments.filter(apt => apt.date === format(selectedDate, 'yyyy-MM-dd')).length} appointments scheduled
                </p>
              </div>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {appointments
                  .filter(apt => apt.date === format(selectedDate, 'yyyy-MM-dd'))
                  .map(apt => (
                    <motion.div
                      key={apt.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-900">Dr. {apt.doctor?.name || 'Unknown'}</div>
                          <div className="text-xs text-gray-600 mt-0.5">{apt.doctor?.specialization || ''}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          apt.status === 'Available' ? 'bg-green-100 text-green-800' :
                          apt.status === 'Booked' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {apt.status}
                        </span>
                      </div>
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <ClockIcon className="h-3.5 w-3.5" />
                          <span>{apt.startTime} - {apt.endTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPinIcon className="h-3.5 w-3.5" />
                          <span className="truncate">{apt.clinic?.locationName || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <UserGroupIcon className="h-3.5 w-3.5" />
                          <span>{apt.currentBookings}/{apt.maxPatients} patients</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                {appointments.filter(apt => apt.date === format(selectedDate, 'yyyy-MM-dd')).length === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    <CalendarIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No appointments on this date</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Appointment Slots */}
        {!showCalendarView && viewMode === 'slots' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-secondary-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <CalendarIcon className="h-4 w-4 text-primary-600" />
                  <h2 className="text-sm font-bold text-gray-900">
                    Appointment Slots
                    <span className="ml-1.5 text-xs font-semibold text-primary-600">
                      ({filteredAppointments.length})
                    </span>
                  </h2>
                </div>
              </div>
            </div>
            <div className="p-3">
              {isLoading ? (
                <div className="text-center py-8">
                  <LoadingSpinner size="md" />
                  <p className="text-sm text-gray-600 mt-3">Loading appointments...</p>
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">No appointment slots found</h3>
                  <p className="text-sm text-gray-600">
                    {searchTerm || statusFilter !== 'all' || doctorFilter !== 'all' || locationFilter || dateFilter
                      ? 'Try adjusting your filters'
                      : 'Create your first appointment slot to get started'
                    }
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-secondary-50 to-primary-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <UserGroupIcon className="h-4 w-4 text-secondary-600" />
                  <h2 className="text-sm font-bold text-gray-900">
                    Patient Bookings
                    <span className="ml-1.5 text-xs font-semibold text-secondary-600">
                      ({filteredTokenAppointments.length})
                    </span>
                  </h2>
                </div>
              </div>
            </div>
            <div className="p-3">
              {isLoading ? (
                <div className="text-center py-8">
                  <LoadingSpinner size="md" />
                  <p className="text-sm text-gray-600 mt-3">Loading patient bookings...</p>
                </div>
              ) : filteredTokenAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">No patient bookings found</h3>
                  <p className="text-sm text-gray-600">
                    {searchTerm || statusFilter !== 'all' || doctorFilter !== 'all' || locationFilter || dateFilter
                      ? 'Try adjusting your filters'
                      : 'No bookings available yet'
                    }
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {filteredTokenAppointments.map((booking, index) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group bg-white border-2 border-gray-200 rounded-lg p-3 hover:border-primary-300 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            {booking.patientName?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-gray-900">{booking.patientName || 'Unknown'}</h3>
                            <p className="text-xs text-gray-600">{booking.patientEmail || ''}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          booking.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <ClockIcon className="h-3.5 w-3.5 text-primary-600" />
                            <span className="font-medium">Token:</span>
                            <span className="font-bold text-primary-600">{booking.tokenNumber}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <CalendarIcon className="h-3.5 w-3.5 text-primary-600" />
                            <span className="truncate">{format(new Date(booking.date), 'MMM dd, yyyy')} at {formatTimeTo12Hour(booking.time || '')}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <UserGroupIcon className="h-3.5 w-3.5 text-primary-600" />
                            <span className="truncate">Dr. {booking.doctor?.name || 'Unknown'}</span>
                          </div>
                          {booking.appointment?.clinic && (
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <MapPinIcon className="h-3.5 w-3.5 text-primary-600" />
                              <span className="truncate">{booking.appointment.clinic.locationName}</span>
                            </div>
                          )}
                        </div>
                        {booking.reasonForVisit && (
                          <div className="p-2 bg-gray-50 rounded-lg">
                            <p className="text-xs font-medium text-gray-500 mb-0.5">Reason for Visit</p>
                            <p className="text-xs text-gray-700">{booking.reasonForVisit}</p>
                          </div>
                        )}
                      </div>

                      {(isAdmin || isDoctor || isAssistant) && (
                        <div className="pt-3 border-t border-gray-200">
                          <label className="block text-xs font-medium text-gray-700 mb-1.5">Update Status:</label>
                          <select
                            value={booking.status}
                            onChange={(e) => handleStatusUpdate(booking.id, e.target.value, true)}
                            className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
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