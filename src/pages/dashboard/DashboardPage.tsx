import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CalendarIcon, 
  UserGroupIcon, 
  ClockIcon, 
  ArrowTrendingUpIcon as TrendingUpIcon,
  HeartIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchAppointments } from '../../store/slices/appointmentSlice';
import { fetchDoctors } from '../../store/slices/doctorSlice';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<any>;
  color: string;
  trend?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, trend }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02 }}
    className="bg-white rounded-xl shadow-soft p-6 border border-gray-200"
  >
    <div className="flex items-center">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="ml-4 flex-1">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend && (
          <div className="flex items-center mt-1">
            <TrendingUpIcon className="h-4 w-4 text-success-500 mr-1" />
            <span className="text-sm text-success-600">{trend}</span>
          </div>
        )}
      </div>
    </div>
  </motion.div>
);

const DashboardPage: React.FC = () => {
  const { user, isAdmin, isDoctor, isAssistant } = useAuth();
  const dispatch = useAppDispatch();
  const { appointments, tokenAppointments } = useAppSelector((state) => state.appointments);
  const { doctors } = useAppSelector((state) => state.doctors);

  useEffect(() => {
    // Fetch data based on user role
    if (isAdmin || isDoctor || isAssistant) {
      dispatch(fetchAppointments({}));
      dispatch(fetchDoctors());
    }
  }, [dispatch, isAdmin, isDoctor, isAssistant]);

  const getWelcomeMessage = () => {
    const time = new Date().getHours();
    const greeting = time < 12 ? 'Good morning' : time < 18 ? 'Good afternoon' : 'Good evening';
    return `${greeting}, ${user?.firstName}!`;
  };

  const getStats = () => {
    if (isAdmin) {
      return [
        {
          title: 'Total Doctors',
          value: doctors.length.toString(),
          icon: HeartIcon,
          color: 'bg-primary-600',
          trend: '+12% from last month',
        },
        {
          title: 'Total Appointments',
          value: appointments.length.toString(),
          icon: CalendarIcon,
          color: 'bg-success-600',
          trend: '+8% from last week',
        },
        {
          title: 'Active Patients',
          value: tokenAppointments.length.toString(),
          icon: UsersIcon,
          color: 'bg-secondary-600',
          trend: '+15% from last month',
        },
        {
          title: 'Available Slots',
          value: appointments.filter(apt => apt.status === 'Available').length.toString(),
          icon: ClockIcon,
          color: 'bg-warning-600',
        },
      ];
    } else if (isDoctor || isAssistant) {
      return [
        {
          title: 'Today\'s Appointments',
          value: appointments.filter(apt => apt.date === new Date().toISOString().split('T')[0]).length.toString(),
          icon: CalendarIcon,
          color: 'bg-primary-600',
        },
        {
          title: 'This Week\'s Patients',
          value: tokenAppointments.filter(apt => 
            new Date(apt.date).getTime() >= Date.now() - 7 * 24 * 60 * 60 * 1000
          ).length.toString(),
          icon: UserGroupIcon,
          color: 'bg-success-600',
        },
        {
          title: 'Available Slots',
          value: appointments.filter(apt => apt.status === 'Available').length.toString(),
          icon: ClockIcon,
          color: 'bg-secondary-600',
        },
      ];
    } else {
      return [
        {
          title: 'My Appointments',
          value: '2',
          icon: CalendarIcon,
          color: 'bg-primary-600',
        },
        {
          title: 'Available Doctors',
          value: doctors.length.toString(),
          icon: HeartIcon,
          color: 'bg-success-600',
        },
      ];
    }
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl p-6 text-white"
      >
        <h1 className="text-3xl font-bold mb-2">{getWelcomeMessage()}</h1>
        <p className="text-primary-100">
          {isAdmin && "Manage your healthcare system efficiently"}
          {isDoctor && "Ready to help your patients today"}
          {isAssistant && "Support your doctor and manage appointments"}
          {!isAdmin && !isDoctor && !isAssistant && "Book your next appointment easily"}
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        className="bg-white rounded-xl shadow-soft p-6 border border-gray-200"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {isAdmin && (
            <>
              <button className="p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors text-left">
                <CalendarIcon className="h-8 w-8 text-primary-600 mb-2" />
                <h3 className="font-medium text-gray-900">Manage Appointments</h3>
                <p className="text-sm text-gray-600">View and manage all appointments</p>
              </button>
              <button className="p-4 bg-success-50 rounded-lg hover:bg-success-100 transition-colors text-left">
                <HeartIcon className="h-8 w-8 text-success-600 mb-2" />
                <h3 className="font-medium text-gray-900">Add Doctor</h3>
                <p className="text-sm text-gray-600">Register new doctors</p>
              </button>
              <button className="p-4 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors text-left">
                <UsersIcon className="h-8 w-8 text-secondary-600 mb-2" />
                <h3 className="font-medium text-gray-900">View Reports</h3>
                <p className="text-sm text-gray-600">System analytics and reports</p>
              </button>
            </>
          )}
          
          {(isDoctor || isAssistant) && (
            <>
              <button className="p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors text-left">
                <CalendarIcon className="h-8 w-8 text-primary-600 mb-2" />
                <h3 className="font-medium text-gray-900">Today's Schedule</h3>
                <p className="text-sm text-gray-600">View today's appointments</p>
              </button>
              <button className="p-4 bg-success-50 rounded-lg hover:bg-success-100 transition-colors text-left">
                <UserGroupIcon className="h-8 w-8 text-success-600 mb-2" />
                <h3 className="font-medium text-gray-900">Patient List</h3>
                <p className="text-sm text-gray-600">Manage patient appointments</p>
              </button>
              <button className="p-4 bg-warning-50 rounded-lg hover:bg-warning-100 transition-colors text-left">
                <ClockIcon className="h-8 w-8 text-warning-600 mb-2" />
                <h3 className="font-medium text-gray-900">Create Slot</h3>
                <p className="text-sm text-gray-600">Add new appointment slots</p>
              </button>
            </>
          )}
          
          {!isAdmin && !isDoctor && !isAssistant && (
            <>
              <button className="p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors text-left">
                <CalendarIcon className="h-8 w-8 text-primary-600 mb-2" />
                <h3 className="font-medium text-gray-900">Book Appointment</h3>
                <p className="text-sm text-gray-600">Schedule your next visit</p>
              </button>
              <button className="p-4 bg-success-50 rounded-lg hover:bg-success-100 transition-colors text-left">
                <HeartIcon className="h-8 w-8 text-success-600 mb-2" />
                <h3 className="font-medium text-gray-900">Find Doctors</h3>
                <p className="text-sm text-gray-600">Browse available doctors</p>
              </button>
              <button className="p-4 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors text-left">
                <UserGroupIcon className="h-8 w-8 text-secondary-600 mb-2" />
                <h3 className="font-medium text-gray-900">My History</h3>
                <p className="text-sm text-gray-600">View appointment history</p>
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
