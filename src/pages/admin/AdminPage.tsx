import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UsersIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  CogIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ServerIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchDoctors, createDoctor, deleteDoctor } from '../../store/slices/doctorSlice';
import { fetchAppointments } from '../../store/slices/appointmentSlice';
import { fetchClinics } from '../../store/slices/clinicSlice';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import SystemStatsCard from '../../components/admin/SystemStatsCard';
import UserManagementCard from '../../components/admin/UserManagementCard';
import SystemSettingsCard from '../../components/admin/SystemSettingsCard';
import { toast } from 'react-toastify';

const AdminPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { doctors } = useAppSelector(state => state.doctors);
  const { appointments } = useAppSelector(state => state.appointments);
  const { clinics } = useAppSelector(state => state.clinics);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    // Fetch all data for admin overview
    dispatch(fetchDoctors());
    dispatch(fetchAppointments());
    dispatch(fetchClinics());
  }, [dispatch]);

  const systemStats = [
    {
      title: 'Total Users',
      value: doctors.length + 50, // Simulated total users (doctors + patients + staff)
      icon: UsersIcon,
      color: 'bg-primary-600',
      change: '+12%',
      changeType: 'increase' as const,
    },
    {
      title: 'Active Doctors',
      value: doctors.filter(d => d.user.isActive).length,
      icon: UserGroupIcon,
      color: 'bg-success-600',
      change: '+8%',
      changeType: 'increase' as const,
    },
    {
      title: 'Total Appointments',
      value: appointments.length,
      icon: CalendarDaysIcon,
      color: 'bg-secondary-600',
      change: '+15%',
      changeType: 'increase' as const,
    },
    {
      title: 'Active Clinics',
      value: clinics.length,
      icon: BuildingOfficeIcon,
      color: 'bg-warning-600',
      change: '0%',
      changeType: 'neutral' as const,
    },
  ];

  const tabs = [
    { id: 'overview', name: 'System Overview', icon: ChartBarIcon },
    { id: 'users', name: 'User Management', icon: UsersIcon },
    { id: 'clinics', name: 'Clinic Management', icon: BuildingOfficeIcon },
    { id: 'settings', name: 'System Settings', icon: CogIcon },
    { id: 'security', name: 'Security & Permissions', icon: ShieldCheckIcon },
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
          <h1 className="text-2xl font-bold text-gray-900">System Administration</h1>
          <p className="text-gray-600 mt-1">Manage users, settings, and system configuration</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button
            variant="primary"
            icon={<ServerIcon className="h-4 w-4" />}
          >
            System Health Check
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemStats.map((stat, index) => (
          <SystemStatsCard
            key={stat.title}
            stat={stat}
            index={index}
          />
        ))}
      </div>

      {/* Admin Tabs */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-200">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* System Health */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Database</span>
                      <span className="badge badge-success">Healthy</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">API Response Time</span>
                      <span className="badge badge-success">142ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Server Load</span>
                      <span className="badge badge-warning">65%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Storage Usage</span>
                      <span className="badge badge-primary">23GB / 100GB</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <p className="text-gray-900">New doctor registered</p>
                      <p className="text-gray-500">Dr. Sarah Johnson - 2 hours ago</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-900">System backup completed</p>
                      <p className="text-gray-500">Daily backup - 6 hours ago</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-900">Security scan completed</p>
                      <p className="text-gray-500">No issues found - 1 day ago</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('users')}
                    icon={<UsersIcon className="h-4 w-4" />}
                    className="justify-start"
                  >
                    Manage Users
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('clinics')}
                    icon={<BuildingOfficeIcon className="h-4 w-4" />}
                    className="justify-start"
                  >
                    Add New Clinic
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('settings')}
                    icon={<CogIcon className="h-4 w-4" />}
                    className="justify-start"
                  >
                    System Settings
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <UserManagementCard doctors={doctors} />
            </motion.div>
          )}

          {activeTab === 'clinics' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Clinic Management</h3>
                <Button
                  variant="primary"
                  icon={<PlusIcon className="h-4 w-4" />}
                >
                  Add New Clinic
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clinics.map(clinic => (
                  <div key={clinic.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{clinic.locationName}</h4>
                        <p className="text-sm text-gray-600">{clinic.city}, {clinic.state}</p>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<EyeIcon className="h-3 w-3" />}
                        >
                          <span className="sr-only">View</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<PencilIcon className="h-3 w-3" />}
                        >
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          icon={<TrashIcon className="h-3 w-3" />}
                        >
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{clinic.address}</p>
                      <p>{clinic.phone}</p>
                      {clinic.email && <p>{clinic.email}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <SystemSettingsCard />
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-900">Security & Permissions</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-4">Role Permissions</h4>
                  <div className="space-y-3">
                    {['Admin', 'Doctor', 'Assistant', 'User'].map(role => (
                      <div key={role} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{role}</span>
                        <Button variant="outline" size="sm">Edit Permissions</Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-4">Security Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Two-Factor Authentication</span>
                      <span className="badge badge-warning">Optional</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Password Policy</span>
                      <span className="badge badge-success">Strong</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Session Timeout</span>
                      <span className="badge badge-primary">24 hours</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AdminPage;