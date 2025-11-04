import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HomeIcon, 
  CalendarIcon, 
  UsersIcon,
  CogIcon,
  ArrowRightOnRectangleIcon as LogoutIcon,
  XMarkIcon as XIcon,
  HeartIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  UserIcon,
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
      { name: 'Assistants', href: '/assistants', icon: UserIcon, roles: ['Doctor'] },
      { name: 'Book Appointment', href: '/assistants/booking', icon: CalendarIcon, roles: ['Assistant'] },
      { name: 'Clinics', href: '/clinics', icon: BuildingOfficeIcon, roles: ['Admin'] },
      { name: 'Global Dashboard', href: '/global-dashboard', icon: ChartBarIcon, roles: ['Admin', 'Doctor'] },
      { name: 'My Appointments', href: '/patients', icon: CalendarIcon, roles: ['User'] },
      { name: 'Book Appointment', href: '/patients/book', icon: CalendarIcon, roles: ['User'] },
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
        <div className="flex flex-col w-64 h-full">
          <div className="flex flex-col flex-grow bg-gradient-to-b from-white to-gray-50/50 border-r border-gray-200 shadow-sm overflow-y-auto">
            <nav className="flex-1 px-3 pt-3 space-y-1">
              {navigation.map((item, index) => {
                const isActive = location.pathname === item.href;
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={item.href}
                      className={`
                        group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 relative
                        ${isActive
                          ? 'bg-gradient-to-r from-primary-50 to-primary-100/50 text-primary-700 shadow-sm border-l-3 border-primary-500'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }
                      `}
                      style={isActive ? { borderLeftWidth: '3px' } : {}}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-500 to-primary-600 rounded-r-full"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      <item.icon
                        className={`mr-3 flex-shrink-0 h-5 w-5 transition-colors ${
                          isActive ? 'text-primary-600' : 'text-gray-500 group-hover:text-gray-700'
                        }`}
                      />
                      <span className="flex-1">{item.name}</span>
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-1.5 h-1.5 rounded-full bg-primary-600"
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
              
              <div className="border-t border-gray-200 my-2"></div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navigation.length * 0.05 }}
              >
                <button
                  onClick={handleLogout}
                  className="group flex items-center w-full px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-700 transition-all duration-200"
                >
                  <LogoutIcon className="mr-3 flex-shrink-0 h-5 w-5 text-gray-500 group-hover:text-red-600 transition-colors" />
                  <span className="flex-1 text-left">Logout</span>
                </button>
              </motion.div>
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            variants={sidebarVariants}
            initial="closed"
            animate={sidebarOpen ? 'open' : 'closed'}
            exit="closed"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-white to-gray-50/50 shadow-2xl border-r border-gray-200"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-end flex-shrink-0 p-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <XIcon className="h-6 w-6 text-gray-500" />
                </button>
              </div>
              
              <nav className="mt-2 flex-1 px-3 space-y-1 overflow-y-auto">
                {navigation.map((item, index) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        to={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`
                          group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 relative
                          ${isActive
                            ? 'bg-gradient-to-r from-primary-50 to-primary-100/50 text-primary-700 shadow-sm border-l-3 border-primary-500'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                          }
                        `}
                        style={isActive ? { borderLeftWidth: '3px' } : {}}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeIndicatorMobile"
                            className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-500 to-primary-600 rounded-r-full"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                        <item.icon
                          className={`mr-3 flex-shrink-0 h-5 w-5 transition-colors ${
                            isActive ? 'text-primary-600' : 'text-gray-500 group-hover:text-gray-700'
                          }`}
                        />
                        <span className="flex-1">{item.name}</span>
                        {isActive && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-1.5 h-1.5 rounded-full bg-primary-600"
                          />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
                
                <div className="border-t border-gray-200 my-2"></div>
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navigation.length * 0.05 }}
                >
                  <button
                    onClick={handleLogout}
                    className="group flex items-center w-full px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-700 transition-all duration-200"
                  >
                    <LogoutIcon className="mr-3 flex-shrink-0 h-5 w-5 text-gray-500 group-hover:text-red-600 transition-colors" />
                    <span className="flex-1 text-left">Logout</span>
                  </button>
                </motion.div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
