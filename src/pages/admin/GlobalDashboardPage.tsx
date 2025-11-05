import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
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
  SparklesIcon,
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

  // Calculate status distribution for charts
  const statusData = useMemo(() => {
    if (!stats) return [];
    
    return [
      { name: 'Confirmed', value: stats.confirmedAppointments, color: '#10B981' },
      { name: 'Pending', value: stats.pendingAppointments, color: '#F59E0B' },
      { name: 'Completed', value: stats.completedAppointments, color: '#3B82F6' },
      { name: 'Cancelled', value: stats.cancelledAppointments, color: '#EF4444' },
    ];
  }, [stats]);

  // Calculate doctor performance data
  const doctorPerformanceData = useMemo(() => {
    return doctorStats.slice(0, 5).map(doctor => ({
      name: doctor.doctorName.length > 10 ? doctor.doctorName.substring(0, 10) + '...' : doctor.doctorName,
      appointments: doctor.totalAppointments,
      revenue: doctor.totalRevenue,
    }));
  }, [doctorStats]);

  // Calculate revenue distribution by doctors
  const doctorRevenueData = useMemo(() => {
    return doctorStats
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5)
      .map(doctor => ({
        name: doctor.doctorName.length > 8 ? doctor.doctorName.substring(0, 8) + '...' : doctor.doctorName,
        revenue: parseFloat(doctor.totalRevenue.toFixed(2)),
      }));
  }, [doctorStats]);

  // Calculate appointments by status for bar chart
  const statusBarData = useMemo(() => {
    if (!stats) return [];
    
    return [
      { name: 'Confirmed', value: stats.confirmedAppointments, color: '#10B981' },
      { name: 'Pending', value: stats.pendingAppointments, color: '#F59E0B' },
      { name: 'Completed', value: stats.completedAppointments, color: '#3B82F6' },
      { name: 'Cancelled', value: stats.cancelledAppointments, color: '#EF4444' },
    ];
  }, [stats]);

  // Calculate appointment trends from todayAppointments
  const appointmentTrendsData = useMemo(() => {
    if (todayAppointments.length === 0) return [];
    
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      return format(date, 'MMM dd');
    });

    return last7Days.map(day => {
      const dayDate = new Date(day);
      const appointments = todayAppointments.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate.toDateString() === dayDate.toDateString();
      });

      return {
        day,
        total: appointments.length,
        confirmed: appointments.filter(a => a.status === 'Confirmed').length,
        completed: appointments.filter(a => a.status === 'Completed').length,
      };
    });
  }, [todayAppointments]);

  const statsCards = stats ? [
    {
      title: 'Total Doctors',
      value: stats.totalDoctors,
      icon: HeartIcon,
      color: 'from-primary-600 to-primary-700',
      bg: 'bg-primary-50',
      textColor: 'text-primary-600',
      subtitle: 'All doctors',
    },
    {
      title: 'Today\'s Appointments',
      value: stats.totalAppointmentsToday,
      icon: CalendarDaysIcon,
      color: 'from-success-600 to-success-700',
      bg: 'bg-success-50',
      textColor: 'text-success-600',
      subtitle: 'Scheduled today',
    },
    {
      title: 'Today\'s Patients',
      value: stats.totalPatientsToday,
      icon: UsersIcon,
      color: 'from-purple-600 to-purple-700',
      bg: 'bg-purple-50',
      textColor: 'text-purple-600',
      subtitle: 'Unique patients',
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: CurrencyDollarIcon,
      color: 'from-warning-600 to-warning-700',
      bg: 'bg-warning-50',
      textColor: 'text-warning-600',
      subtitle: 'All time',
    },
    {
      title: 'Confirmed',
      value: stats.confirmedAppointments,
      icon: CheckCircleIcon,
      color: 'from-green-600 to-green-700',
      bg: 'bg-green-50',
      textColor: 'text-green-600',
      subtitle: 'Confirmed',
    },
    {
      title: 'Pending',
      value: stats.pendingAppointments,
      icon: ClockIcon,
      color: 'from-yellow-600 to-yellow-700',
      bg: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      subtitle: 'Awaiting',
    },
    {
      title: 'Completed',
      value: stats.completedAppointments,
      icon: CheckCircleIcon,
      color: 'from-blue-600 to-blue-700',
      bg: 'bg-blue-50',
      textColor: 'text-blue-600',
      subtitle: 'Finished',
    },
    {
      title: 'Cancelled',
      value: stats.cancelledAppointments,
      icon: XCircleIcon,
      color: 'from-red-600 to-red-700',
      bg: 'bg-red-50',
      textColor: 'text-red-600',
      subtitle: 'Cancelled',
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
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
              <h1 className="text-lg font-bold">Global Dashboard</h1>
            </div>
            <p className="text-xs text-primary-100">Overview of all appointments and statistics</p>
          </div>
          <button
            onClick={loadDashboardData}
            className="mt-2 sm:mt-0 bg-white text-primary-600 hover:bg-gray-50 rounded-lg px-2 py-1 text-xs font-medium transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {statsCards.map((stat, index) => (
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
      )}

      {/* Charts Section - All in one row */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Status Distribution Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm p-3 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <ChartBarIcon className="h-4 w-4 text-primary-600" />
                Status Distribution
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={true}
                  outerRadius={70}
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
          </motion.div>

          {/* Status Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-sm p-3 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <ChartBarIcon className="h-4 w-4 text-primary-600" />
                Status Comparison
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={statusBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" fontSize={10} />
                <YAxis stroke="#6B7280" fontSize={10} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #E5E7EB', 
                    borderRadius: '8px',
                    fontSize: '12px'
                  }} 
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {statusBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Doctor Performance */}
          {doctorPerformanceData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-lg shadow-sm p-3 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <ChartBarIcon className="h-4 w-4 text-primary-600" />
                  Top Doctors
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={doctorPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#6B7280" fontSize={9} angle={-15} textAnchor="end" height={60} />
                  <YAxis stroke="#6B7280" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #E5E7EB', 
                      borderRadius: '8px',
                      fontSize: '12px'
                    }} 
                  />
                  <Bar dataKey="appointments" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </div>
      )}

      {/* Additional Charts Row */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Doctor Revenue Chart */}
          {doctorRevenueData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-lg shadow-sm p-3 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <ChartBarIcon className="h-4 w-4 text-primary-600" />
                  Top Doctors Revenue
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={doctorRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#6B7280" fontSize={9} angle={-15} textAnchor="end" height={60} />
                  <YAxis stroke="#6B7280" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #E5E7EB', 
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value: number) => `$${value.toFixed(2)}`}
                  />
                  <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Appointment Trends */}
          {appointmentTrendsData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-lg shadow-sm p-3 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <ChartBarIcon className="h-4 w-4 text-primary-600" />
                  Appointment Trends (Last 7 Days)
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={appointmentTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="day" stroke="#6B7280" fontSize={10} />
                  <YAxis stroke="#6B7280" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #E5E7EB', 
                      borderRadius: '8px',
                      fontSize: '12px'
                    }} 
                  />
                  <Area type="monotone" dataKey="total" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="confirmed" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="completed" stackId="3" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('today')}
              className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'today'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Today's Appointments
            </button>
            <button
              onClick={() => setActiveTab('range')}
              className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'range'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Date Range
            </button>
            <button
              onClick={() => setActiveTab('doctors')}
              className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
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
        <div className="p-3">
          {/* Search Section */}
          {activeTab === 'today' && (
            <div className="mb-3 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex-1 min-w-[200px] relative">
                  <MagnifyingGlassIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by patient name, email, phone, token, or doctor name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={handleSearch}
                  className="px-3 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-xs font-medium"
                >
                  Search
                </button>
              </div>
            </div>
          )}

          {/* Date Range Section */}
          {activeTab === 'range' && (
            <div className="mb-3 space-y-2">
              <div className="flex flex-wrap items-end gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <button
                  onClick={handleDateRangeSearch}
                  className="px-3 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-xs font-medium"
                >
                  Search
                </button>
              </div>
            </div>
          )}

          {/* Doctor Stats Section */}
          {activeTab === 'doctors' && (
            <div className="mb-3">
              <div className="flex flex-wrap items-end gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Select Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      handleDoctorStatsDateChange(e.target.value);
                    }}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <button
                  onClick={() => {
                    setSelectedDate('');
                    handleDoctorStatsDateChange('');
                  }}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-xs"
                >
                  Reset
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <LoadingSpinner size="md" />
            </div>
          ) : (
            <>
              {/* Appointments List */}
              {(activeTab === 'today' || activeTab === 'range') && (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {todayAppointments.length === 0 ? (
                    <div className="text-center py-8">
                      <CalendarDaysIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 font-medium">No appointments found</p>
                    </div>
                  ) : (
                    todayAppointments.map((appointment, index) => (
                      <motion.div
                        key={appointment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <h3 className="text-sm font-bold text-gray-900 truncate">{appointment.patientName}</h3>
                              <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadgeClass(appointment.status)}`}>
                                {appointment.status}
                              </span>
                              <span className="text-xs text-gray-500">Token: {appointment.tokenNumber}</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 text-xs text-gray-600 mb-1.5">
                              <div className="flex items-center gap-1">
                                <HeartIcon className="h-3.5 w-3.5 text-primary-500 flex-shrink-0" />
                                <span className="truncate">{appointment.doctorName}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <BuildingOfficeIcon className="h-3.5 w-3.5 text-primary-500 flex-shrink-0" />
                                <span className="truncate">{appointment.clinicName}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <CalendarDaysIcon className="h-3.5 w-3.5 text-primary-500 flex-shrink-0" />
                                <span>{format(new Date(appointment.date), 'MMM dd, yyyy')}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <ClockIcon className="h-3.5 w-3.5 text-primary-500 flex-shrink-0" />
                                <span>{appointment.time}</span>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 space-x-1.5">
                              <span>Email: {appointment.patientEmail}</span>
                              <span>|</span>
                              <span>Phone: {appointment.patientPhone}</span>
                              {appointment.doctorFee && (
                                <>
                                  <span>|</span>
                                  <span className="font-semibold text-gray-900">Fee: ${appointment.doctorFee}</span>
                                </>
                              )}
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
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {doctorStats.length === 0 ? (
                    <div className="text-center py-8">
                      <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 font-medium">No doctor statistics found</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {doctorStats.map((doctor, index) => (
                        <motion.div
                          key={doctor.doctorId}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ y: -2 }}
                          className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:shadow-sm transition-all"
                        >
                          <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                            <HeartIcon className="h-4 w-4 text-primary-600" />
                            <span className="truncate">{doctor.doctorName}</span>
                          </h3>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <p className="text-gray-600 mb-0.5">Total</p>
                              <p className="text-base font-bold text-gray-900">{doctor.totalAppointments}</p>
                            </div>
                            <div>
                              <p className="text-gray-600 mb-0.5">Confirmed</p>
                              <p className="text-base font-bold text-green-600">{doctor.confirmedAppointments}</p>
                            </div>
                            <div>
                              <p className="text-gray-600 mb-0.5">Completed</p>
                              <p className="text-base font-bold text-blue-600">{doctor.completedAppointments}</p>
                            </div>
                            <div>
                              <p className="text-gray-600 mb-0.5">Revenue</p>
                              <p className="text-base font-bold text-yellow-600">${doctor.totalRevenue.toFixed(2)}</p>
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
    </motion.div>
  );
};

export default GlobalDashboardPage;

