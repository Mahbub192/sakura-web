import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CogIcon,
  ShieldCheckIcon,
  ClockIcon,
  EnvelopeIcon,
  BellIcon,
  ServerIcon as DatabaseIcon,
} from '@heroicons/react/24/outline';
import Button from '../ui/Button';
import { toast } from 'react-toastify';

const SystemSettingsCard: React.FC = () => {
  const [settings, setSettings] = useState({
    appointmentDuration: 30,
    maxPatientsPerSlot: 1,
    workingHours: {
      start: '09:00',
      end: '17:00',
    },
    emailNotifications: true,
    smsNotifications: false,
    autoBackup: true,
    backupFrequency: 'daily',
    sessionTimeout: 24,
    passwordPolicy: 'strong',
    maintenanceMode: false,
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNestedSettingChange = (parent: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof typeof prev] as any),
        [key]: value
      }
    }));
  };

  const saveSettings = () => {
    // Here you would save settings to the backend
    toast.success('Settings saved successfully!');
  };

  const settingsSections = [
    {
      title: 'Appointment Settings',
      icon: ClockIcon,
      settings: [
        {
          label: 'Default Appointment Duration (minutes)',
          type: 'number',
          value: settings.appointmentDuration,
          onChange: (value: number) => handleSettingChange('appointmentDuration', value),
        },
        {
          label: 'Max Patients per Slot',
          type: 'number',
          value: settings.maxPatientsPerSlot,
          onChange: (value: number) => handleSettingChange('maxPatientsPerSlot', value),
        },
        {
          label: 'Working Hours Start',
          type: 'time',
          value: settings.workingHours.start,
          onChange: (value: string) => handleNestedSettingChange('workingHours', 'start', value),
        },
        {
          label: 'Working Hours End',
          type: 'time',
          value: settings.workingHours.end,
          onChange: (value: string) => handleNestedSettingChange('workingHours', 'end', value),
        },
      ],
    },
    {
      title: 'Notification Settings',
      icon: BellIcon,
      settings: [
        {
          label: 'Email Notifications',
          type: 'boolean' as const,
          value: settings.emailNotifications,
          onChange: (value: boolean) => handleSettingChange('emailNotifications', value),
        },
        {
          label: 'SMS Notifications',
          type: 'boolean' as const,
          value: settings.smsNotifications,
          onChange: (value: boolean) => handleSettingChange('smsNotifications', value),
        },
      ],
    },
    {
      title: 'Security Settings',
      icon: ShieldCheckIcon,
      settings: [
        {
          label: 'Session Timeout (hours)',
          type: 'number',
          value: settings.sessionTimeout,
          onChange: (value: number) => handleSettingChange('sessionTimeout', value),
        },
        {
          label: 'Password Policy',
          type: 'select',
          value: settings.passwordPolicy,
          options: [
            { value: 'weak', label: 'Weak (6+ characters)' },
            { value: 'medium', label: 'Medium (8+ characters, mixed case)' },
            { value: 'strong', label: 'Strong (8+ characters, mixed case, numbers, symbols)' },
          ],
          onChange: (value: string) => handleSettingChange('passwordPolicy', value),
        },
      ],
    },
    {
      title: 'System Maintenance',
      icon: DatabaseIcon,
      settings: [
        {
          label: 'Auto Backup',
          type: 'boolean' as const,
          value: settings.autoBackup,
          onChange: (value: boolean) => handleSettingChange('autoBackup', value),
        },
        {
          label: 'Backup Frequency',
          type: 'select',
          value: settings.backupFrequency,
          options: [
            { value: 'hourly', label: 'Hourly' },
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
          ],
          onChange: (value: string) => handleSettingChange('backupFrequency', value),
        },
        {
          label: 'Maintenance Mode',
          type: 'boolean' as const,
          value: settings.maintenanceMode,
          onChange: (value: boolean) => handleSettingChange('maintenanceMode', value),
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">System Settings</h3>
        <Button
          variant="primary"
          onClick={saveSettings}
          icon={<CogIcon className="h-4 w-4" />}
        >
          Save All Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {settingsSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
            className="bg-gray-50 p-6 rounded-lg"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-primary-100 p-2 rounded-lg">
                <section.icon className="h-5 w-5 text-primary-600" />
              </div>
              <h4 className="text-lg font-medium text-gray-900">{section.title}</h4>
            </div>

            <div className="space-y-4">
              {section.settings.map((setting, settingIndex) => (
                <div key={setting.label} className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 flex-1">
                    {setting.label}
                  </label>
                  
                  <div className="ml-4">
                    {setting.type === 'boolean' && (
                      <button
                        onClick={() => (setting as any).onChange(!(setting as any).value)}
                        className={`
                          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                          ${(setting as any).value ? 'bg-primary-600' : 'bg-gray-200'}
                        `}
                      >
                        <span
                          className={`
                            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                            ${(setting as any).value ? 'translate-x-6' : 'translate-x-1'}
                          `}
                        />
                      </button>
                    )}

                    {setting.type === 'number' && (
                      <input
                        type="number"
                        value={setting.value as number}
                        onChange={(e) => (setting as any).onChange(Number(e.target.value))}
                        className="w-20 text-sm border border-gray-300 rounded px-2 py-1"
                      />
                    )}

                    {setting.type === 'time' && (
                      <input
                        type="time"
                        value={setting.value as string}
                        onChange={(e) => (setting as any).onChange(e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      />
                    )}

                    {setting.type === 'select' && (setting as any).options && (
                      <select
                        value={setting.value as string}
                        onChange={(e) => (setting as any).onChange(e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        {(setting as any).options.map((option: any) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* System Actions */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-lg font-medium text-gray-900 mb-4">System Actions</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => toast.info('Backup started...')}
          >
            Create Backup Now
          </Button>
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => toast.info('Cache cleared!')}
          >
            Clear System Cache
          </Button>
          <Button
            variant="warning"
            className="justify-start"
            onClick={() => {
              if (window.confirm('Are you sure you want to restart the system?')) {
                toast.warning('System restart initiated...');
              }
            }}
          >
            Restart System
          </Button>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-lg font-medium text-gray-900 mb-4">System Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">System Version</p>
            <p className="font-medium text-gray-900">v1.0.0</p>
          </div>
          <div>
            <p className="text-gray-600">Database Version</p>
            <p className="font-medium text-gray-900">PostgreSQL 14.2</p>
          </div>
          <div>
            <p className="text-gray-600">Last Backup</p>
            <p className="font-medium text-gray-900">Today, 3:00 AM</p>
          </div>
          <div>
            <p className="text-gray-600">Uptime</p>
            <p className="font-medium text-gray-900">15 days, 4 hours</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettingsCard;
