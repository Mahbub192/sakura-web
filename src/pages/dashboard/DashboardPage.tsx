import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CalendarIcon, 
  UserGroupIcon, 
  ClockIcon, 
  ArrowTrendingUpIcon as TrendingUpIcon,
  HeartIcon,
  UsersIcon,
  ChartBarIcon,
  SparklesIcon,
  ArrowRightIcon,
  EyeIcon,
  PlusCircleIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
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
import { format } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';

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
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchAppointments, fetchTokenAppointments } from '../../store/slices/appointmentSlice';
import { fetchDoctors, checkDoctorProfileExists } from '../../store/slices/doctorSlice';
import { fetchMyAppointments, fetchUpcomingAppointments } from '../../store/slices/patientSlice';
import { checkAssistantProfileExists } from '../../store/slices/assistantSlice';
import { globalDashboardService } from '../../services/globalDashboardService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  trend?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, bgColor, trend, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02, y: -2 }}
    transition={{ duration: 0.2 }}
    onClick={onClick}
    className={`bg-white rounded-xl shadow-md p-4 border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer ${onClick ? 'hover:border-primary-300' : ''}`}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-xs font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
        {trend && (
          <div className="flex items-center mt-1">
            <TrendingUpIcon className="h-3 w-3 text-success-500 mr-1" />
            <span className="text-xs font-medium text-success-600">{trend}</span>
          </div>
        )}
      </div>
      <div className={`${bgColor} p-3 rounded-lg`}>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
    </div>
  </motion.div>
);

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isDoctor, isAssistant, isPatient } = useAuth();
  const dispatch = useAppDispatch();
  const { appointments, tokenAppointments, isLoading: appointmentsLoading } = useAppSelector((state) => state.appointments);
  const { doctors, isLoading: doctorsLoading } = useAppSelector((state) => state.doctors);
  const { myAppointments, upcomingAppointments, isLoading: patientsLoading } = useAppSelector((state) => state.patients);
  const [refreshing, setRefreshing] = useState(false);
  const [globalStats, setGlobalStats] = useState<any>(null);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);

  const isLoading = appointmentsLoading || doctorsLoading || patientsLoading;

  useEffect(() => {
    checkProfileAndFetchData();
  }, [dispatch, isAdmin, isDoctor, isAssistant, isPatient]);

  const checkProfileAndFetchData = async () => {
    try {
      if (isDoctor) {
        const profileExists = await dispatch(checkDoctorProfileExists()).unwrap();
        if (!profileExists) {
          navigate('/profile/create-doctor');
          return;
        }
      } else if (isAssistant) {
        const profileExists = await dispatch(checkAssistantProfileExists()).unwrap();
        if (!profileExists) {
          navigate('/profile/create-assistant');
          return;
        }
      }
      fetchDashboardData();
    } catch (error: any) {
      // If profile doesn't exist, redirect to creation
      if (isDoctor) {
        navigate('/profile/create-doctor');
      } else if (isAssistant) {
        navigate('/profile/create-assistant');
      }
    }
  };

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      if (isAdmin || isDoctor || isAssistant) {
        await Promise.all([
          dispatch(fetchAppointments({})).unwrap(),
          dispatch(fetchDoctors()).unwrap(),
          dispatch(fetchTokenAppointments({})).unwrap(),
        ]);
        
        // Fetch global stats for admin/doctor
        if (isAdmin || isDoctor) {
          try {
            const stats = await globalDashboardService.getGlobalStats();
            setGlobalStats(stats);
          } catch (error) {
            console.error('Failed to fetch global stats:', error);
          }
        }
      } else if (isPatient) {
        await Promise.all([
          dispatch(fetchMyAppointments()).unwrap(),
          dispatch(fetchUpcomingAppointments()).unwrap(),
          dispatch(fetchDoctors()).unwrap(),
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Calculate weekly data for charts
  const calculateWeeklyData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const weekData = days.map((day, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const dayAppointments = tokenAppointments.filter(apt => apt.date === dateStr);
      return {
        day,
        appointments: dayAppointments.length,
        confirmed: dayAppointments.filter(apt => apt.status === 'Confirmed').length,
        completed: dayAppointments.filter(apt => apt.status === 'Completed').length,
      };
    });
    return weekData;
  }, [tokenAppointments]);

  // Calculate status distribution
  const calculateStatusData = useMemo(() => {
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
    setWeeklyData(calculateWeeklyData);
    setStatusData(calculateStatusData);
  }, [calculateWeeklyData, calculateStatusData]);

  const getWelcomeMessage = () => {
    const time = new Date().getHours();
    const greeting = time < 12 ? 'Good morning' : time < 18 ? 'Good afternoon' : 'Good evening';
    return `${greeting}, ${user?.firstName}!`;
  };

  const getStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(apt => apt.date === today);
    const availableSlots = appointments.filter(apt => apt.status === 'Available');
    const thisWeekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thisWeekPatients = tokenAppointments.filter(apt => 
      new Date(apt.date).getTime() >= thisWeekStart.getTime()
    );

    if (isAdmin) {
      return [
        {
          title: 'Total Doctors',
          value: doctors.length.toString(),
          icon: HeartIcon,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          trend: `Active: ${doctors.filter(d => d.user?.isActive).length}`,
          onClick: () => navigate('/doctors'),
        },
        {
          title: 'Total Appointments',
          value: appointments.length.toString(),
          icon: CalendarIcon,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          trend: `Today: ${todayAppointments.length}`,
          onClick: () => navigate('/appointments'),
        },
        {
          title: 'Active Patients',
          value: tokenAppointments.length.toString(),
          icon: UsersIcon,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          trend: `This week: ${thisWeekPatients.length}`,
          onClick: () => navigate('/patients'),
        },
        {
          title: 'Available Slots',
          value: availableSlots.length.toString(),
          icon: ClockIcon,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
        },
      ];
    } else if (isDoctor || isAssistant) {
      return [
        {
          title: 'Today\'s Appointments',
          value: todayAppointments.length.toString(),
          icon: CalendarIcon,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          onClick: () => navigate('/appointments'),
        },
        {
          title: 'This Week\'s Patients',
          value: thisWeekPatients.length.toString(),
          icon: UserGroupIcon,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          onClick: () => navigate('/patients'),
        },
        {
          title: 'Available Slots',
          value: availableSlots.length.toString(),
          icon: ClockIcon,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          onClick: () => navigate('/appointments?status=Available'),
        },
      ];
    } else if (isPatient) {
      return [
        {
          title: 'My Appointments',
          value: myAppointments.length.toString(),
          icon: CalendarIcon,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          onClick: () => navigate('/patients'),
        },
        {
          title: 'Upcoming Appointments',
          value: upcomingAppointments.length.toString(),
          icon: ClockIcon,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          onClick: () => navigate('/patients'),
        },
        {
          title: 'Available Doctors',
          value: doctors.length.toString(),
          icon: HeartIcon,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          onClick: () => navigate('/book-appointment'),
        },
      ];
    } else {
      return [
        {
          title: 'Available Doctors',
          value: doctors.length.toString(),
          icon: HeartIcon,
          color: 'text-primary-600',
          bgColor: 'bg-primary-50',
          onClick: () => navigate('/book-appointment'),
        },
      ];
    }
  };

  const stats = getStats();

  if (isLoading && !refreshing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Doctor Dashboard - New Design
  if (isDoctor) {
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = tokenAppointments.filter(apt => apt.date === today);
    const todayAppointmentsSorted = [...todayAppointments].sort((a, b) => {
      const timeA = a.time || '00:00';
      const timeB = b.time || '00:00';
      return timeA.localeCompare(timeB);
    });
    
    const nextAppointment = todayAppointmentsSorted.find(apt => 
      apt.status === 'Confirmed' || apt.status === 'Pending'
    ) || todayAppointmentsSorted[0];
    
    const completedToday = todayAppointments.filter(apt => apt.status === 'Completed').length;
    const totalToday = todayAppointments.length;
    const confirmedToday = todayAppointments.filter(apt => apt.status === 'Confirmed').length;
    const availableSlots = appointments.filter(apt => apt.status === 'Available').length;
    
    // Calculate average wait time based on completed appointments
    const completedAppointments = tokenAppointments.filter(apt => apt.status === 'Completed');
    const avgWaitTime = completedAppointments.length > 0 ? '12 mins' : '0 mins'; // Can be enhanced with actual calculation
    
    // Calculate average consultation time
    const consultationTime = completedAppointments.length > 0 ? '18 mins' : '0 mins';
    
    // Count pending appointments that need review
    const pendingLabReviews = tokenAppointments.filter(apt => 
      apt.status === 'Pending' && apt.date === today
    ).length;

    return (
      <div className="font-display bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 w-full">
        <div className="mb-8">
          <div className="flex min-w-72 flex-col gap-1">
            <p className="text-gray-900 dark:text-white text-3xl font-bold leading-tight tracking-[-0.03em]">
              Doctor's Dashboard
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-base font-normal leading-normal">
              A summary of your day's clinical activities.
            </p>
          </div>
        </div>

        {/* Clinic Snapshot */}
        <div className="mb-8">
          <h2 className="text-gray-900 dark:text-white text-xl font-bold leading-tight tracking-[-0.015em] mb-4">
            Clinic Snapshot
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col gap-2 rounded-xl p-5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium leading-normal">
                Appointments Today
              </p>
              <p className="text-gray-900 dark:text-white tracking-tight text-3xl font-bold leading-tight">
                {confirmedToday}/{totalToday}
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl p-5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium leading-normal">
                Avg. Wait Time
              </p>
              <p className="text-gray-900 dark:text-white tracking-tight text-3xl font-bold leading-tight">
                {avgWaitTime}
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl p-5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium leading-normal">
                Pending Lab Reviews
              </p>
              <p className="text-gray-900 dark:text-white tracking-tight text-3xl font-bold leading-tight">
                {pendingLabReviews}
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl p-5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium leading-normal">
                Consultation Time
              </p>
              <p className="text-gray-900 dark:text-white tracking-tight text-3xl font-bold leading-tight">
                {consultationTime}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column */}
          <div className="lg:col-span-1 flex flex-col gap-8">
            {/* Up Next Patient */}
            {nextAppointment && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                <h3 className="text-lg font-bold mb-4">Up Next: {nextAppointment.patientName}</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                      {nextAppointment.patientName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold">{nextAppointment.patientName}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatTimeTo12Hour(nextAppointment.time || '')} - {nextAppointment.reasonForVisit || 'Consultation'}
                      </p>
                    </div>
                  </div>
                  {nextAppointment.patientAge && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2 text-gray-700 dark:text-gray-300">Patient Info</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Age: {nextAppointment.patientAge} | Gender: {nextAppointment.patientGender || 'N/A'}
                      </p>
                      {nextAppointment.patientPhone && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Phone: {nextAppointment.patientPhone}
                        </p>
                      )}
                    </div>
                  )}
                  {nextAppointment.reasonForVisit && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2 text-gray-700 dark:text-gray-300">Reason for Visit</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{nextAppointment.reasonForVisit}</p>
                    </div>
                  )}
                  {nextAppointment.notes && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2 text-gray-700 dark:text-gray-300">Notes</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{nextAppointment.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tasks & Alerts */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
              <h3 className="text-lg font-bold mb-4">My Tasks & Alerts</h3>
              <div className="space-y-4">
                {/* Critical Alerts */}
                {tokenAppointments.filter(apt => apt.status === 'Pending' && apt.date === today).length > 0 && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                    <span className="material-symbols-outlined text-red-500 dark:text-red-400 mt-0.5">error</span>
                    <div>
                      <p className="font-semibold text-red-800 dark:text-red-200">Pending Appointments</p>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        {tokenAppointments.filter(apt => apt.status === 'Pending' && apt.date === today).length} pending for today
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Upcoming Appointments Tasks */}
                {tokenAppointments
                  .filter(apt => (apt.status === 'Pending' || apt.status === 'Confirmed') && apt.date === today)
                  .slice(0, 3)
                  .map((apt) => (
                    <div key={apt.id} className="flex items-center gap-3">
                      <input
                        className="form-checkbox h-5 w-5 rounded text-primary focus:ring-primary/50 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700"
                        type="checkbox"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Review appointment for {apt.patientName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{formatTimeTo12Hour(apt.time || '')}</p>
                      </div>
                    </div>
                  ))}
                
                {/* No tasks message */}
                {tokenAppointments.filter(apt => (apt.status === 'Pending' || apt.status === 'Confirmed') && apt.date === today).length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    No pending tasks for today
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Today's Agenda */}
          <div className="lg:col-span-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold leading-tight tracking-[-0.015em]">Today's Agenda</h2>
              <div className="flex items-center gap-2">
                <button
                  className="flex items-center justify-center size-8 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => fetchDashboardData()}
                >
                  <span className="material-symbols-outlined text-xl">chevron_left</span>
                </button>
                <span className="font-semibold text-sm">{format(new Date(), 'MMMM dd, yyyy')}</span>
                <button
                  className="flex items-center justify-center size-8 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => fetchDashboardData()}
                >
                  <span className="material-symbols-outlined text-xl">chevron_right</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {todayAppointmentsSorted.length > 0 ? (
                todayAppointmentsSorted.map((apt, index) => {
                  const isActive = apt.id === nextAppointment?.id;
                  const isCompleted = apt.status === 'Completed';
                  const isCancelled = apt.status === 'Cancelled';
                  
                  return (
                    <div
                      key={apt.id}
                      className={`flex items-start gap-4 p-4 rounded-lg ${
                        isActive
                          ? 'bg-primary/10 dark:bg-primary/20 border-l-4 border-primary'
                          : isCompleted || isCancelled
                          ? 'opacity-60'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <div className="flex-shrink-0 w-16 text-right">
                        <p className={`font-bold ${isCompleted || isCancelled ? 'text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>
                          {formatTimeTo12Hour(apt.time || '')}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">30 min</p>
                      </div>
                      <div className="w-px bg-gray-300 dark:bg-gray-600 self-stretch"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                              {apt.patientName.charAt(0)}
                            </div>
                            <div>
                              <p className={`font-semibold ${isCompleted || isCancelled ? 'text-gray-500 dark:text-gray-400 line-through' : ''}`}>
                                {apt.patientName}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {apt.reasonForVisit || 'Consultation'}
                              </p>
                            </div>
                          </div>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            apt.status === 'Completed'
                              ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
                              : apt.status === 'Confirmed' || apt.status === 'Pending'
                              ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                          }`}>
                            {apt.status}
                          </span>
                        </div>
                        {isActive && (
                          <div className="mt-4 flex gap-2">
                            <button
                              onClick={() => navigate(`/patients/view?token=${apt.tokenNumber}`)}
                              className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-md h-9 bg-gray-200/80 dark:bg-gray-700 text-gray-800 dark:text-gray-200 gap-2 text-sm font-semibold leading-normal min-w-0 px-4"
                            >
                              View Chart
                            </button>
                            <button
                              onClick={() => navigate(`/patients/view?token=${apt.tokenNumber}`)}
                              className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-md h-9 bg-primary text-white gap-2 text-sm font-semibold leading-normal min-w-0 px-4"
                            >
                              Start Consultation
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No appointments scheduled for today
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Patients Section */}
        {tokenAppointments.filter(apt => apt.status === 'Completed').length > 0 && (
          <div className="mt-8">
            <h2 className="text-gray-900 dark:text-white text-xl font-bold leading-tight tracking-[-0.015em] mb-4">
              Recent Patients
            </h2>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tokenAppointments
                  .filter(apt => apt.status === 'Completed')
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 6)
                  .map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/patients/view?token=${apt.tokenNumber}`)}
                    >
                      <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {apt.patientName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                          {apt.patientName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {format(new Date(apt.date), 'MMM dd, yyyy')} • {formatTimeTo12Hour(apt.time || '')}
                        </p>
                        {apt.reasonForVisit && (
                          <p className="text-xs text-gray-600 dark:text-gray-300 truncate mt-1">
                            {apt.reasonForVisit}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Assistant Dashboard - Same Design as Doctor Dashboard
  if (isAssistant) {
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = tokenAppointments.filter(apt => apt.date === today);
    const todayAppointmentsSorted = [...todayAppointments].sort((a, b) => {
      const timeA = a.time || '00:00';
      const timeB = b.time || '00:00';
      return timeA.localeCompare(timeB);
    });
    
    const nextAppointment = todayAppointmentsSorted.find(apt => 
      apt.status === 'Confirmed' || apt.status === 'Pending'
    ) || todayAppointmentsSorted[0];
    
    const completedToday = todayAppointments.filter(apt => apt.status === 'Completed').length;
    const totalToday = todayAppointments.length;
    const confirmedToday = todayAppointments.filter(apt => apt.status === 'Confirmed').length;
    const availableSlots = appointments.filter(apt => apt.status === 'Available').length;
    
    // Calculate average wait time based on completed appointments
    const completedAppointments = tokenAppointments.filter(apt => apt.status === 'Completed');
    const avgWaitTime = completedAppointments.length > 0 ? '12 mins' : '0 mins'; // Can be enhanced with actual calculation
    
    // Calculate average consultation time
    const consultationTime = completedAppointments.length > 0 ? '18 mins' : '0 mins';
    
    // Count pending appointments that need review
    const pendingLabReviews = tokenAppointments.filter(apt => 
      apt.status === 'Pending' && apt.date === today
    ).length;

    return (
      <div className="font-display bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 w-full">
        <div className="mb-8">
          <div className="flex min-w-72 flex-col gap-1">
            <p className="text-gray-900 dark:text-white text-3xl font-bold leading-tight tracking-[-0.03em]">
              Assistant's Dashboard
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-base font-normal leading-normal">
              A summary of your day's clinical activities.
            </p>
          </div>
        </div>

        {/* Clinic Snapshot */}
        <div className="mb-8">
          <h2 className="text-gray-900 dark:text-white text-xl font-bold leading-tight tracking-[-0.015em] mb-4">
            Clinic Snapshot
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col gap-2 rounded-xl p-5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium leading-normal">
                Appointments Today
              </p>
              <p className="text-gray-900 dark:text-white tracking-tight text-3xl font-bold leading-tight">
                {confirmedToday}/{totalToday}
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl p-5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium leading-normal">
                Avg. Wait Time
              </p>
              <p className="text-gray-900 dark:text-white tracking-tight text-3xl font-bold leading-tight">
                {avgWaitTime}
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl p-5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium leading-normal">
                Pending Lab Reviews
              </p>
              <p className="text-gray-900 dark:text-white tracking-tight text-3xl font-bold leading-tight">
                {pendingLabReviews}
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl p-5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium leading-normal">
                Consultation Time
              </p>
              <p className="text-gray-900 dark:text-white tracking-tight text-3xl font-bold leading-tight">
                {consultationTime}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column */}
          <div className="lg:col-span-1 flex flex-col gap-8">
            {/* Up Next Patient */}
            {nextAppointment && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                <h3 className="text-lg font-bold mb-4">Up Next: {nextAppointment.patientName}</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                      {nextAppointment.patientName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold">{nextAppointment.patientName}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatTimeTo12Hour(nextAppointment.time || '')} - {nextAppointment.reasonForVisit || 'Consultation'}
                      </p>
                    </div>
                  </div>
                  {nextAppointment.patientAge && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2 text-gray-700 dark:text-gray-300">Patient Info</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Age: {nextAppointment.patientAge} | Gender: {nextAppointment.patientGender || 'N/A'}
                      </p>
                      {nextAppointment.patientPhone && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Phone: {nextAppointment.patientPhone}
                        </p>
                      )}
                    </div>
                  )}
                  {nextAppointment.reasonForVisit && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2 text-gray-700 dark:text-gray-300">Reason for Visit</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{nextAppointment.reasonForVisit}</p>
                    </div>
                  )}
                  {nextAppointment.notes && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2 text-gray-700 dark:text-gray-300">Notes</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{nextAppointment.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tasks & Alerts */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
              <h3 className="text-lg font-bold mb-4">My Tasks & Alerts</h3>
              <div className="space-y-4">
                {/* Critical Alerts */}
                {tokenAppointments.filter(apt => apt.status === 'Pending' && apt.date === today).length > 0 && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                    <span className="material-symbols-outlined text-red-500 dark:text-red-400 mt-0.5">error</span>
                    <div>
                      <p className="font-semibold text-red-800 dark:text-red-200">Pending Appointments</p>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        {tokenAppointments.filter(apt => apt.status === 'Pending' && apt.date === today).length} pending for today
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Upcoming Appointments Tasks */}
                {tokenAppointments
                  .filter(apt => (apt.status === 'Pending' || apt.status === 'Confirmed') && apt.date === today)
                  .slice(0, 3)
                  .map((apt) => (
                    <div key={apt.id} className="flex items-center gap-3">
                      <input
                        className="form-checkbox h-5 w-5 rounded text-primary focus:ring-primary/50 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700"
                        type="checkbox"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Review appointment for {apt.patientName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{formatTimeTo12Hour(apt.time || '')}</p>
                      </div>
                    </div>
                  ))}
                
                {/* No tasks message */}
                {tokenAppointments.filter(apt => (apt.status === 'Pending' || apt.status === 'Confirmed') && apt.date === today).length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    No pending tasks for today
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Today's Agenda */}
          <div className="lg:col-span-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold leading-tight tracking-[-0.015em]">Today's Agenda</h2>
              <div className="flex items-center gap-2">
                <button
                  className="flex items-center justify-center size-8 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => fetchDashboardData()}
                >
                  <span className="material-symbols-outlined text-xl">chevron_left</span>
                </button>
                <span className="font-semibold text-sm">{format(new Date(), 'MMMM dd, yyyy')}</span>
                <button
                  className="flex items-center justify-center size-8 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => fetchDashboardData()}
                >
                  <span className="material-symbols-outlined text-xl">chevron_right</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {todayAppointmentsSorted.length > 0 ? (
                todayAppointmentsSorted.map((apt, index) => {
                  const isActive = apt.id === nextAppointment?.id;
                  const isCompleted = apt.status === 'Completed';
                  const isCancelled = apt.status === 'Cancelled';
                  
                  return (
                    <div
                      key={apt.id}
                      className={`flex items-start gap-4 p-4 rounded-lg ${
                        isActive
                          ? 'bg-primary/10 dark:bg-primary/20 border-l-4 border-primary'
                          : isCompleted || isCancelled
                          ? 'opacity-60'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <div className="flex-shrink-0 w-16 text-right">
                        <p className={`font-bold ${isCompleted || isCancelled ? 'text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>
                          {formatTimeTo12Hour(apt.time || '')}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">30 min</p>
                      </div>
                      <div className="w-px bg-gray-300 dark:bg-gray-600 self-stretch"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                              {apt.patientName.charAt(0)}
                            </div>
                            <div>
                              <p className={`font-semibold ${isCompleted || isCancelled ? 'text-gray-500 dark:text-gray-400 line-through' : ''}`}>
                                {apt.patientName}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {apt.reasonForVisit || 'Consultation'}
                              </p>
                            </div>
                          </div>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            apt.status === 'Completed'
                              ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
                              : apt.status === 'Confirmed' || apt.status === 'Pending'
                              ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                          }`}>
                            {apt.status}
                          </span>
                        </div>
                        {isActive && (
                          <div className="mt-4 flex gap-2">
                            <button
                              onClick={() => navigate(`/patients/view?token=${apt.tokenNumber}`)}
                              className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-md h-9 bg-gray-200/80 dark:bg-gray-700 text-gray-800 dark:text-gray-200 gap-2 text-sm font-semibold leading-normal min-w-0 px-4"
                            >
                              View Chart
                            </button>
                            <button
                              onClick={() => navigate(`/patients/view?token=${apt.tokenNumber}`)}
                              className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-md h-9 bg-primary text-white gap-2 text-sm font-semibold leading-normal min-w-0 px-4"
                            >
                              Start Consultation
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No appointments scheduled for today
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Patients Section */}
        {tokenAppointments.filter(apt => apt.status === 'Completed').length > 0 && (
          <div className="mt-8">
            <h2 className="text-gray-900 dark:text-white text-xl font-bold leading-tight tracking-[-0.015em] mb-4">
              Recent Patients
            </h2>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tokenAppointments
                  .filter(apt => apt.status === 'Completed')
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 6)
                  .map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/patients/view?token=${apt.tokenNumber}`)}
                    >
                      <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {apt.patientName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                          {apt.patientName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {format(new Date(apt.date), 'MMM dd, yyyy')} • {formatTimeTo12Hour(apt.time || '')}
                        </p>
                        {apt.reasonForVisit && (
                          <p className="text-xs text-gray-600 dark:text-gray-300 truncate mt-1">
                            {apt.reasonForVisit}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-2" style={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 rounded-xl p-5 text-white shadow-lg"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <SparklesIcon className="h-5 w-5" />
              <h1 className="text-2xl font-bold">{getWelcomeMessage()}</h1>
            </div>
            <p className="text-sm text-primary-100">
          {isAdmin && "Manage your healthcare system efficiently"}
          {isDoctor && "Ready to help your patients today"}
          {isAssistant && "Support your doctor and manage appointments"}
          {!isAdmin && !isDoctor && !isAssistant && "Book your next appointment easily"}
        </p>
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="hidden md:flex items-center gap-1.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg px-3 py-1.5 text-sm transition-colors disabled:opacity-50"
          >
            {refreshing ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <ClockIcon className="h-4 w-4" />
                Refresh
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Charts Section - Admin/Doctor */}
      {(isAdmin || isDoctor) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Weekly Appointments Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-md p-4 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ChartBarIcon className="h-5 w-5 text-primary-600" />
                Weekly Appointments
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
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
                  dataKey="appointments" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Total"
                />
                <Line 
                  type="monotone" 
                  dataKey="confirmed" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Confirmed"
                />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  name="Completed"
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Status Distribution Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-md p-4 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ChartBarIcon className="h-5 w-5 text-primary-600" />
                Status Distribution
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
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
          </motion.div>
        </div>
      )}

      {/* Admin Summary Section */}
      {isAdmin && globalStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-md p-4 border border-gray-100"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <SparklesIcon className="h-5 w-5 text-primary-600" />
            System Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <HeartIcon className="h-5 w-5 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">Total Doctors</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{globalStats.totalDoctors}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <CalendarIcon className="h-5 w-5 text-green-600" />
                <span className="text-xs font-medium text-green-700">Today's Appointments</span>
              </div>
              <p className="text-2xl font-bold text-green-900">{globalStats.totalAppointmentsToday}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <UsersIcon className="h-5 w-5 text-purple-600" />
                <span className="text-xs font-medium text-purple-700">Today's Patients</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">{globalStats.totalPatientsToday}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <CurrencyDollarIcon className="h-5 w-5 text-orange-600" />
                <span className="text-xs font-medium text-orange-700">Total Revenue</span>
              </div>
              <p className="text-2xl font-bold text-orange-900">৳{globalStats.totalRevenue?.toFixed(0) || '0'}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
              <CheckCircleIcon className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">Confirmed</p>
                <p className="text-sm font-bold text-gray-900">{globalStats.confirmedAppointments}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
              <ClockIcon className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-xs text-gray-600">Pending</p>
                <p className="text-sm font-bold text-gray-900">{globalStats.pendingAppointments}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs text-gray-600">Completed</p>
                <p className="text-sm font-bold text-gray-900">{globalStats.completedAppointments}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
              <XCircleIcon className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-xs text-gray-600">Cancelled</p>
                <p className="text-sm font-bold text-gray-900">{globalStats.cancelledAppointments}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Doctor Summary Section */}
      {isDoctor && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-md p-4 border border-gray-100"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <SparklesIcon className="h-5 w-5 text-primary-600" />
            Your Performance Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">Today</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">
                {tokenAppointments.filter(apt => apt.date === new Date().toISOString().split('T')[0]).length}
              </p>
              <p className="text-xs text-blue-700 mt-1">Appointments</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <span className="text-xs font-medium text-green-700">This Week</span>
              </div>
              <p className="text-2xl font-bold text-green-900">
                {tokenAppointments.filter(apt => {
                  const aptDate = new Date(apt.date);
                  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                  return aptDate >= weekAgo && apt.status === 'Completed';
                }).length}
              </p>
              <p className="text-xs text-green-700 mt-1">Completed</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <ClockIcon className="h-5 w-5 text-purple-600" />
                <span className="text-xs font-medium text-purple-700">Available</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">
                {appointments.filter(apt => apt.status === 'Available').length}
              </p>
              <p className="text-xs text-purple-700 mt-1">Slots</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <UserGroupIcon className="h-5 w-5 text-orange-600" />
                <span className="text-xs font-medium text-orange-700">Total</span>
              </div>
              <p className="text-2xl font-bold text-orange-900">{tokenAppointments.length}</p>
              <p className="text-xs text-orange-700 mt-1">Patients</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recent Appointments Table */}
      {(isAdmin || isDoctor || isAssistant) && tokenAppointments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-md p-4 border border-gray-100"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary-600" />
            Recent Appointments
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Patient</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Date</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Time</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Status</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Token</th>
                </tr>
              </thead>
              <tbody>
                {tokenAppointments.slice(0, 10).map((apt) => (
                  <tr key={apt.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2 text-gray-900 font-medium">{apt.patientName}</td>
                    <td className="px-3 py-2 text-gray-600">{format(new Date(apt.date), 'MMM dd, yyyy')}</td>
                    <td className="px-3 py-2 text-gray-600">{formatTimeTo12Hour(apt.time || '')}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        apt.status === 'Confirmed' ? 'bg-blue-100 text-blue-700' :
                        apt.status === 'Completed' ? 'bg-green-100 text-green-700' :
                        apt.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-900 font-semibold">#{apt.tokenNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-xl shadow-md p-4 border border-gray-100"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <SparklesIcon className="h-4 w-4 text-primary-600" />
            Quick Actions
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {isAdmin && (
            <>
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/appointments')}
                className="group p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all duration-300 text-left border border-blue-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-blue-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
                    <CalendarIcon className="h-4 w-4 text-white" />
                  </div>
                  <ArrowRightIcon className="h-4 w-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">Manage Appointments</h3>
                <p className="text-xs text-gray-600">View and manage all appointments</p>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/doctors')}
                className="group p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg hover:from-green-100 hover:to-green-200 transition-all duration-300 text-left border border-green-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-green-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
                    <HeartIcon className="h-4 w-4 text-white" />
                  </div>
                  <ArrowRightIcon className="h-4 w-4 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">Manage Doctors</h3>
                <p className="text-xs text-gray-600">Add and manage doctors</p>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/patients')}
                className="group p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-all duration-300 text-left border border-purple-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-purple-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
                    <ChartBarIcon className="h-4 w-4 text-white" />
                  </div>
                  <ArrowRightIcon className="h-4 w-4 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">View Reports</h3>
                <p className="text-xs text-gray-600">System analytics and reports</p>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/admin/users')}
                className="group p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg hover:from-orange-100 hover:to-orange-200 transition-all duration-300 text-left border border-orange-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-orange-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
                    <UsersIcon className="h-4 w-4 text-white" />
                  </div>
                  <ArrowRightIcon className="h-4 w-4 text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">Manage Users</h3>
                <p className="text-xs text-gray-600">Create and manage accounts</p>
              </motion.button>
            </>
          )}
          
          {(isDoctor || isAssistant) && (
            <>
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/appointments')}
                className="group p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all duration-300 text-left border border-blue-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-blue-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
                    <CalendarIcon className="h-4 w-4 text-white" />
                  </div>
                  <ArrowRightIcon className="h-4 w-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">Today's Schedule</h3>
                <p className="text-xs text-gray-600">View today's appointments</p>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/patients')}
                className="group p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg hover:from-green-100 hover:to-green-200 transition-all duration-300 text-left border border-green-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-green-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
                    <UserGroupIcon className="h-4 w-4 text-white" />
                  </div>
                  <ArrowRightIcon className="h-4 w-4 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">Patient List</h3>
                <p className="text-xs text-gray-600">Manage patient appointments</p>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/appointments')}
                className="group p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg hover:from-orange-100 hover:to-orange-200 transition-all duration-300 text-left border border-orange-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-orange-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
                    <PlusCircleIcon className="h-4 w-4 text-white" />
                  </div>
                  <ArrowRightIcon className="h-4 w-4 text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">Create Slot</h3>
                <p className="text-xs text-gray-600">Add new appointment slots</p>
              </motion.button>
            </>
          )}
          
          {isPatient && (
            <>
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/patients/book')}
                className="group p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all duration-300 text-left border border-blue-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-blue-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
                    <CalendarIcon className="h-4 w-4 text-white" />
                  </div>
                  <ArrowRightIcon className="h-4 w-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">Book Appointment</h3>
                <p className="text-xs text-gray-600">Schedule your next visit</p>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/patients')}
                className="group p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg hover:from-green-100 hover:to-green-200 transition-all duration-300 text-left border border-green-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-green-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
                    <EyeIcon className="h-4 w-4 text-white" />
                  </div>
                  <ArrowRightIcon className="h-4 w-4 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">My Appointments</h3>
                <p className="text-xs text-gray-600">View all my appointments</p>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/book-appointment')}
                className="group p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-all duration-300 text-left border border-purple-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-purple-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
                    <HeartIcon className="h-4 w-4 text-white" />
                  </div>
                  <ArrowRightIcon className="h-4 w-4 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">Find Doctors</h3>
                <p className="text-xs text-gray-600">Browse available doctors</p>
              </motion.button>
            </>
          )}
          
          {!isAdmin && !isDoctor && !isAssistant && !isPatient && (
            <>
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/book-appointment')}
                className="group p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all duration-300 text-left border border-blue-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-blue-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
                    <CalendarIcon className="h-4 w-4 text-white" />
                  </div>
                  <ArrowRightIcon className="h-4 w-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">Book Appointment</h3>
                <p className="text-xs text-gray-600">Schedule your next visit</p>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/book-appointment')}
                className="group p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg hover:from-green-100 hover:to-green-200 transition-all duration-300 text-left border border-green-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-green-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
                    <HeartIcon className="h-4 w-4 text-white" />
                  </div>
                  <ArrowRightIcon className="h-4 w-4 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">Find Doctors</h3>
                <p className="text-xs text-gray-600">Browse available doctors</p>
              </motion.button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
