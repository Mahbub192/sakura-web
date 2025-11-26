import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAppSelector } from '../../hooks/redux';
import { useAuth } from '../../hooks/useAuth';

const ClinicInfoSettings: React.FC = () => {
  const { user } = useAuth();
  const { currentDoctorProfile } = useAppSelector(state => state.doctors);
  
  // Clinic info state
  const [clinicInfo, setClinicInfo] = useState({
    logo: '',
    name: '',
    address: '',
    phone: '',
    email: '',
    description: '',
  });
  const [operatingHours, setOperatingHours] = useState({
    monday: { start: '09:00', end: '17:00', closed: false },
    tuesday: { start: '09:00', end: '17:00', closed: false },
    wednesday: { start: '09:00', end: '17:00', closed: false },
    thursday: { start: '09:00', end: '17:00', closed: false },
    friday: { start: '09:00', end: '17:00', closed: false },
    saturday: { start: '09:00', end: '17:00', closed: true },
    sunday: { start: '09:00', end: '17:00', closed: true },
  });
  const [isSavingClinicInfo, setIsSavingClinicInfo] = useState(false);

  useEffect(() => {
    if (currentDoctorProfile && user) {
      // Initialize clinic info if available
      // TODO: Load from backend when clinic data is available
      setClinicInfo({
        logo: '',
        name: currentDoctorProfile.name || '',
        address: '',
        phone: user.phone || '',
        email: user.email || '',
        description: currentDoctorProfile.bio || '',
      });
    }
  }, [currentDoctorProfile, user]);

  return (
    <div className="flex flex-col gap-8">
      {/* Clinic Information */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Clinic Information</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Update your clinic's details, branding, and operating hours.
          </p>
        </div>

        <div className="p-6">
          <form className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Clinic Logo */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Clinic Logo
              </label>
              <div className="flex items-center gap-4">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2 h-20 w-20 flex items-center justify-center">
                  {clinicInfo.logo ? (
                    <img
                      alt="Clinic Logo"
                      className="h-16 w-16 object-contain"
                      src={clinicInfo.logo}
                    />
                  ) : (
                    <span className="material-symbols-outlined text-4xl text-gray-400">business</span>
                  )}
                </div>
                <div>
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal shadow-sm hover:bg-primary/90"
                    onClick={() => {
                      // TODO: Implement file upload
                      toast.info('Logo upload functionality coming soon');
                    }}
                  >
                    Upload Logo
                  </button>
                  <p className="text-xs text-gray-500 mt-2">PNG, JPG, or SVG. Max 2MB.</p>
                </div>
              </div>
            </div>

            {/* Clinic Name */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="clinic-name">
                Clinic Name
              </label>
              <input
                type="text"
                id="clinic-name"
                value={clinicInfo.name}
                onChange={(e) => setClinicInfo({ ...clinicInfo, name: e.target.value })}
                className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-background-light dark:bg-gray-800 text-sm focus:border-primary focus:ring-primary/50"
                placeholder="Enter clinic name"
              />
            </div>

            {/* Address */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="clinic-address">
                Address
              </label>
              <input
                type="text"
                id="clinic-address"
                value={clinicInfo.address}
                onChange={(e) => setClinicInfo({ ...clinicInfo, address: e.target.value })}
                className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-background-light dark:bg-gray-800 text-sm focus:border-primary focus:ring-primary/50"
                placeholder="Enter clinic address"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="clinic-phone">
                Phone Number
              </label>
              <input
                type="tel"
                id="clinic-phone"
                value={clinicInfo.phone}
                onChange={(e) => setClinicInfo({ ...clinicInfo, phone: e.target.value })}
                className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-background-light dark:bg-gray-800 text-sm focus:border-primary focus:ring-primary/50"
                placeholder="Enter phone number"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="clinic-email">
                Email Address
              </label>
              <input
                type="email"
                id="clinic-email"
                value={clinicInfo.email}
                onChange={(e) => setClinicInfo({ ...clinicInfo, email: e.target.value })}
                className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-background-light dark:bg-gray-800 text-sm focus:border-primary focus:ring-primary/50"
                placeholder="Enter email address"
              />
            </div>

            {/* Clinic Description */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="clinic-description">
                Clinic Description
              </label>
              <textarea
                id="clinic-description"
                rows={4}
                value={clinicInfo.description}
                onChange={(e) => setClinicInfo({ ...clinicInfo, description: e.target.value })}
                className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-background-light dark:bg-gray-800 text-sm focus:border-primary focus:ring-primary/50"
                placeholder="Enter clinic description"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Operating Hours */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Operating Hours</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Set the weekly schedule for the clinic.</p>
        </div>

        <div className="p-6">
          <form className="space-y-4">
            {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const).map((day) => {
              const dayData = operatingHours[day];
              const dayName = day.charAt(0).toUpperCase() + day.slice(1);
              
              return (
                <div key={day} className="grid grid-cols-4 items-center gap-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{dayName}</label>
                  <input
                    type="time"
                    value={dayData.closed ? '' : dayData.start}
                    onChange={(e) =>
                      setOperatingHours({
                        ...operatingHours,
                        [day]: { ...dayData, start: e.target.value },
                      })
                    }
                    disabled={dayData.closed}
                    className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-background-light dark:bg-gray-800 text-sm focus:border-primary focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <input
                    type="time"
                    value={dayData.closed ? '' : dayData.end}
                    onChange={(e) =>
                      setOperatingHours({
                        ...operatingHours,
                        [day]: { ...dayData, end: e.target.value },
                      })
                    }
                    disabled={dayData.closed}
                    className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-background-light dark:bg-gray-800 text-sm focus:border-primary focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <input
                      type="checkbox"
                      checked={dayData.closed}
                      onChange={(e) =>
                        setOperatingHours({
                          ...operatingHours,
                          [day]: { ...dayData, closed: e.target.checked },
                        })
                      }
                      className="rounded border-gray-300 text-primary shadow-sm focus:ring-primary/50 dark:bg-gray-800 dark:border-gray-700"
                    />
                    <span>Closed</span>
                  </label>
                </div>
              );
            })}
          </form>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              // Reset to default values
              setOperatingHours({
                monday: { start: '09:00', end: '17:00', closed: false },
                tuesday: { start: '09:00', end: '17:00', closed: false },
                wednesday: { start: '09:00', end: '17:00', closed: false },
                thursday: { start: '09:00', end: '17:00', closed: false },
                friday: { start: '09:00', end: '17:00', closed: false },
                saturday: { start: '09:00', end: '17:00', closed: true },
                sunday: { start: '09:00', end: '17:00', closed: true },
              });
            }}
            className="flex items-center justify-center gap-2 rounded-lg h-10 px-5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-bold leading-normal hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={async () => {
              setIsSavingClinicInfo(true);
              try {
                // TODO: Save clinic info and operating hours to backend
                // await api.patch('/doctors/clinic-info', { clinicInfo, operatingHours });
                await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call
                toast.success('Clinic information saved successfully!');
              } catch (error: any) {
                toast.error(error?.response?.data?.message || 'Failed to save clinic information');
              } finally {
                setIsSavingClinicInfo(false);
              }
            }}
            disabled={isSavingClinicInfo}
            className="flex items-center justify-center gap-2 rounded-lg h-10 px-5 bg-primary text-white text-sm font-bold leading-normal shadow-sm hover:bg-primary/90 disabled:opacity-50"
          >
            {isSavingClinicInfo ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClinicInfoSettings;

