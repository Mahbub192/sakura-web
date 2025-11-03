import React, { useEffect, useState } from 'react';
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
  CheckCircleIcon,
  ArrowRightIcon,
  EyeIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchAppointments } from '../../store/slices/appointmentSlice';
import { fetchDoctors, checkDoctorProfileExists } from '../../store/slices/doctorSlice';
import { fetchMyAppointments, fetchUpcomingAppointments } from '../../store/slices/patientSlice';
import { checkAssistantProfileExists } from '../../store/slices/assistantSlice';
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
    whileHover={{ scale: 1.03, y: -4 }}
    transition={{ duration: 0.2 }}
    onClick={onClick}
    className={`bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer ${onClick ? 'hover:border-primary-300' : ''}`}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
        {trend && (
          <div className="flex items-center mt-2">
            <TrendingUpIcon className="h-4 w-4 text-success-500 mr-1" />
            <span className="text-sm font-medium text-success-600">{trend}</span>
          </div>
        )}
      </div>
      <div className={`${bgColor} p-4 rounded-xl`}>
        <Icon className={`h-7 w-7 ${color}`} />
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
        ]);
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

  return (
    <div className="space-y-6 pb-8">
      {/* Welcome Header */}
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
              <h1 className="text-4xl font-bold">{getWelcomeMessage()}</h1>
            </div>
            <p className="text-xl text-primary-100">
              {isAdmin && "Manage your healthcare system efficiently"}
              {isDoctor && "Ready to help your patients today"}
              {isAssistant && "Support your doctor and manage appointments"}
              {!isAdmin && !isDoctor && !isAssistant && "Book your next appointment easily"}
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <SparklesIcon className="h-6 w-6 text-primary-600" />
            Quick Actions
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isAdmin && (
            <>
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/appointments')}
                className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 text-left border border-blue-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-600 p-3 rounded-lg group-hover:scale-110 transition-transform">
                    <CalendarIcon className="h-6 w-6 text-white" />
                  </div>
                  <ArrowRightIcon className="h-5 w-5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Manage Appointments</h3>
                <p className="text-sm text-gray-600">View and manage all appointments</p>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/doctors')}
                className="group p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all duration-300 text-left border border-green-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-600 p-3 rounded-lg group-hover:scale-110 transition-transform">
                    <HeartIcon className="h-6 w-6 text-white" />
                  </div>
                  <ArrowRightIcon className="h-5 w-5 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Manage Doctors</h3>
                <p className="text-sm text-gray-600">Add and manage doctors</p>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/patients')}
                className="group p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all duration-300 text-left border border-purple-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-purple-600 p-3 rounded-lg group-hover:scale-110 transition-transform">
                    <ChartBarIcon className="h-6 w-6 text-white" />
                  </div>
                  <ArrowRightIcon className="h-5 w-5 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">View Reports</h3>
                <p className="text-sm text-gray-600">System analytics and reports</p>
              </motion.button>
            </>
          )}
          
          {(isDoctor || isAssistant) && (
            <>
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/appointments')}
                className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 text-left border border-blue-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-600 p-3 rounded-lg group-hover:scale-110 transition-transform">
                    <CalendarIcon className="h-6 w-6 text-white" />
                  </div>
                  <ArrowRightIcon className="h-5 w-5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Today's Schedule</h3>
                <p className="text-sm text-gray-600">View today's appointments</p>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/patients')}
                className="group p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all duration-300 text-left border border-green-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-600 p-3 rounded-lg group-hover:scale-110 transition-transform">
                    <UserGroupIcon className="h-6 w-6 text-white" />
                  </div>
                  <ArrowRightIcon className="h-5 w-5 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Patient List</h3>
                <p className="text-sm text-gray-600">Manage patient appointments</p>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/appointments')}
                className="group p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl hover:from-orange-100 hover:to-orange-200 transition-all duration-300 text-left border border-orange-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-orange-600 p-3 rounded-lg group-hover:scale-110 transition-transform">
                    <PlusCircleIcon className="h-6 w-6 text-white" />
                  </div>
                  <ArrowRightIcon className="h-5 w-5 text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Create Slot</h3>
                <p className="text-sm text-gray-600">Add new appointment slots</p>
              </motion.button>
            </>
          )}
          
          {isPatient && (
            <>
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/patients/book')}
                className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 text-left border border-blue-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-600 p-3 rounded-lg group-hover:scale-110 transition-transform">
                    <CalendarIcon className="h-6 w-6 text-white" />
                  </div>
                  <ArrowRightIcon className="h-5 w-5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Book Appointment</h3>
                <p className="text-sm text-gray-600">Schedule your next visit</p>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/patients')}
                className="group p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all duration-300 text-left border border-green-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-600 p-3 rounded-lg group-hover:scale-110 transition-transform">
                    <EyeIcon className="h-6 w-6 text-white" />
                  </div>
                  <ArrowRightIcon className="h-5 w-5 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">My Appointments</h3>
                <p className="text-sm text-gray-600">View all my appointments</p>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/book-appointment')}
                className="group p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all duration-300 text-left border border-purple-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-purple-600 p-3 rounded-lg group-hover:scale-110 transition-transform">
                    <HeartIcon className="h-6 w-6 text-white" />
                  </div>
                  <ArrowRightIcon className="h-5 w-5 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Find Doctors</h3>
                <p className="text-sm text-gray-600">Browse available doctors</p>
              </motion.button>
            </>
          )}
          
          {!isAdmin && !isDoctor && !isAssistant && !isPatient && (
            <>
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/book-appointment')}
                className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 text-left border border-blue-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-600 p-3 rounded-lg group-hover:scale-110 transition-transform">
                    <CalendarIcon className="h-6 w-6 text-white" />
                  </div>
                  <ArrowRightIcon className="h-5 w-5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Book Appointment</h3>
                <p className="text-sm text-gray-600">Schedule your next visit</p>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/book-appointment')}
                className="group p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all duration-300 text-left border border-green-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-600 p-3 rounded-lg group-hover:scale-110 transition-transform">
                    <HeartIcon className="h-6 w-6 text-white" />
                  </div>
                  <ArrowRightIcon className="h-5 w-5 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Find Doctors</h3>
                <p className="text-sm text-gray-600">Browse available doctors</p>
              </motion.button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
