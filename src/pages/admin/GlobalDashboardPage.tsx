import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  UsersIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { globalDashboardService, GlobalDashboardStats, TodayGlobalAppointment, DoctorWiseStat } from '../../services/globalDashboardService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';

const GlobalDashboardPage: React.FC = () => {
  const { isAdmin, isDoctor } = useAuth();
  const [stats, setStats] = useState<GlobalDashboardStats | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<TodayGlobalAppointment[]>([]);
  const [doctorStats, setDoctorStats] = useState<DoctorWiseStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [activeTab, setActiveTab] = useState<'today' | 'range' | 'doctors'>('today');

  useEffect(() => {
    if (isAdmin || isDoctor) {
      loadDashboardData();
    }
  }, [isAdmin, isDoctor]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [statsData, todayData, doctorsData] = await Promise.all([
        globalDashboardService.getGlobalStats(),
        globalDashboardService.getTodayAppointments(),
        globalDashboardService.getDoctorWiseStats(),
      ]);
      setStats(statsData);
      setTodayAppointments(todayData);
      setDoctorStats(doctorsData);
    } catch (error: any) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.warning('Please enter a search term');
      return;
    }

    try {
      setIsLoading(true);
      const results = await globalDashboardService.searchAppointments(searchTerm, selectedDate || undefined);
      setTodayAppointments(results);
      toast.success(`Found ${results.length} appointments`);
    } catch (error: any) {
      toast.error('Failed to search appointments');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateRangeSearch = async () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      toast.warning('Please select both start and end dates');
      return;
    }

    try {
      setIsLoading(true);
      const results = await globalDashboardService.getAppointmentsByDateRange(
        dateRange.startDate,
        dateRange.endDate
      );
      setTodayAppointments(results);
      toast.success(`Found ${results.length} appointments`);
    } catch (error: any) {
      toast.error('Failed to fetch appointments');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDoctorStatsDateChange = async (date: string) => {
    try {
      setIsLoading(true);
      const results = await globalDashboardService.getDoctorWiseStats(date || undefined);
      setDoctorStats(results);
    } catch (error: any) {
      toast.error('Failed to fetch doctor statistics');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin && !isDoctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Only admins and doctors can access global dashboard.</p>
        </div>
      </div>
    );
  }

  const statsCards = stats ? [
    {
      title: 'Total Doctors',
      value: stats.totalDoctors,
      icon: HeartIcon,
      color: 'bg-blue-500',
    },
    {
      title: 'Today\'s Appointments',
      value: stats.totalAppointmentsToday,
      icon: CalendarDaysIcon,
      color: 'bg-green-500',
    },
    {
      title: 'Today\'s Patients',
      value: stats.totalPatientsToday,
      icon: UsersIcon,
      color: 'bg-purple-500',
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-500',
    },
    {
      title: 'Confirmed',
      value: stats.confirmedAppointments,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
    },
    {
      title: 'Pending',
      value: stats.pendingAppointments,
      icon: ClockIcon,
      color: 'bg-yellow-500',
    },
    {
      title: 'Completed',
      value: stats.completedAppointments,
      icon: CheckCircleIcon,
      color: 'bg-blue-500',
    },
    {
      title: 'Cancelled',
      value: stats.cancelledAppointments,
      icon: XCircleIcon,
      color: 'bg-red-500',
    },
  ] : [];

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                  <ChartBarIcon className="h-5 w-5 text-primary-600" />
                  Global Dashboard
                </h1>
                <p className="text-sm text-gray-600">Overview of all appointments and statistics</p>
              </div>
              <button
                onClick={loadDashboardData}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                Refresh
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {statsCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md p-4 border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('today')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'today'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Today's Appointments
              </button>
              <button
                onClick={() => setActiveTab('range')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'range'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Date Range
              </button>
              <button
                onClick={() => setActiveTab('doctors')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'doctors'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Doctor Statistics
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Search Section */}
            {activeTab === 'today' && (
              <div className="mb-6 space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by patient name, email, phone, token, or doctor name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    onClick={handleSearch}
                    className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors font-medium"
                  >
                    Search
                  </button>
                </div>
              </div>
            )}

            {/* Date Range Section */}
            {activeTab === 'range' && (
              <div className="mb-6 space-y-4">
                <div className="flex gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleDateRangeSearch}
                      className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors font-medium"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Doctor Stats Section */}
            {activeTab === 'doctors' && (
              <div className="mb-6">
                <div className="flex gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Select Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        handleDoctorStatsDateChange(e.target.value);
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setSelectedDate('');
                        handleDoctorStatsDateChange('');
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Content */}
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <>
                {/* Appointments List */}
                {(activeTab === 'today' || activeTab === 'range') && (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {todayAppointments.length === 0 ? (
                      <div className="text-center py-12">
                        <CalendarDaysIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 font-medium">No appointments found</p>
                      </div>
                    ) : (
                      todayAppointments.map((appointment, index) => (
                        <motion.div
                          key={appointment.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-base font-bold text-gray-900">{appointment.patientName}</h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(appointment.status)}`}>
                                  {appointment.status}
                                </span>
                                <span className="text-xs text-gray-500">Token: {appointment.tokenNumber}</span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                                <div className="flex items-center gap-1.5">
                                  <HeartIcon className="h-4 w-4 text-primary-600" />
                                  <span>{appointment.doctorName}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <BuildingOfficeIcon className="h-4 w-4 text-primary-600" />
                                  <span className="truncate">{appointment.clinicName}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <CalendarDaysIcon className="h-4 w-4 text-primary-600" />
                                  <span>{format(new Date(appointment.date), 'MMM dd, yyyy')}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <ClockIcon className="h-4 w-4 text-primary-600" />
                                  <span>{appointment.time}</span>
                                </div>
                              </div>
                              <div className="mt-2 text-xs text-gray-500">
                                <span>Email: {appointment.patientEmail}</span> | <span>Phone: {appointment.patientPhone}</span>
                                {appointment.doctorFee && <span> | Fee: ${appointment.doctorFee}</span>}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                )}

                {/* Doctor Stats */}
                {activeTab === 'doctors' && (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {doctorStats.length === 0 ? (
                      <div className="text-center py-12">
                        <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 font-medium">No doctor statistics found</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {doctorStats.map((doctor, index) => (
                          <motion.div
                            key={doctor.doctorId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                          >
                            <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                              <HeartIcon className="h-5 w-5 text-primary-600" />
                              {doctor.doctorName}
                            </h3>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-600 mb-1">Total Appointments</p>
                                <p className="text-lg font-bold text-gray-900">{doctor.totalAppointments}</p>
                              </div>
                              <div>
                                <p className="text-gray-600 mb-1">Confirmed</p>
                                <p className="text-lg font-bold text-green-600">{doctor.confirmedAppointments}</p>
                              </div>
                              <div>
                                <p className="text-gray-600 mb-1">Completed</p>
                                <p className="text-lg font-bold text-blue-600">{doctor.completedAppointments}</p>
                              </div>
                              <div>
                                <p className="text-gray-600 mb-1">Revenue</p>
                                <p className="text-lg font-bold text-yellow-600">${doctor.totalRevenue.toFixed(2)}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalDashboardPage;

