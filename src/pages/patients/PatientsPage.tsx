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
  fetchTokenAppointments,
  updateTokenAppointmentStatus,
} from '../../store/slices/appointmentSlice';
import { fetchMyAppointments } from '../../store/slices/patientSlice';
import { fetchClinics } from '../../store/slices/clinicSlice';
import Modal from '../../components/ui/Modal';
import Calendar from '../../components/ui/Calendar';
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

const PatientsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAdmin, isDoctor, isAssistant, isPatient } = useAuth();
  const { tokenAppointments, isLoading } = useAppSelector(state => state.appointments);
  const { myAppointments, isLoading: patientsLoading } = useAppSelector(state => state.patients);
  const { clinics } = useAppSelector(state => state.clinics);
  
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedDateId, setSelectedDateId] = useState<string | null>(null);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState<number | ''>('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
    dispatch(fetchClinics());
  }, [dispatch]);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      if (isAdmin || isDoctor || isAssistant) {
        await dispatch(fetchTokenAppointments({})).unwrap();
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

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      await dispatch(updateTokenAppointmentStatus({ id, status: newStatus }));
      toast.success('Patient status updated successfully');
    } catch (error) {
      toast.error('Failed to update patient status');
    }
  };

  // Filter appointments
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

  // Group patients by date
  const patientsByDate = useMemo(() => {
    const grouped: Record<string, typeof filteredAppointments> = {};
    filteredAppointments.forEach(apt => {
      if (!grouped[apt.date]) {
        grouped[apt.date] = [];
      }
      grouped[apt.date].push(apt);
    });
    
    // Sort dates descending (newest first)
    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
      .map(([date, patients]) => ({
        date,
        patients: patients.sort((a, b) => {
          // Sort by time if available, otherwise by ID
          if (a.time && b.time) {
            return a.time.localeCompare(b.time);
          }
          return b.id - a.id;
        }),
      }));
  }, [filteredAppointments]);

  // Calculate stats based on selected date filter
  const statsData = useMemo(() => {
    const filteredByDate = dateFilter
      ? filteredAppointments.filter(apt => apt.date === dateFilter)
      : filteredAppointments;

    const totalPatients = new Set(filteredByDate.map(apt => apt.patientEmail)).size;
    const totalAppointments = filteredByDate.length;
    const confirmed = filteredByDate.filter(apt => apt.status === 'Confirmed').length;
    const pending = filteredByDate.filter(apt => apt.status === 'Pending').length;
    const completed = filteredByDate.filter(apt => apt.status === 'Completed').length;

    return {
      totalPatients,
      totalAppointments,
      confirmed,
      pending,
      completed,
    };
  }, [filteredAppointments, dateFilter]);

  const { totalPatients, totalAppointments, confirmed, pending, completed } = statsData;

  // Calculate weekly data for charts
  const weeklyData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    const baseDate = dateFilter ? new Date(dateFilter) : new Date();
    const dayOfWeek = baseDate.getDay();
    const weekStart = new Date(baseDate);
    weekStart.setDate(baseDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
    weekStart.setHours(0, 0, 0, 0);
    
    return days.map((day, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const dayPatients = filteredAppointments.filter(apt => apt.date === dateStr);
      const dayCompleted = dayPatients.filter(apt => apt.status === 'Completed').length;
      
      return {
        day,
        total: dayPatients.length,
        completed: dayCompleted,
      };
    });
  }, [filteredAppointments, dateFilter]);

  // Calculate status distribution for charts
  const statusData = useMemo(() => {
    const filteredByDate = dateFilter
      ? filteredAppointments.filter(apt => apt.date === dateFilter)
      : filteredAppointments;
    
    const statusCounts: Record<string, number> = {};
    filteredByDate.forEach(apt => {
      const status = apt.status || 'Unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    const colors: Record<string, string> = {
      'Pending': '#F59E0B',
      'Confirmed': '#10B981',
      'Completed': '#3B82F6',
      'Cancelled': '#EF4444',
      'No Show': '#6B7280',
      'Unknown': '#9CA3AF',
    };
    
    return Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
      color: colors[name] || '#9CA3AF',
    }));
  }, [filteredAppointments, dateFilter]);

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
    setDateFilter(dateStr);
    setSelectedCalendarDate(date);
    setShowCalendarModal(false);
    toast.success(`Filtered patients for ${format(date, 'MMM dd, yyyy')}`);
  };

  useEffect(() => {
    if (dateFilter) {
      setSelectedCalendarDate(new Date(dateFilter));
    } else {
      setSelectedCalendarDate(undefined);
    }
  }, [dateFilter]);

  // Patient view (for patients themselves)
  if (isPatient) {
  return (
      <div className="font-display bg-background-light dark:bg-background-dark text-gray-800 dark:text-gray-200 w-full">
        <div className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">My Appointments</h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">View and manage your appointment history</p>
            </div>
            <button
              onClick={() => navigate('/patients/book')}
              className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal shadow-sm hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">add</span>
              <span>Book New Appointment</span>
            </button>
        </div>

          {patientsLoading ? (
            <div className="text-center py-8">
              <LoadingSpinner size="md" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">Loading your appointments...</p>
            </div>
          ) : myAppointments.length === 0 ? (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-6xl text-gray-400 dark:text-gray-500 mb-4 block">event_busy</span>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No appointments yet</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Start by booking your first appointment</p>
              <button
                onClick={() => navigate('/patients/book')}
                className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold mx-auto"
              >
                <span className="material-symbols-outlined text-xl">add</span>
                Book Your First Appointment
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 sm:p-6">
              <div className="space-y-4">
                {myAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-start justify-between">
          <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                          Dr. {appointment.doctor?.name || 'Unknown'}
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <p><span className="font-medium">Date:</span> {format(new Date(appointment.date), 'MMM dd, yyyy')}</p>
                          <p><span className="font-medium">Time:</span> {appointment.time || 'N/A'}</p>
                          <p><span className="font-medium">Status:</span> 
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadgeClass(appointment.status)}`}>
                              {appointment.status}
                            </span>
                          </p>
            </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Staff view (admin, doctor, assistant)
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
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Patients Management</h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Manage patient appointments and medical records</p>
          </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={fetchData}
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
        </div>
        </div>

        {/* Stats Cards */}
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
              <span className="material-symbols-outlined text-green-600 dark:text-green-400">event</span>
              </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalAppointments}</p>
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
              <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400">check_circle</span>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Confirmed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{confirmed}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-lg flex items-center gap-4">
            <div className="bg-pink-100 dark:bg-pink-900/50 p-3 rounded-full">
              <span className="material-symbols-outlined text-pink-600 dark:text-pink-400">done_all</span>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {dateFilter 
                  ? `Completed on ${format(new Date(dateFilter), 'MMM dd')}`
                  : 'Completed'}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{completed}</p>
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
                    dataKey="total" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    name="Total Appointments"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="completed" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="Completed"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 sm:p-6 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm sm:text-base">
              {dateFilter 
                ? `Status Distribution (${format(new Date(dateFilter), 'MMM dd, yyyy')})`
                : 'Status Distribution'}
            </h3>
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={true}
                    outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
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
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{filteredAppointments.length} patients found</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
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
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg sm:text-xl">search</span>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button className="flex items-center justify-center gap-1 sm:gap-2 rounded-lg h-10 px-2 sm:px-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-semibold leading-normal border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
              <span className="material-symbols-outlined text-lg sm:text-xl">download</span>
              <span className="hidden sm:inline">Export</span>
              </button>
          </div>
                </div>

        {/* Patients Table - Date-wise Tree Structure */}
                      <div>
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Patients by Date</h3>
            <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium px-2 py-0.5 rounded-full">
              {patientsByDate.length} dates
            </span>
              </div>
            {isLoading ? (
              <div className="text-center py-8">
                <LoadingSpinner size="md" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">Loading patients...</p>
              </div>
          ) : patientsByDate.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <span className="material-symbols-outlined text-6xl text-gray-400 dark:text-gray-500 mb-4 block">person_off</span>
              <p>No patients found</p>
              </div>
            ) : (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">SI No.</th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Date</th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Patient</th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Time</th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Token</th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">Phone</th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {patientsByDate.map((dateGroup, parentIndex) => {
                    const isExpanded = selectedDateId === dateGroup.date;
                    const parentSerial = parentIndex + 1;
                    const confirmedCount = dateGroup.patients.filter(p => p.status === 'Confirmed').length;
                    const pendingCount = dateGroup.patients.filter(p => p.status === 'Pending').length;
                    const completedCount = dateGroup.patients.filter(p => p.status === 'Completed').length;
                    
                    return (
                      <React.Fragment key={dateGroup.date}>
                        {/* Parent Row - Date */}
                        <tr
                          onClick={() => setSelectedDateId(isExpanded ? null : dateGroup.date)}
                          className={`cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors ${
                            isExpanded ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-900'
                          }`}
                        >
                          <td className="px-2 sm:px-4 py-3 whitespace-nowrap text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                            {parentSerial}
                          </td>
                          <td className="px-2 sm:px-4 py-3 whitespace-nowrap text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                            {format(new Date(dateGroup.date), 'MMM dd, yyyy')}
                          </td>
                          <td className="px-2 sm:px-4 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-semibold">{dateGroup.patients.length}</span> patients
                            <div className="flex items-center gap-2 mt-1 text-xs">
                              <span className="text-green-600 dark:text-green-400">✓ {confirmedCount}</span>
                              <span className="text-yellow-600 dark:text-yellow-400">⏳ {pendingCount}</span>
                              <span className="text-blue-600 dark:text-blue-400">✓ {completedCount}</span>
              </div>
                          </td>
                          <td className="px-2 sm:px-4 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            -
                          </td>
                          <td className="px-2 sm:px-4 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            -
                          </td>
                          <td className="px-2 sm:px-4 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadgeClass('Confirmed')}`}>
                                {confirmedCount}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadgeClass('Pending')}`}>
                                {pendingCount}
                              </span>
          </div>
                          </td>
                          <td className="px-2 sm:px-4 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden md:table-cell">
                            -
                          </td>
                          <td className="px-2 sm:px-4 py-3 whitespace-nowrap hidden lg:table-cell">
                            <span className="material-symbols-outlined text-gray-400">
                              {isExpanded ? 'expand_less' : 'expand_more'}
                            </span>
                          </td>
                        </tr>
                        
                        {/* Sub-tree Rows - Patients */}
                        {isExpanded && dateGroup.patients.length > 0 && (
                          <>
                            <tr className="bg-green-50 dark:bg-green-900/20">
                              <td colSpan={8} className="px-4 py-2">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                  Patients ({dateGroup.patients.length})
                                </h4>
                              </td>
                            </tr>
                            {dateGroup.patients.map((patient, childIndex) => (
                              <tr
                    key={patient.id}
                                className="bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                      setSelectedPatient(patient);
                      setShowPatientDetails(true);
                    }}
                  >
                                <td className="px-4 py-3 pl-12 whitespace-nowrap text-sm font-semibold text-gray-700 dark:text-gray-300">
                                  {parentSerial}.{childIndex + 1}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                  {format(new Date(patient.date), 'MMM dd, yyyy')}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                          {patient.patientName?.charAt(0).toUpperCase() || '?'}
                        </div>
                                    <div>
                                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {patient.patientName || 'Unknown'}
                          </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {patient.patientEmail}
                            </div>
                            </div>
                            </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                  {patient.time ? formatTimeTo12Hour(patient.time) : 'N/A'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                  <div className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">confirmation_number</span>
                                    <span className="font-semibold">#{patient.tokenNumber}</span>
                            </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusBadgeClass(patient.status)}`}>
                                    {patient.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 hidden md:table-cell">
                                  {patient.patientPhone || 'N/A'}
                                </td>
                                <td className="px-4 py-3 hidden lg:table-cell">
                                  <span className="material-symbols-outlined text-gray-400">visibility</span>
                                </td>
                              </tr>
                            ))}
                          </>
                        )}
                        {isExpanded && dateGroup.patients.length === 0 && (
                          <tr className="bg-green-50 dark:bg-green-900/20">
                            <td colSpan={8} className="px-4 py-8 text-center">
                              <span className="material-symbols-outlined text-4xl text-gray-400 dark:text-gray-500 mb-2 block">person_off</span>
                              <p className="text-sm text-gray-500 dark:text-gray-400">No patients found for this date</p>
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
            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 p-4 rounded-lg border border-primary-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary-600">person</span>
                <h3 className="text-base font-bold text-gray-900">Patient Information</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 mb-0.5">Name</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedPatient.patientName || 'N/A'}</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 mb-0.5">Email</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedPatient.patientEmail || 'N/A'}</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 mb-0.5">Phone</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedPatient.patientPhone || 'N/A'}</p>
                  </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 mb-0.5">Token</p>
                  <p className="text-sm font-semibold text-primary-600">#{selectedPatient.tokenNumber}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-blue-600">event</span>
                <h3 className="text-base font-bold text-gray-900">Appointment Details</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 mb-0.5">Date</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {format(new Date(selectedPatient.date), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 mb-0.5">Time</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedPatient.time ? formatTimeTo12Hour(selectedPatient.time) : 'N/A'}
                  </p>
                      </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 mb-0.5">Status</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadgeClass(selectedPatient.status)}`}>
                    {selectedPatient.status}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 mb-0.5">Doctor</p>
                    <p className="text-sm font-semibold text-gray-900">
                    Dr. {selectedPatient.doctor?.name || 'N/A'}
                    </p>
                  </div>
                {selectedPatient.reasonForVisit && (
                <div className="col-span-2 bg-white p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 mb-0.5">Reason for Visit</p>
                    <p className="text-sm text-gray-900">{selectedPatient.reasonForVisit}</p>
                  </div>
                )}
              </div>
            </div>

            {(isAdmin || isDoctor || isAssistant) && (
              <div className="flex justify-end">
                <select
                  value={selectedPatient.status}
                  onChange={(e) => {
                    handleStatusUpdate(selectedPatient.id, e.target.value);
                    setSelectedPatient({ ...selectedPatient, status: e.target.value });
                  }}
                  className="rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 shadow-sm focus:border-primary focus:ring-primary px-3 py-2 text-sm"
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
    </div>
  );
};

export default PatientsPage;
