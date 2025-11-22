import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { registerUser, clearError } from '../../store/slices/authSlice';
import { RegisterRequest } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';

const schema = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().notRequired(),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  role: yup.string().oneOf(['Admin', 'Doctor', 'Assistant', 'User'] as const).required('Role is required'),
});

interface RegisterFormData extends RegisterRequest {
  confirmPassword: string;
}

const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      role: 'User',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      // Remove confirmPassword before submitting
      const { confirmPassword, ...registerData } = data;
      const result = await dispatch(registerUser(registerData));
      if (registerUser.fulfilled.match(result)) {
        toast.success('Registration successful!');
        navigate('/dashboard');
      } else {
        toast.error(result.payload as string);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    }
  };

  // Clear error when component unmounts
  React.useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center bg-background-light dark:bg-background-dark font-display text-text-light dark:text-text-dark antialiased">
      {/* Top Navigation Bar */}
      <header className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between whitespace-nowrap border-b border-solid border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-4 text-primary dark:text-secondary">
            <div className="size-6">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_6_535)">
                  <path clipRule="evenodd" d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z" fill="currentColor" fillRule="evenodd"></path>
                </g>
                <defs>
                  <clipPath id="clip0_6_535"><rect fill="white" height="48" width="48"></rect></clipPath>
                </defs>
              </svg>
            </div>
            <h2 className="text-xl font-bold leading-tight tracking-[-0.015em] text-text-light dark:text-text-dark">Sakura</h2>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <Link to="/" className="text-sm font-medium leading-normal text-text-light/80 hover:text-primary dark:text-text-dark/80 dark:hover:text-secondary">
              Home
            </Link>
            <Link to="/book-appointment" className="text-sm font-medium leading-normal text-text-light/80 hover:text-primary dark:text-text-dark/80 dark:hover:text-secondary">
              Appointment
            </Link>
            <Link to="/patients/view" className="text-sm font-medium leading-normal text-text-light/80 hover:text-primary dark:text-text-dark/80 dark:hover:text-secondary">
              Patients
            </Link>
            <a href="#services" className="text-sm font-medium leading-normal text-text-light/80 hover:text-primary dark:text-text-dark/80 dark:hover:text-secondary">
              Services
            </a>
            <a href="#faq" className="text-sm font-medium leading-normal text-text-light/80 hover:text-primary dark:text-text-dark/80 dark:hover:text-secondary">
              FAQ
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex w-full flex-1 items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg space-y-8">
          {/* Page Heading */}
          {/* <div className="text-center">
            <h1 className="text-3xl font-black tracking-[-0.033em] text-text-light dark:text-text-dark sm:text-4xl">
              Create Your Account
            </h1>
            <p className="mt-2 text-sm text-text-light/70 dark:text-text-dark/70">
              Join the Sakura Portal to manage your health journey.
            </p>
          </div> */}

          {/* Form Container */}
          <div className="rounded-xl border border-slate-200/50 bg-white p-6 shadow-sm dark:border-slate-700/50 dark:bg-background-dark/50 sm:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" method="POST">
              {/* First Name & Last Name */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <label className="flex flex-col">
                  <p className="pb-2 text-sm font-medium text-text-light dark:text-text-dark">First Name</p>
                  <input
                    {...register('firstName')}
                    className="form-input h-12 w-full flex-1 resize-none overflow-hidden rounded-lg border border-slate-200 bg-background-light p-3 text-sm font-normal leading-normal text-text-light placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-background-dark dark:text-text-dark dark:placeholder:text-slate-500 dark:focus:border-secondary dark:focus:ring-secondary/20"
                    placeholder="Enter your first name"
                    type="text"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>
                  )}
                </label>

                <label className="flex flex-col">
                  <p className="pb-2 text-sm font-medium text-text-light dark:text-text-dark">Last Name</p>
                  <input
                    {...register('lastName')}
                    className="form-input h-12 w-full flex-1 resize-none overflow-hidden rounded-lg border border-slate-200 bg-background-light p-3 text-sm font-normal leading-normal text-text-light placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-background-dark dark:text-text-dark dark:placeholder:text-slate-500 dark:focus:border-secondary dark:focus:ring-secondary/20"
                    placeholder="Enter your last name"
                    type="text"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>
                  )}
                </label>
              </div>

              {/* Phone Number */}
              <label className="flex flex-col">
                <p className="pb-2 text-sm font-medium text-text-light dark:text-text-dark">Phone Number</p>
                <input
                  {...register('phone')}
                  className="form-input h-12 w-full flex-1 resize-none overflow-hidden rounded-lg border border-slate-200 bg-background-light p-3 text-sm font-normal leading-normal text-text-light placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-background-dark dark:text-text-dark dark:placeholder:text-slate-500 dark:focus:border-secondary dark:focus:ring-secondary/20"
                  placeholder="Enter your phone number"
                  type="tel"
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
                )}
              </label>

              {/* Email Address */}
              <label className="flex flex-col">
                <p className="pb-2 text-sm font-medium text-text-light dark:text-text-dark">Email Address</p>
                <input
                  {...register('email')}
                  className="form-input h-12 w-full flex-1 resize-none overflow-hidden rounded-lg border border-slate-200 bg-background-light p-3 text-sm font-normal leading-normal text-text-light placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-background-dark dark:text-text-dark dark:placeholder:text-slate-500 dark:focus:border-secondary dark:focus:ring-secondary/20"
                  placeholder="Enter your email address"
                  type="email"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                )}
              </label>

              {/* Role (Read-only) */}
              <label className="flex flex-col">
                <p className="pb-2 text-sm font-medium text-text-light dark:text-text-dark">Role</p>
                <input
                  {...register('role')}
                  className="form-input h-12 w-full flex-1 resize-none overflow-hidden rounded-lg border border-slate-200 bg-background-light/50 p-3 text-sm font-normal leading-normal text-text-light/70 focus:outline-none focus:ring-0 dark:border-slate-700 dark:bg-background-dark/30 dark:text-text-dark/70"
                  disabled
                  readOnly
                  value="User"
                />
              </label>

              {/* Password */}
              <div className="relative">
                <label className="flex flex-col">
                  <p className="pb-2 text-sm font-medium text-text-light dark:text-text-dark">Password</p>
                  <input
                    {...register('password')}
                    className="form-input h-12 w-full flex-1 resize-none overflow-hidden rounded-lg border border-slate-200 bg-background-light p-3 pr-12 text-sm font-normal leading-normal text-text-light placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-background-dark dark:text-text-dark dark:placeholder:text-slate-500 dark:focus:border-secondary dark:focus:ring-secondary/20"
                    placeholder="Enter your password"
                    type={showPassword ? 'text' : 'password'}
                  />
                  <button
                    className="absolute right-3 top-[38px] text-text-light/50 dark:text-text-dark/50"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </label>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <label className="flex flex-col">
                <p className="pb-2 text-sm font-medium text-text-light dark:text-text-dark">Confirm Password</p>
                <input
                  {...register('confirmPassword')}
                  className="form-input h-12 w-full flex-1 resize-none overflow-hidden rounded-lg border border-slate-200 bg-background-light p-3 text-sm font-normal leading-normal text-text-light placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-background-dark dark:text-text-dark dark:placeholder:text-slate-500 dark:focus:border-secondary dark:focus:ring-secondary/20"
                  placeholder="Confirm your password"
                  type={showConfirmPassword ? 'text' : 'password'}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
                )}
              </label>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative flex h-12 w-full items-center justify-center rounded-lg bg-primary px-4 py-2 text-base font-semibold text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:bg-secondary dark:text-primary dark:hover:bg-secondary/90 dark:focus:ring-secondary dark:focus:ring-offset-background-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Registering...
                    </>
                  ) : (
                    'Register'
                  )}
                </button>
              </div>
            </form>

            {/* Login Link */}
            <p className="mt-8 text-center text-sm text-text-light/80 dark:text-text-dark/80">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-primary hover:underline dark:text-secondary"
              >
                Login
              </Link>
            </p>
          </div>

          {/* Footer Links */}
          <footer className="text-center">
            <div className="text-xs text-text-light/60 dark:text-text-dark/60">
              <a className="hover:underline" href="#">Terms of Service</a>
              <span className="mx-2">·</span>
              <a className="hover:underline" href="#">Privacy Policy</a>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default RegisterPage;
