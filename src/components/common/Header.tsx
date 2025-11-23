import React, { useState, useRef, useEffect } from 'react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { User } from '../../types';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/redux';
import { logoutUser } from '../../store/slices/authSlice';

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
  user: User | null;
}

const Header: React.FC<HeaderProps> = ({ setSidebarOpen, user }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getUserName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.email) {
      return user.email;
    }
    return 'User';
  };

  const getUserRole = () => {
    if (user?.role) {
      return user.role;
    }
    return 'User';
  };

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 sm:px-6 py-3 sticky top-0 z-10">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mr-2"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      {/* Search Bar */}
      <div className="flex flex-1 justify-start">
        <label className="w-full max-w-lg">
          <div className="relative flex w-full flex-1 items-stretch rounded-lg h-10">
            <div className="text-gray-500 dark:text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">search</span>
            </div>
            <input
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-gray-100 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700/50 h-full placeholder:text-gray-500 dark:placeholder:text-gray-400 pl-10 pr-4 text-sm font-normal leading-normal"
              placeholder="Search patients, tasks..."
              type="search"
            />
          </div>
        </label>
      </div>

      {/* Right Section - Notifications & Profile */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 w-10 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
          <span className="material-symbols-outlined text-xl">notifications</span>
        </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center justify-center rounded-full size-10 bg-primary text-white font-semibold hover:bg-primary/90 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {getUserInitials()}
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
              {/* User Info Section */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center rounded-full size-12 bg-primary text-white font-semibold">
                    {getUserInitials()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {getUserName()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.email || 'No email'}
                    </p>
                    <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mt-1">
                      {getUserRole()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    // Navigate to profile page if exists, or do nothing
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">person</span>
                  <span>Profile</span>
                </button>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    // Navigate to settings if exists
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">settings</span>
                  <span>Settings</span>
                </button>
              </div>

              {/* Logout Button */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">logout</span>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
