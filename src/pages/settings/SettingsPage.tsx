import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useAuth } from '../../hooks/useAuth';
import { fetchCurrentDoctorProfile } from '../../store/slices/doctorSlice';
import BillingSettings from './BillingSettings';
import ClinicInfoSettings from './ClinicInfoSettings';
import NotificationSettings from './NotificationSettings';
import ProfileSettings from './ProfileSettings';
import SecuritySettings from './SecuritySettings';

const SettingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { isLoading } = useAppSelector(state => state.doctors);
  
  // Determine available tabs based on user role
  const isDoctor = user?.role === 'Doctor';
  const baseTabs = [
    { id: 'profile' as const, name: 'Profile', icon: 'person' },
    { id: 'security' as const, name: 'Security', icon: 'security' },
  ];
  
  const doctorTabs = [
    { id: 'profile' as const, name: 'Profile', icon: 'person' },
    { id: 'notifications' as const, name: 'Notifications', icon: 'notifications' },
    { id: 'clinic' as const, name: 'Clinic Info', icon: 'medical_services' },
    { id: 'billing' as const, name: 'Billing', icon: 'receipt_long' },
    { id: 'security' as const, name: 'Security', icon: 'security' },
  ];
  
  const tabs = isDoctor ? doctorTabs : baseTabs;
  type TabId = typeof tabs[number]['id'];
  const [activeTab, setActiveTab] = useState<TabId>(tabs[0].id);

  useEffect(() => {
    if (user?.role === 'Doctor') {
      dispatch(fetchCurrentDoctorProfile());
    }
  }, [dispatch, user]);

  if (isDoctor && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-gray-900 dark:text-white text-3xl font-bold leading-tight">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 text-base font-normal leading-normal">
          Manage your account, clinic, and application settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-1">
          <nav className="flex flex-col gap-1 sticky top-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'hover:bg-gray-200/50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-300'
                }`}
              >
                <span className="material-symbols-outlined text-xl">{tab.icon}</span>
                <span className="text-sm">{tab.name}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-3 flex flex-col gap-8">
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'clinic' && <ClinicInfoSettings />}
          {activeTab === 'billing' && <BillingSettings />}
          {activeTab === 'security' && <SecuritySettings />}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
