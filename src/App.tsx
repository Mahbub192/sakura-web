import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { store } from './store';
import { useAuth } from './hooks/useAuth';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import HomePage from './pages/home/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import AppointmentsPage from './pages/appointments/AppointmentsPage';
import BookAppointmentPage from './pages/appointments/BookAppointmentPage';
import PatientBookingPage from './pages/patients/PatientBookingPage';
import DoctorsPage from './pages/doctors/DoctorsPage';
import PatientsPage from './pages/patients/PatientsPage';
import PatientsViewPage from './pages/patients/PatientsViewPage';
import AdminPage from './pages/admin/AdminPage';

// Components
import LoadingSpinner from './components/ui/LoadingSpinner';
import ProtectedRoute from './components/common/ProtectedRoute';

import 'react-toastify/dist/ReactToastify.css';
import './index.css';

const AppContent: React.FC = () => {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : 
          <AuthLayout><LoginPage /></AuthLayout>
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : 
          <AuthLayout><RegisterPage /></AuthLayout>
        } />
        <Route path="/book-appointment" element={
          isAuthenticated ? 
          <DashboardLayout><PatientBookingPage /></DashboardLayout> : 
          <AuthLayout><BookAppointmentPage /></AuthLayout>
        } />
        <Route path="/patients/view" element={<PatientsViewPage />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout><DashboardPage /></DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/appointments" element={
          <ProtectedRoute allowedRoles={['Admin', 'Doctor', 'Assistant']}>
            <DashboardLayout><AppointmentsPage /></DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/doctors" element={
          <ProtectedRoute allowedRoles={['Admin', 'Doctor', 'Assistant']}>
            <DashboardLayout><DoctorsPage /></DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/patients" element={
          <ProtectedRoute allowedRoles={['Admin', 'Doctor', 'Assistant', 'User']}>
            <DashboardLayout><PatientsPage /></DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/patients/book" element={
          <ProtectedRoute allowedRoles={['User']}>
            <DashboardLayout><PatientBookingPage /></DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <DashboardLayout><AdminPage /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Default Routes */}
        <Route path="/" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
        } />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;