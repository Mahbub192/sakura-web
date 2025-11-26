import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useAuth } from '../../hooks/useAuth';
import { updateDoctor } from '../../store/slices/doctorSlice';
import api from '../../services/api';
import { toast } from 'react-toastify';

// Doctor profile schema
const doctorProfileSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  specialization: yup.string().required('Specialization is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().optional(),
});

// Generic user profile schema (for Patient, Assistant, Admin)
const userProfileSchema = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().optional(),
});

type DoctorProfileFormData = yup.InferType<typeof doctorProfileSchema>;
type UserProfileFormData = yup.InferType<typeof userProfileSchema>;

const ProfileSettings: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { currentDoctorProfile } = useAppSelector(state => state.doctors);
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);

  const isDoctor = user?.role === 'Doctor';

  // Doctor form
  const {
    register: registerDoctorProfile,
    handleSubmit: handleSubmitDoctorProfile,
    formState: { errors: doctorProfileErrors },
    reset: resetDoctorProfile,
  } = useForm<DoctorProfileFormData>({
    resolver: yupResolver(doctorProfileSchema),
  });

  // User form (for Patient, Assistant, Admin)
  const {
    register: registerUserProfile,
    handleSubmit: handleSubmitUserProfile,
    formState: { errors: userProfileErrors },
    reset: resetUserProfile,
  } = useForm<UserProfileFormData>({
    resolver: yupResolver(userProfileSchema),
  });

  React.useEffect(() => {
    if (isDoctor && currentDoctorProfile && user) {
      resetDoctorProfile({
        name: currentDoctorProfile.name,
        specialization: currentDoctorProfile.specialization,
        email: user.email,
        phone: user.phone || '',
      });
    } else if (!isDoctor && user) {
      resetUserProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
        phone: user.phone || '',
      });
    }
  }, [currentDoctorProfile, user, resetDoctorProfile, resetUserProfile, isDoctor]);

  const onDoctorProfileSubmit = async (data: DoctorProfileFormData) => {
    if (!currentDoctorProfile) return;
    
    setIsSavingProfile(true);
    try {
      // Update doctor profile
      await dispatch(updateDoctor({
        id: currentDoctorProfile.id,
        data: {
          name: data.name,
          specialization: data.specialization,
        }
      })).unwrap();

      // Update user profile (email, phone)
      await api.patch('/users/my-profile', {
        firstName: data.name.split(' ')[0] || data.name,
        lastName: data.name.split(' ').slice(1).join(' ') || '',
        phone: data.phone,
      });

      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const onUserProfileSubmit = async (data: UserProfileFormData) => {
    setIsSavingProfile(true);
    try {
      // Update user profile
      await api.patch('/users/my-profile', {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      });

      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Get profile image URL
  const getProfileImage = () => {
    if (isDoctor && currentDoctorProfile?.profileImage) {
      return currentDoctorProfile.profileImage;
    }
    return 'https://lh3.googleusercontent.com/aida-public/AB6AXuDaxM0wNFKrDU8Mv8BAOJspA5Z6u2Y55brKTpqS4ROf6q8xEbWBzaPg4yjolSXminz0fSpTGjvgY9W9y59Lw3KPW4__KGKK6yaax2B48p2d5vcW_707PRwZUcPPOrVhmqwVQqZAWo2sF-sff_tYDTm91aBuuzAYMzxJtzBsWOt5p-0MSLu8fM-EprRrkaE9_7SvNJb68IICeo4-ThCJOAkqilKQKYUF-ILNjtSs40ohwSn0CYsB4hBg_2hUwiDDlGp94z_6uV7pUvY';
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Profile Information</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Update your personal details and contact information.
        </p>
      </div>

      <div className="p-6">
        {isDoctor ? (
          // Doctor Profile Form
          <form onSubmit={handleSubmitDoctorProfile(onDoctorProfileSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Profile Picture */}
            <div className="sm:col-span-2 flex items-center gap-4">
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-20"
                style={{
                  backgroundImage: `url("${getProfileImage()}")`,
                }}
              />
              <div>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal shadow-sm hover:bg-primary/90 mb-2"
                >
                  Change Picture
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-transparent text-gray-600 dark:text-gray-300 text-sm font-bold leading-normal hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Remove
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="name">
                Full Name
              </label>
              <input
                {...registerDoctorProfile('name')}
                className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-background-light dark:bg-gray-800 text-sm focus:border-primary focus:ring-primary/50"
                id="name"
                type="text"
              />
              {doctorProfileErrors.name && (
                <p className="mt-1 text-sm text-red-600">{doctorProfileErrors.name.message}</p>
              )}
            </div>

            {/* Specialty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="specialization">
                Specialty
              </label>
              <input
                {...registerDoctorProfile('specialization')}
                className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-background-light dark:bg-gray-800 text-sm focus:border-primary focus:ring-primary/50"
                id="specialization"
                type="text"
              />
              {doctorProfileErrors.specialization && (
                <p className="mt-1 text-sm text-red-600">{doctorProfileErrors.specialization.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="email">
                Email Address
              </label>
              <input
                {...registerDoctorProfile('email')}
                className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-background-light dark:bg-gray-800 text-sm focus:border-primary focus:ring-primary/50"
                id="email"
                type="email"
                disabled
              />
              <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="phone">
                Phone Number
              </label>
              <input
                {...registerDoctorProfile('phone')}
                className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-background-light dark:bg-gray-800 text-sm focus:border-primary focus:ring-primary/50"
                id="phone"
                type="tel"
              />
              {doctorProfileErrors.phone && (
                <p className="mt-1 text-sm text-red-600">{doctorProfileErrors.phone.message}</p>
              )}
            </div>
          </form>
        ) : (
          // User Profile Form (Patient, Assistant, Admin)
          <form onSubmit={handleSubmitUserProfile(onUserProfileSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Profile Picture */}
            <div className="sm:col-span-2 flex items-center gap-4">
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-20"
                style={{
                  backgroundImage: `url("${getProfileImage()}")`,
                }}
              />
              <div>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal shadow-sm hover:bg-primary/90 mb-2"
                >
                  Change Picture
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-transparent text-gray-600 dark:text-gray-300 text-sm font-bold leading-normal hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Remove
                </button>
              </div>
            </div>

            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="firstName">
                First Name
              </label>
              <input
                {...registerUserProfile('firstName')}
                className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-background-light dark:bg-gray-800 text-sm focus:border-primary focus:ring-primary/50"
                id="firstName"
                type="text"
              />
              {userProfileErrors.firstName && (
                <p className="mt-1 text-sm text-red-600">{userProfileErrors.firstName.message}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="lastName">
                Last Name
              </label>
              <input
                {...registerUserProfile('lastName')}
                className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-background-light dark:bg-gray-800 text-sm focus:border-primary focus:ring-primary/50"
                id="lastName"
                type="text"
              />
              {userProfileErrors.lastName && (
                <p className="mt-1 text-sm text-red-600">{userProfileErrors.lastName.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="email">
                Email Address
              </label>
              <input
                {...registerUserProfile('email')}
                className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-background-light dark:bg-gray-800 text-sm focus:border-primary focus:ring-primary/50"
                id="email"
                type="email"
                disabled
              />
              <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="phone">
                Phone Number
              </label>
              <input
                {...registerUserProfile('phone')}
                className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-background-light dark:bg-gray-800 text-sm focus:border-primary focus:ring-primary/50"
                id="phone"
                type="tel"
              />
              {userProfileErrors.phone && (
                <p className="mt-1 text-sm text-red-600">{userProfileErrors.phone.message}</p>
              )}
            </div>
          </form>
        )}
      </div>

      <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => isDoctor ? resetDoctorProfile() : resetUserProfile()}
          className="flex items-center justify-center gap-2 rounded-lg h-10 px-5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-bold leading-normal hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={isDoctor ? handleSubmitDoctorProfile(onDoctorProfileSubmit) : handleSubmitUserProfile(onUserProfileSubmit)}
          disabled={isSavingProfile}
          className="flex items-center justify-center gap-2 rounded-lg h-10 px-5 bg-primary text-white text-sm font-bold leading-normal shadow-sm hover:bg-primary/90 disabled:opacity-50"
        >
          {isSavingProfile ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default ProfileSettings;
