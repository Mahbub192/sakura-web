import React, { useState } from 'react';
import { toast } from 'react-toastify';

const NotificationSettings: React.FC = () => {
  const [notificationSettings, setNotificationSettings] = useState({
    events: {
      newAppointmentBooking: true,
      appointmentReminder: true,
      appointmentCancellation: true,
      newPatientMessage: false,
    },
    deliveryMethods: {
      email: true,
      sms: false,
      inApp: true,
    },
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
    },
  });
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Notification Preferences</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Select how and when you receive notifications.
        </p>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {/* Events Section */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">Events</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Choose which events trigger a notification.</p>
          </div>
          <div className="md:col-span-2">
            <div className="space-y-4">
              {/* New Appointment Booking */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">New Appointment Booking</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">When a patient books a new appointment.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.events.newAppointmentBooking}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        events: {
                          ...notificationSettings.events,
                          newAppointmentBooking: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* Appointment Reminder */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">Appointment Reminder</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">24 hours before an appointment.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.events.appointmentReminder}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        events: {
                          ...notificationSettings.events,
                          appointmentReminder: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* Appointment Cancellation */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">Appointment Cancellation</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">When a patient cancels an appointment.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.events.appointmentCancellation}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        events: {
                          ...notificationSettings.events,
                          appointmentCancellation: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* New Patient Message */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">New Patient Message</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">When you receive a new message.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.events.newPatientMessage}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        events: {
                          ...notificationSettings.events,
                          newPatientMessage: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Method Section */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">Delivery Method</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Select your preferred channels.</p>
          </div>
          <div className="md:col-span-2">
            <div className="space-y-3">
              {/* Email */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={notificationSettings.deliveryMethods.email}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      deliveryMethods: {
                        ...notificationSettings.deliveryMethods,
                        email: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-primary focus:ring-2 focus:ring-primary"
                  id="email-notif"
                />
                <label className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="email-notif">
                  Email
                </label>
              </div>

              {/* SMS */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={notificationSettings.deliveryMethods.sms}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      deliveryMethods: {
                        ...notificationSettings.deliveryMethods,
                        sms: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-primary focus:ring-2 focus:ring-primary"
                  id="sms-notif"
                />
                <label className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="sms-notif">
                  SMS
                </label>
              </div>

              {/* In-App */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={notificationSettings.deliveryMethods.inApp}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      deliveryMethods: {
                        ...notificationSettings.deliveryMethods,
                        inApp: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-primary focus:ring-2 focus:ring-primary"
                  id="in-app-notif"
                />
                <label className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="in-app-notif">
                  In-App (Push)
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Quiet Hours Section */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">Quiet Hours</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Mute notifications during specific times.</p>
          </div>
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <p className="font-medium text-gray-800 dark:text-gray-200">Enable Quiet Hours</p>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.quietHours.enabled}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      quietHours: {
                        ...notificationSettings.quietHours,
                        enabled: e.target.checked,
                      },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
              </label>
            </div>
            {notificationSettings.quietHours.enabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="start-time">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={notificationSettings.quietHours.startTime}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        quietHours: {
                          ...notificationSettings.quietHours,
                          startTime: e.target.value,
                        },
                      })
                    }
                    className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-background-light dark:bg-gray-800 text-sm focus:border-primary focus:ring-primary/50"
                    id="start-time"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="end-time">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={notificationSettings.quietHours.endTime}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        quietHours: {
                          ...notificationSettings.quietHours,
                          endTime: e.target.value,
                        },
                      })
                    }
                    className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-background-light dark:bg-gray-800 text-sm focus:border-primary focus:ring-primary/50"
                    id="end-time"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => {
            // Reset to default values
            setNotificationSettings({
              events: {
                newAppointmentBooking: true,
                appointmentReminder: true,
                appointmentCancellation: true,
                newPatientMessage: false,
              },
              deliveryMethods: {
                email: true,
                sms: false,
                inApp: true,
              },
              quietHours: {
                enabled: false,
                startTime: '22:00',
                endTime: '08:00',
              },
            });
          }}
          className="flex items-center justify-center gap-2 rounded-lg h-10 px-5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-bold leading-normal hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={async () => {
            setIsSavingNotifications(true);
            try {
              // TODO: Save notification settings to backend
              // await api.patch('/doctors/notification-settings', notificationSettings);
              await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call
              toast.success('Notification preferences saved successfully!');
            } catch (error: any) {
              toast.error(error?.response?.data?.message || 'Failed to save notification preferences');
            } finally {
              setIsSavingNotifications(false);
            }
          }}
          disabled={isSavingNotifications}
          className="flex items-center justify-center gap-2 rounded-lg h-10 px-5 bg-primary text-white text-sm font-bold leading-normal shadow-sm hover:bg-primary/90 disabled:opacity-50"
        >
          {isSavingNotifications ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;

