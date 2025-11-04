import React, { Fragment, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { 
  BellIcon, 
  Bars3Icon as MenuIcon, 
  XMarkIcon,
  UserIcon,
  HomeIcon,
  CalendarIcon,
  UserGroupIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { User } from '../../types';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { logoutUser } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
  user: User | null;
}

const Header: React.FC<HeaderProps> = ({ setSidebarOpen, user }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Doctor':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Assistant':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const canAccessLivePatient = isAuthenticated && user && ['Admin', 'Doctor', 'Assistant'].includes(user.role);

  return (
    <div className="relative z-50 flex-shrink-0 bg-white/98 backdrop-blur-lg shadow-lg border-b border-gray-200/80">
      <div className="max-w-full mx-auto">
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between h-16 px-6">
          {/* Left Section - Logo & Navigation */}
          <div className="flex items-center space-x-10">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2.5 cursor-pointer group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-br from-primary-600 to-secondary-600 p-2 rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
              >
                <HeartIcon className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-tight">HealthCare</h1>
                <p className="text-xs text-gray-600 font-medium">Management System</p>
              </div>
            </Link>

            {/* Navigation Items */}
            <nav className="flex items-center space-x-1">
              <Link
                to="/"
                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-all duration-200"
              >
                Home
              </Link>
              <Link
                to="/book-appointment"
                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-all duration-200"
              >
                Book Appointment
              </Link>
              {isAuthenticated && (
                <Link
                  to="/doctors"
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-all duration-200"
                >
                  Doctors
                </Link>
              )}
              <Link
                to="/patients/view"
                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-all duration-200"
              >
                Patients
              </Link>
              {canAccessLivePatient && (
                <Link
                  to="/patients/live"
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-all duration-200"
                >
                  Live Patient
                </Link>
              )}
            </nav>
          </div>

          {/* Right Section - User Info & Actions */}
          <div className="flex items-center space-x-3">
            {/* Role Badge */}
            {user?.role && (
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border-2 shadow-sm ${getRoleBadgeColor(user.role)}`}>
                {user.role}
              </span>
            )}
            
            {/* Notifications */}
            <button
              type="button"
              className="relative p-2.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200"
            >
              <span className="sr-only">View notifications</span>
              <BellIcon className="h-5 w-5" aria-hidden="true" />
              <span className="absolute top-2 right-2 block h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white"></span>
            </button>

            {/* Profile dropdown */}
            <Menu as="div" className="relative">
              <div>
                <Menu.Button className="flex items-center space-x-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 border border-transparent hover:border-gray-200">
                  <div className="bg-gradient-to-br from-primary-600 to-secondary-600 p-1.5 rounded-full shadow-sm">
                    <UserIcon className="h-4 w-4 text-white" aria-hidden="true" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-bold text-gray-900 leading-tight">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[140px] font-medium">{user?.email}</p>
                  </div>
                </Menu.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-1 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-1 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="origin-top-right absolute right-0 mt-2 w-60 rounded-xl shadow-2xl py-2 bg-white ring-1 ring-gray-200 focus:outline-none z-50 border border-gray-100">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-secondary-50">
                    <p className="text-sm font-bold text-gray-900">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-gray-600 truncate font-medium mt-0.5">{user?.email}</p>
                  </div>
                  
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/dashboard"
                          className={`${
                            active ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                          } flex items-center px-4 py-2.5 text-sm font-medium hover:bg-primary-50 hover:text-primary-700 transition-all duration-200`}
                        >
                          <HomeIcon className="h-4 w-4 mr-3 text-gray-400" />
                          Dashboard
                        </Link>
                      )}
                    </Menu.Item>
                    
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={`${
                            active ? 'bg-gray-50' : 'text-gray-700'
                          } flex items-center px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-all duration-200`}
                        >
                          <UserIcon className="h-4 w-4 mr-3 text-gray-400" />
                          Your Profile
                        </a>
                      )}
                    </Menu.Item>
                    
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={`${
                            active ? 'bg-gray-50' : 'text-gray-700'
                          } flex items-center px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-all duration-200`}
                        >
                          <BellIcon className="h-4 w-4 mr-3 text-gray-400" />
                          Settings
                        </a>
                      )}
                    </Menu.Item>
                  </div>
                  
                  <div className="border-t border-gray-100 my-1"></div>
                  
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={`${
                          active ? 'bg-red-50 text-red-700' : 'text-gray-700'
                        } flex items-center w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-red-50 hover:text-red-700 transition-all duration-200`}
                      >
                        <span className="mr-3 text-base">🚪</span>
                        Sign out
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between h-14 px-4 bg-white/98 backdrop-blur-lg">
          <button
            type="button"
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <MenuIcon className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* Mobile Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-br from-primary-600 to-secondary-600 p-1.5 rounded-lg shadow-sm">
              <HeartIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-base font-bold text-gray-900">HealthCare</span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <MenuIcon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-gray-200 bg-white shadow-lg"
          >
            <div className="px-4 py-3 space-y-1">
              <Link
                to="/"
                className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-all duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                <HomeIcon className="h-4 w-4 mr-3 text-gray-400" />
                Home
              </Link>
              <Link
                to="/book-appointment"
                className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-all duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                <CalendarIcon className="h-4 w-4 mr-3 text-gray-400" />
                Book Appointment
              </Link>
              {isAuthenticated && (
                <Link
                  to="/doctors"
                  className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserGroupIcon className="h-4 w-4 mr-3 text-gray-400" />
                  Doctors
                </Link>
              )}
              <Link
                to="/patients/view"
                className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-all duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                <UserGroupIcon className="h-4 w-4 mr-3 text-gray-400" />
                Patients
              </Link>
              {canAccessLivePatient && (
                <Link
                  to="/patients/live"
                  className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <HeartIcon className="h-4 w-4 mr-3 text-gray-400" />
                  Live Patient
                </Link>
              )}
              <div className="border-t border-gray-200 pt-3 mt-2 space-y-2">
                {user?.role && (
                  <div className="px-3">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border-2 shadow-sm ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
                >
                  <span className="mr-3 text-base">🚪</span>
                  Sign out
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Header;
