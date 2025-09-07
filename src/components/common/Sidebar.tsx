import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HomeIcon, 
  CalendarIcon, 
  UserGroupIcon, 
  UsersIcon,
  CogIcon,
  ArrowRightOnRectangleIcon as LogoutIcon,
  XMarkIcon as XIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import { useAppDispatch } from '../../hooks/redux';
import { logoutUser } from '../../store/slices/authSlice';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  userRole: string;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen, userRole }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['Admin', 'Doctor', 'Assistant', 'User'] },
    ];

    const roleBasedItems = [
      { name: 'Appointments', href: '/appointments', icon: CalendarIcon, roles: ['Admin', 'Doctor', 'Assistant'] },
      { name: 'Doctors', href: '/doctors', icon: HeartIcon, roles: ['Admin', 'Doctor', 'Assistant'] },
      { name: 'Patients', href: '/patients', icon: UsersIcon, roles: ['Admin', 'Doctor', 'Assistant'] },
      { name: 'Administration', href: '/admin', icon: CogIcon, roles: ['Admin'] },
    ];

    return [
      ...baseItems,
      ...roleBasedItems.filter(item => item.roles.includes(userRole))
    ];
  };

  const navigation = getNavigationItems();

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: '-100%' },
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4 mb-8">
              <div className="bg-primary-600 p-2 rounded-lg">
                <HeartIcon className="h-8 w-8 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">HealthCare</h1>
                <p className="text-sm text-gray-500">Management</p>
              </div>
            </div>
            
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200
                      ${isActive
                        ? 'bg-primary-100 text-primary-900 border-r-2 border-primary-500'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <item.icon
                      className={`mr-3 flex-shrink-0 h-5 w-5 ${
                        isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
              
              <button
                onClick={handleLogout}
                className="group flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
              >
                <LogoutIcon className="mr-3 flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-red-500" />
                Logout
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <motion.div
        variants={sidebarVariants}
        animate={sidebarOpen ? 'open' : 'closed'}
        transition={{ duration: 0.3 }}
        className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between flex-shrink-0 p-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="bg-primary-600 p-2 rounded-lg">
                <HeartIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-bold text-gray-900">HealthCare</h1>
                <p className="text-xs text-gray-500">Management</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-md hover:bg-gray-100"
            >
              <XIcon className="h-6 w-6 text-gray-500" />
            </button>
          </div>
          
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200
                    ${isActive
                      ? 'bg-primary-100 text-primary-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <item.icon
                    className={`mr-3 flex-shrink-0 h-5 w-5 ${
                      isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
            
            <button
              onClick={handleLogout}
              className="group flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
            >
              <LogoutIcon className="mr-3 flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-red-500" />
              Logout
            </button>
          </nav>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
