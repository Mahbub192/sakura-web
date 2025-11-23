import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon as XIcon,
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
      { name: 'Dashboard', href: '/dashboard', icon: 'dashboard', roles: ['Admin', 'Doctor', 'Assistant', 'User'] },
    ];

    const roleBasedItems = [
      { name: 'Appointments', href: '/appointments', icon: 'calendar_month', roles: ['Admin', 'Doctor', 'Assistant'] },
      { name: 'All Patients', href: '/patients', icon: 'groups', roles: ['Admin', 'Doctor', 'Assistant'] },
      { name: 'Patients View', href: '/patients/view', icon: 'groups', roles: ['Admin', 'Doctor', 'Assistant'] },
      { name: 'Medical Records', href: '/patients/medical-records', icon: 'folder_shared', roles: ['Admin', 'Doctor', 'Assistant'] },
      { name: 'Prescriptions', href: '/appointments', icon: 'medication', roles: ['Admin', 'Doctor'] },
      { name: 'Lab Results', href: '/appointments', icon: 'science', roles: ['Admin', 'Doctor'] },
      { name: 'Reports', href: '/global-dashboard', icon: 'analytics', roles: ['Admin', 'Doctor'] },
      { name: 'Doctors', href: '/doctors', icon: 'groups', roles: ['Admin', 'Assistant'] },
      { name: 'Assistants', href: '/assistants', icon: 'groups', roles: ['Doctor'] },
      { name: 'Book Appointment', href: '/assistants/booking', icon: 'calendar_month', roles: ['Assistant'] },
      { name: 'Clinics', href: '/clinics', icon: 'business', roles: ['Admin'] },
      { name: 'My Appointments', href: '/patients', icon: 'calendar_month', roles: ['User'] },
      { name: 'Book Appointment', href: '/patients/book', icon: 'calendar_month', roles: ['User'] },
      { name: 'Administration', href: '/admin', icon: 'admin_panel_settings', roles: ['Admin'] },
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
        <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Logo Section */}
          <Link
            to="/"
            className="flex items-center gap-3 px-6 py-5 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
          >
            <div className="size-7 flex-shrink-0">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdYN9JbR2n48wjiZSibJWa5ve0Z_7G431jr3bBcYcIKsaS_KB6RdluSVMpmDmkzkgx_dMiqGK6R7pCstLDV6sntafm8uI-G-QSBipZEou1-eL3HifSLhFvj7RFAd7cE8Xu10TCwLKy0RSVWFgWLReti2IehcHTV3kS9ZNHxyJouelhj9vrmgZn0HAEGP19XUpUSnwZPiggt9WI1IMgd-wub9hNVaJqTZb_NkjMeez5-0HPmarGSdnM0o9llLWLLB7eFTmFPD4SOskt"
                alt="Sakura"
                className="w-full h-full object-cover rounded"
              />
            </div>
            <h2 className="text-xl font-bold leading-tight tracking-[-0.015em]">Sakura</h2>
          </Link>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary dark:bg-primary/20'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Settings */}
          <div className="px-4 py-6">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 font-medium"
            >
              <span className="material-symbols-outlined text-xl">settings</span>
              <span>Settings</span>
            </Link>
          </div>
        </aside>
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
            className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-2xl border-r border-gray-200 dark:border-gray-700"
          >
            <div className="flex flex-col h-full">
              {/* Mobile Header */}
              <div className="flex items-center justify-between flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <Link
                  to="/"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <div className="size-7 flex-shrink-0">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdYN9JbR2n48wjiZSibJWa5ve0Z_7G431jr3bBcYcIKsaS_KB6RdluSVMpmDmkzkgx_dMiqGK6R7pCstLDV6sntafm8uI-G-QSBipZEou1-eL3HifSLhFvj7RFAd7cE8Xu10TCwLKy0RSVWFgWLReti2IehcHTV3kS9ZNHxyJouelhj9vrmgZn0HAEGP19XUpUSnwZPiggt9WI1IMgd-wub9hNVaJqTZb_NkjMeez5-0HPmarGSdnM0o9llLWLLB7eFTmFPD4SOskt"
                      alt="Sakura"
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  <h2 className="text-xl font-bold leading-tight tracking-[-0.015em] text-gray-900 dark:text-white">Sakura</h2>
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <XIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              
              {/* Mobile Navigation */}
              <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                        isActive
                          ? 'bg-primary/10 text-primary dark:bg-primary/20'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xl">{item.icon}</span>
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile Settings */}
              <div className="px-4 py-6 border-t border-gray-200 dark:border-gray-700">
                <Link
                  to="/dashboard"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 font-medium"
                >
                  <span className="material-symbols-outlined text-xl">settings</span>
                  <span>Settings</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
