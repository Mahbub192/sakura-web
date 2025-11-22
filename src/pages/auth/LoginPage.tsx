import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { loginUser, clearError } from '../../store/slices/authSlice';
import { LoginRequest } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: yupResolver(schema) as any,
  });

  const onSubmit = async (data: LoginRequest) => {
    try {
      const result = await dispatch(loginUser(data));
      if (loginUser.fulfilled.match(result)) {
        toast.success('Login successful!');
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
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display">
      <div className="flex-1 w-full">
        <div className="flex min-h-screen">
          {/* Left Side - Image (Hidden on mobile, shown on lg) */}
          <div className="hidden lg:flex flex-1 items-center justify-center p-8 bg-slate-100 dark:bg-slate-900">
            <div className="w-full max-w-md">
              <div 
                className="w-full bg-center bg-no-repeat bg-cover aspect-square rounded-xl"
                style={{
                  backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBdYN9JbR2n48wjiZSibJWa5ve0Z_7G431jr3bBcYcIKsaS_KB6RdluSVMpmDmkzkgx_dMiqGK6R7pCstLDV6sntafm8uI-G-QSBipZEou1-eL3HifSLhFvj7RFAd7cE8Xu10TCwLKy0RSVWFgWLReti2IehcHTV3kS9ZNHxyJouelhj9vrmgZn0HAEGP19XUpUSnwZPiggt9WI1IMgd-wub9hNVaJqTZb_NkjMeez5-0HPmarGSdnM0o9llLWLLB7eFTmFPD4SOskt")'
                }}
              />
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
            <div className="mx-auto w-full max-w-sm lg:w-96">
              {/* Logo & Header */}
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <svg className="h-8 w-8 text-primary" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C11.3768 2 10.7601 2.11504 10.1764 2.3387C9.59272 2.56237 9.05146 2.88998 8.58045 3.30335L8.58579 3.29801C8.11009 3.71536 7.69673 4.21262 7.36979 4.76742C7.04285 5.32223 6.8088 5.92543 6.67876 6.55627C6.01533 9.42398 7.21855 12.4431 9.49123 14.1804L9.49124 14.1804L9.49392 14.1825C9.49526 14.1835 9.4966 14.1846 9.49794 14.1857C10.0883 14.6548 10.771 15 11.5 15C12.229 15 12.9117 14.6548 13.5021 14.1857C13.5034 14.1846 13.5047 14.1835 13.5061 14.1825L13.5088 14.1804C15.7815 12.4431 16.9847 9.42398 16.3212 6.55627C16.1912 5.92543 15.9572 5.32223 15.6302 4.76742C15.3033 4.21262 14.8899 3.71536 14.4142 3.29801L14.4196 3.30335C13.9485 2.88998 13.4073 2.56237 12.8236 2.3387C12.2399 2.11504 11.6232 2 12 2ZM12 16C10.7779 16 9.60537 16.4741 8.74264 17.2929C7.87991 18.1116 7.40909 19.2319 7.40909 20.4C7.40909 20.8418 7.74901 21.2 8.18182 21.2C8.61463 21.2 8.95455 20.8418 8.95455 20.4C8.95455 19.6131 9.27136 18.859 9.85109 18.2929C10.4308 17.7268 11.1963 17.4545 12 17.4545C12.8037 17.4545 13.5692 17.7268 14.1489 18.2929C14.7286 18.859 15.0455 19.6131 15.0455 20.4C15.0455 20.8418 15.3854 21.2 15.8182 21.2C16.251 21.2 16.5909 20.8418 16.5909 20.4C16.5909 19.2319 16.1201 18.1116 15.2574 17.2929C14.3946 16.4741 13.2221 16 12 16Z"></path>
                  </svg>
                  <span className="text-2xl font-bold text-slate-800 dark:text-slate-200">Sakura</span>
                </div>
                <div className="flex min-w-72 flex-col gap-3">
                  <p className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                    Welcome Back
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">
                    Securely access your patient portal.
                  </p>
                </div>
              </div>

              {/* Login Form */}
              <div className="mt-10">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" method="POST">
                  {/* Email Field */}
                  <div className="flex flex-col min-w-40 flex-1">
                    <label 
                      className="text-slate-800 dark:text-slate-300 text-base font-medium leading-normal pb-2" 
                      htmlFor="email"
                    >
                      Email Address
                    </label>
                    <input
                      {...register('email')}
                      autoComplete="email"
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-slate-100 focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-slate-300 dark:border-slate-700 bg-background-light dark:bg-background-dark focus:border-primary/50 dark:focus:border-primary/50 h-14 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-[15px] text-base font-normal leading-normal"
                      id="email"
                      name="email"
                      placeholder="Enter your email"
                      required
                      type="email"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="flex flex-col min-w-40 flex-1">
                    <label 
                      className="text-slate-800 dark:text-slate-300 text-base font-medium leading-normal pb-2" 
                      htmlFor="password"
                    >
                      Password
                    </label>
                    <div className="relative flex w-full flex-1 items-stretch">
                      <input
                        {...register('password')}
                        autoComplete="current-password"
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-slate-100 focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-slate-300 dark:border-slate-700 bg-background-light dark:bg-background-dark focus:border-primary/50 dark:focus:border-primary/50 h-14 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-[15px] pr-12 text-base font-normal leading-normal"
                        id="password"
                        name="password"
                        placeholder="Enter your password"
                        required
                        type={showPassword ? 'text' : 'password'}
                      />
                      <button
                        aria-label="Toggle password visibility"
                        className="text-slate-500 dark:text-slate-400 absolute inset-y-0 right-0 flex items-center justify-center pr-3"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <span className="material-symbols-outlined">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                    )}
                  </div>

                  {/* Forgot Password */}
                  <div className="flex items-center justify-end">
                    <div className="text-sm leading-6">
                      <Link 
                        className="font-semibold text-primary hover:text-primary/80" 
                        to="#"
                      >
                        Forgot Password?
                      </Link>
                    </div>
                  </div>

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
                      className="flex w-full justify-center items-center rounded-lg bg-primary px-3 py-4 text-base font-semibold leading-6 text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Signing in...
                        </>
                      ) : (
                        'Login'
                      )}
                    </button>
                  </div>
                </form>

                {/* Sign Up Link */}
                <p className="mt-10 text-center text-sm text-slate-500 dark:text-slate-400">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="font-semibold leading-6 text-primary hover:text-primary/80"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
