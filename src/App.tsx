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
import LivePatientPage from './pages/patients/LivePatientPage';
import AdminPage from './pages/admin/AdminPage';
import CreateDoctorProfilePage from './pages/profile/CreateDoctorProfilePage';
import CreateAssistantProfilePage from './pages/profile/CreateAssistantProfilePage';
import CreateUserProfilePage from './pages/profile/CreateUserProfilePage';

// Components
import LoadingSpinner from './components/ui/LoadingSpinner';
import ProtectedRoute from './components/common/ProtectedRoute';

import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AssistantsPage from './pages/assistants/AssistantsPage';
import AssistantBookingPage from './pages/assistants/AssistantBookingPage';
import ClinicsPage from './pages/clinics/ClinicsPage';
import GlobalDashboardPage from './pages/admin/GlobalDashboardPage';

const AppContent: React.FC = () => {
  const { isLoading, isAuthenticated, user } = useAuth();

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
          (user?.role === 'Assistant' ? 
            <Navigate to="/assistants/booking" replace /> :
            <DashboardLayout><PatientBookingPage /></DashboardLayout>
          ) : 
          <AuthLayout><BookAppointmentPage /></AuthLayout>
        } />
        <Route path="/patients/view" element={
          <ProtectedRoute allowedRoles={['Admin', 'Doctor', 'Assistant']}>
            <DashboardLayout><PatientsViewPage /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/patients/live" element={
          <ProtectedRoute allowedRoles={['Admin', 'Doctor', 'Assistant']}>
            <LivePatientPage />
          </ProtectedRoute>
        } />

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
        
        {/* Profile Creation Routes */}
        <Route path="/profile/create-doctor" element={
          <ProtectedRoute allowedRoles={['Doctor']}>
            <DashboardLayout><CreateDoctorProfilePage /></DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/profile/create-assistant" element={
          <ProtectedRoute allowedRoles={['Assistant']}>
            <DashboardLayout><CreateAssistantProfilePage /></DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/profile/create-user" element={
          <ProtectedRoute>
            <DashboardLayout><CreateUserProfilePage /></DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <DashboardLayout><AdminPage /></DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/users" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <DashboardLayout><AdminUsersPage /></DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/assistants" element={
          <ProtectedRoute allowedRoles={['Doctor']}>
            <DashboardLayout><AssistantsPage /></DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/assistants/booking" element={
          <ProtectedRoute allowedRoles={['Assistant']}>
            <DashboardLayout><AssistantBookingPage /></DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/clinics" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <DashboardLayout><ClinicsPage /></DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/global-dashboard" element={
          <ProtectedRoute allowedRoles={['Admin', 'Doctor']}>
            <DashboardLayout><GlobalDashboardPage /></DashboardLayout>
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