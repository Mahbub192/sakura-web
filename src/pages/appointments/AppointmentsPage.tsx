import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
import Modal from '../../components/ui/Modal';
import Calendar from '../../components/ui/Calendar';
import CreateAppointmentForm from '../../components/forms/CreateAppointmentForm';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';

// Helper function to convert 24-hour time to 12-hour AM/PM format
const formatTimeTo12Hour = (time24: string): string => {
  if (!time24) return 'N/A';
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
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAdmin, isDoctor, isAssistant } = useAuth();
  const { appointments, tokenAppointments, isLoading } = useAppSelector(state => state.appointments);
  const { doctors } = useAppSelector(state => state.doctors);
  const { clinics } = useAppSelector(state => state.clinics);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | undefined>(undefined);
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
    
    // If date filter is selected, show week containing that date, otherwise show current week
    const baseDate = dateFilter ? new Date(dateFilter) : new Date();
    
    // Find the start of the week (Monday) for the base date
    const dayOfWeek = baseDate.getDay();
    const weekStart = new Date(baseDate);
    weekStart.setDate(baseDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)); // Adjust to Monday
    weekStart.setHours(0, 0, 0, 0);
    
    return days.map((day, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Show data for all days in the week (not filtered by dateFilter for weekly view)
      const daySlots = appointments.filter(apt => apt.date === dateStr);
      const dayBookings = tokenAppointments.filter(apt => apt.date === dateStr);
      
      return {
        day,
        slots: daySlots.length,
        bookings: dayBookings.length,
      };
    });
  }, [appointments, tokenAppointments, dateFilter]);

  // Calculate status distribution for slots
  const slotStatusData = useMemo(() => {
    // Filter appointments by date if dateFilter is set
    const filteredAppts = dateFilter
      ? appointments.filter(apt => apt.date === dateFilter)
      : appointments;
    
    const statusCounts: Record<string, number> = {};
    filteredAppts.forEach(apt => {
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
  }, [appointments, dateFilter]);

  useEffect(() => {
    fetchAllData();
  }, [dispatch]);

  const fetchAllData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        dispatch(fetchAppointments({})),
        dispatch(fetchTokenAppointments({})),
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
  }).sort((a, b) => {
    // Sort by date descending (newest first)
    const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateCompare !== 0) return dateCompare;
    // If dates are same, sort by ID descending (highest first)
    return b.id - a.id;
  });

  const today = format(new Date(), 'yyyy-MM-dd');
  
  // Calculate stats based on selected date filter
  const statsData = useMemo(() => {
    // Filter appointments by selected date
    const filteredByDate = dateFilter 
      ? appointments.filter(apt => apt.date === dateFilter)
      : appointments;
    
    // Filter token appointments by selected date
    const filteredTokenByDate = dateFilter
      ? tokenAppointments.filter(apt => apt.date === dateFilter)
      : tokenAppointments;

    const totalAppointments = filteredByDate.length;
    const availableSlots = filteredByDate.filter(apt => apt.status === 'Available').length;
    const openForBooking = filteredByDate.filter(apt => apt.status === 'Available' && new Date(apt.date) >= new Date()).length;
    const patientBookings = filteredTokenByDate.length;
    
    // For "Today's Appointments" or "Selected Date Appointments"
    const todayAppointments = dateFilter 
      ? filteredByDate.length // Show all appointments for selected date
      : appointments.filter(apt => apt.date === today).length; // Show today's appointments when no filter

    return {
      totalAppointments,
      availableSlots,
      openForBooking,
      patientBookings,
      todayAppointments,
    };
  }, [appointments, tokenAppointments, dateFilter, today]);

  const { totalAppointments, availableSlots, openForBooking, patientBookings, todayAppointments } = statsData;

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Available':
        return 'text-green-600 dark:text-green-500 bg-green-100 dark:bg-green-900/50';
      case 'Booked':
        return 'text-orange-600 dark:text-orange-500 bg-orange-100 dark:bg-orange-900/50';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800';
    }
  };

  // Prepare calendar appointments data
  const calendarAppointments = useMemo(() => {
    return appointments.map(apt => {
      const bookedCount = tokenAppointments.filter(ta => ta.appointmentId === apt.id).length;
      const status = bookedCount >= apt.maxPatients ? 'full' as const :
                     bookedCount > 0 ? 'booked' as const : 'available' as const;
      return {
        date: apt.date,
        count: bookedCount,
        status,
      };
    });
  }, [appointments, tokenAppointments]);

  const handleCalendarDateSelect = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    setDateFilter(dateStr);
    setSelectedCalendarDate(date);
    setShowCalendarModal(false);
    toast.success(`Filtered appointments for ${format(date, 'MMM dd, yyyy')}`);
  };

  // Update selectedCalendarDate when dateFilter changes
  useEffect(() => {
    if (dateFilter) {
      setSelectedCalendarDate(new Date(dateFilter));
    } else {
      setSelectedCalendarDate(undefined);
    }
  }, [dateFilter]);

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
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Appointments Management</h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Manage appointment slots and patient bookings efficiently</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={fetchAllData}
                disabled={refreshing}
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
            {(isAdmin || isDoctor) && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center justify-center gap-1 sm:gap-2 rounded-lg h-10 px-2 sm:px-4 bg-primary text-white text-sm font-bold leading-normal shadow-sm hover:bg-primary/90 transition-colors"
              >
                <span className="material-symbols-outlined text-xl">add</span>
                <span className="hidden sm:inline">Create Slot</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 mb-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-lg flex items-center gap-4">
            <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">event</span>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalAppointments}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-lg flex items-center gap-4">
            <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full">
              <span className="material-symbols-outlined text-green-600 dark:text-green-400">event_available</span>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Available Slots</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{availableSlots}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-lg flex items-center gap-4">
            <div className="bg-yellow-100 dark:bg-yellow-900/50 p-3 rounded-full">
              <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400">event_upcoming</span>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Open for booking</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{openForBooking}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-lg flex items-center gap-4">
            <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-full">
              <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400">book_online</span>
                  </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Patient Bookings</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{patientBookings}</p>
                  </div>
                </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-lg flex items-center gap-4">
            <div className="bg-pink-100 dark:bg-pink-900/50 p-3 rounded-full">
              <span className="material-symbols-outlined text-pink-600 dark:text-pink-400">today</span>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {dateFilter 
                  ? `Appointments on ${format(new Date(dateFilter), 'MMM dd, yyyy')}`
                  : "Today's Appointments"}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayAppointments}</p>
            </div>
              </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 sm:p-6 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm sm:text-base">
              {dateFilter 
                ? `Weekly Trends (Week of ${format(new Date(dateFilter), 'MMM dd, yyyy')})`
                : 'Weekly Trends'}
              </h3>
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
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
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 sm:p-6 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm sm:text-base">
              {dateFilter 
                ? `Slot Status (${format(new Date(dateFilter), 'MMM dd, yyyy')})`
                : 'Slot Status'}
            </h3>
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                    data={slotStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                    {slotStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            </div>
          </div>
            </div>

        {/* Filters & Search */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 sm:p-4 rounded-lg mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Filters & Search</h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{filteredAppointments.length} slots found</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 shadow-sm focus:border-primary focus:ring-primary"
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
              className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            >
              <option value="all">All Doctors</option>
              {doctors.map(doctor => (
                <option key={doctor.id} value={doctor.id}>
                  Dr. {doctor.name}
                </option>
              ))}
            </select>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value ? Number(e.target.value) : '')}
              className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              >
                <option value="">All Locations</option>
                {clinics.map(clinic => (
                  <option key={clinic.id} value={clinic.id}>
                  {clinic.locationName}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 rounded-lg p-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 w-full sm:w-auto">
              <button
                onClick={() => setViewMode('slots')}
                className={`flex-1 sm:flex-none px-3 py-1 text-xs sm:text-sm font-semibold rounded-md transition-colors ${
                  viewMode === 'slots'
                    ? 'bg-white dark:bg-gray-700 text-primary dark:text-primary-light shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'
                }`}
              >
                Slots
              </button>
              <button
                onClick={() => setViewMode('bookings')}
                className={`flex-1 sm:flex-none px-3 py-1 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'bookings'
                    ? 'bg-white dark:bg-gray-700 text-primary dark:text-primary-light shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'
                }`}
              >
                Bookings
              </button>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <div className="relative flex-grow">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg sm:text-xl">search</span>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>
              <button className="flex items-center justify-center gap-1 sm:gap-2 rounded-lg h-10 px-2 sm:px-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-semibold leading-normal border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                <span className="material-symbols-outlined text-lg sm:text-xl">download</span>
                <span className="hidden sm:inline">Export</span>
              </button>
              </div>
            </div>
          </div>

        {/* Appointment Slots */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Appointment Slots</h3>
            <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium px-2 py-0.5 rounded-full">
              {filteredAppointments.length}
                    </span>
            </div>
              {isLoading ? (
                <div className="text-center py-8">
                  <LoadingSpinner size="md" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">Loading appointments...</p>
                </div>
              ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No appointment slots found</p>
                </div>
              ) : (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">SI No.</th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">ID</th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Doctor</th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Date</th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Time</th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">Location</th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Patients</th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell">Progress</th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell">Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAppointments.map((appointment, parentIndex) => {
                    const slotPatients = tokenAppointments.filter(apt => apt.appointmentId === appointment.id);
                    const isExpanded = selectedSlotId === appointment.id;
                    const parentSerial = parentIndex + 1;
                    
                    return (
                      <React.Fragment key={appointment.id}>
                        <tr
                          onClick={() => setSelectedSlotId(isExpanded ? null : appointment.id)}
                          className={`cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors ${
                            isExpanded ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-900'
                          }`}
                        >
                          <td className="px-2 sm:px-4 py-3 whitespace-nowrap text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                            {parentSerial}
                          </td>
                          <td className="px-2 sm:px-4 py-3 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                            #{appointment.id}
                          </td>
                          <td className="px-2 sm:px-4 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900 dark:text-white">
                            <span className="hidden sm:inline">Dr. </span>{appointment.doctor?.name || 'Unknown'}
                          </td>
                          <td className="px-2 sm:px-4 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            {format(new Date(appointment.date), 'MMM dd, yyyy')}
                          </td>
                          <td className="px-2 sm:px-4 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            <span className="hidden sm:inline">{formatTimeTo12Hour(appointment.startTime || '')} - {formatTimeTo12Hour(appointment.endTime || '')}</span>
                            <span className="sm:hidden">{formatTimeTo12Hour(appointment.startTime || '')}</span>
                          </td>
                          <td className="px-2 sm:px-4 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden md:table-cell">
                            {appointment.clinic?.locationName || 'N/A'}
                          </td>
                          <td className="px-2 sm:px-4 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            {appointment.currentBookings}/{appointment.maxPatients}
                          </td>
                          <td className="px-2 sm:px-4 py-3 whitespace-nowrap hidden lg:table-cell">
                            <div className="w-20 sm:w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  appointment.currentBookings >= appointment.maxPatients
                                    ? 'bg-red-500'
                                    : appointment.currentBookings > appointment.maxPatients * 0.7
                                    ? 'bg-orange-500'
                                    : 'bg-green-500'
                                }`}
                                style={{
                                  width: `${Math.min((appointment.currentBookings / appointment.maxPatients) * 100, 100)}%`,
                                }}
                              />
                </div>
                          </td>
                          <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                            <span className={`text-xs font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full ${getStatusBadgeClass(appointment.status)}`}>
                              {appointment.status}
                    </span>
                          </td>
                          <td className="px-2 sm:px-4 py-3 whitespace-nowrap text-xs sm:text-sm font-semibold text-gray-900 dark:text-white hidden lg:table-cell">
                            ৳{appointment.doctor?.consultationFee || '0.00'}
                          </td>
                        </tr>
                        {isExpanded && slotPatients.length > 0 && (
                          <>
                            <tr className="bg-green-50 dark:bg-green-900/20">
                              <td colSpan={10} className="px-4 py-2">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                  Booked Patients ({slotPatients.length}/{appointment.maxPatients})
                                </h4>
                              </td>
                            </tr>
                            {slotPatients.map((patient, childIndex) => (
                              <tr
                                key={patient.id}
                                className="bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                              >
                                <td className="px-4 py-3 pl-12 whitespace-nowrap text-sm font-semibold text-gray-700 dark:text-gray-300">
                                  {parentSerial}.{childIndex + 1}
                                </td>
                                <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                                    <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                      {patient.patientName.charAt(0)}
                                    </div>
                                    <span className="text-xs text-gray-500">Patient</span>
                          </div>
                                </td>
                                <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                                  {patient.patientName}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                  {format(new Date(patient.date), 'MMM dd, yyyy')}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                  {formatTimeTo12Hour(patient.time || '')}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                  {appointment.clinic?.locationName || 'N/A'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                  <div className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">phone</span>
                                    <span>{patient.patientPhone}</span>
                          </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                  <div className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">confirmation_number</span>
                                    <span className="font-semibold">#{patient.tokenNumber}</span>
                        </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                    patient.status === 'Confirmed' ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' :
                                    patient.status === 'Pending' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300' :
                                    patient.status === 'Completed' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300' :
                                    'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                                  }`}>
                                    {patient.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                  {patient.reasonForVisit ? (
                                    <span className="truncate block max-w-[120px]" title={patient.reasonForVisit}>
                                      {patient.reasonForVisit}
                        </span>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </>
                        )}
                        {isExpanded && slotPatients.length === 0 && (
                          <tr className="bg-green-50 dark:bg-green-900/20">
                            <td colSpan={10} className="px-4 py-8 text-center">
                              <span className="material-symbols-outlined text-4xl text-gray-400 dark:text-gray-500 mb-2 block">person_off</span>
                              <p className="text-sm text-gray-500 dark:text-gray-400">No patients have booked this slot yet</p>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
                </div>
              )}
            </div>
          </div>

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

      {/* Calendar Modal */}
      <Modal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        title="Select Date"
        size="md"
      >
        <Calendar
          selectedDate={selectedCalendarDate}
          onDateSelect={handleCalendarDateSelect}
          appointments={calendarAppointments}
        />
      </Modal>
    </div>
  );
};

export default AppointmentsPage;
