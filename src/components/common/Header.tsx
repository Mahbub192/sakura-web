import React from 'react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { User } from '../../types';

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
  user: User | null;
}

const Header: React.FC<HeaderProps> = ({ setSidebarOpen, user }) => {

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

        {/* Profile Picture */}
        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
          style={{
            backgroundImage: user?.firstName && user?.lastName
              ? `url(https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=2b8cee&color=fff&size=128)`
              : 'url(https://ui-avatars.com/api/?name=User&background=2b8cee&color=fff&size=128)'
          }}
        />
      </div>
    </header>
  );
};

export default Header;
