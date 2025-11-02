import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';
import { useAppSelector } from '../hooks/redux';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { loading } = useAppSelector((state) => state.ui);

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.addEventListener('scroll', handleScroll);
      return () => mainElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30 flex overflow-hidden relative">
      {/* Background decorative elements with animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-0 -left-4 w-96 h-96 bg-primary-300/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-0 -right-4 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-300/15 rounded-full blur-3xl"
        />
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Mobile sidebar overlay with backdrop blur */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        userRole={user?.role || 'User'}
      />

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Header with enhanced glass effect */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          <motion.div
            animate={{
              background: isScrolled
                ? 'rgba(255, 255, 255, 0.95)'
                : 'rgba(255, 255, 255, 0.85)',
              boxShadow: isScrolled
                ? '0 4px 20px rgba(0, 0, 0, 0.08)'
                : '0 2px 10px rgba(0, 0, 0, 0.04)',
            }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 backdrop-blur-xl border-b border-gray-200/50"
          />
          <div className="relative">
            <Header 
              setSidebarOpen={setSidebarOpen}
              user={user}
            />
          </div>
        </motion.div>
        
        {/* Main content area with scrollable container */}
        <main 
          className="flex-1 relative overflow-y-auto focus:outline-none"
          onScroll={(e) => {
            const target = e.target as HTMLElement;
            setIsScrolled(target.scrollTop > 10);
          }}
        >
          {/* Enhanced custom scrollbar styling */}
          <style>{`
            main::-webkit-scrollbar {
              width: 10px;
            }
            main::-webkit-scrollbar-track {
              background: rgba(241, 245, 249, 0.5);
              border-radius: 10px;
            }
            main::-webkit-scrollbar-thumb {
              background: linear-gradient(to bottom, rgba(99, 102, 241, 0.4), rgba(139, 92, 246, 0.4));
              border-radius: 10px;
              border: 2px solid rgba(241, 245, 249, 0.5);
            }
            main::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(to bottom, rgba(99, 102, 241, 0.6), rgba(139, 92, 246, 0.6));
            }
            @supports (scrollbar-width: thin) {
              main {
                scrollbar-width: thin;
                scrollbar-color: rgba(99, 102, 241, 0.4) rgba(241, 245, 249, 0.5);
              }
            }
          `}</style>
          
          <div className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 min-h-full">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.5,
                  ease: [0.25, 0.1, 0.25, 1]
                }}
                className="space-y-6"
              >
                {children}
              </motion.div>
            </div>
          </div>
        </main>
      </div>

      {/* Global loading overlay with modern design */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            {/* Enhanced backdrop with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-br from-gray-900/50 via-gray-800/40 to-gray-900/50 backdrop-blur-xl"
            />
            
            {/* Enhanced loading card */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ 
                duration: 0.3,
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
              className="relative bg-white/98 backdrop-blur-2xl rounded-3xl shadow-2xl p-10 border border-white/30 max-w-sm w-full mx-4"
            >
              <div className="flex flex-col items-center space-y-6">
                {/* Enhanced modern spinner with gradient */}
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-gradient-to-r from-primary-100 to-secondary-100 rounded-full"></div>
                  <motion.div
                    className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent rounded-full"
                    style={{
                      borderTopColor: 'rgb(99, 102, 241)',
                      borderRightColor: 'rgb(139, 92, 246)',
                    }}
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                  {/* Inner pulsing circle */}
                  <motion.div
                    className="absolute inset-2 bg-gradient-to-br from-primary-200 to-secondary-200 rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </div>
                
                {/* Loading text with animation */}
                <div className="text-center">
                  <motion.p
                    animate={{
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="text-gray-800 font-semibold text-xl"
                  >
                    Loading
                  </motion.p>
                  <p className="text-gray-500 text-sm mt-2 font-medium">Please wait while we process your request...</p>
                </div>
              </div>
              
              {/* Enhanced animated dots with gradient */}
              <div className="flex justify-center space-x-2 mt-6">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-full shadow-lg"
                    animate={{
                      y: [0, -12, 0],
                      opacity: [0.4, 1, 0.4],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>

              {/* Progress bar animation */}
              <motion.div
                className="mt-6 h-1 bg-gray-200 rounded-full overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 rounded-full"
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  style={{ width: '40%' }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardLayout;
