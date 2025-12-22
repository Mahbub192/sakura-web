import React from 'react';
import { Provider } from 'react-redux';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useAuth } from './hooks/useAuth';
import { store } from './store';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import AdminPage from './pages/admin/AdminPage';
import AppointmentsPage from './pages/appointments/AppointmentsPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import DoctorsPage from './pages/doctors/DoctorsPage';
import AboutMePage from './pages/home/AboutMePage';
import HomePage from './pages/home/HomePage';
import LivePatientPage from './pages/patients/LivePatientPage';
import PatientBookingPage from './pages/patients/PatientBookingPage';
import PatientsPage from './pages/patients/PatientsPage';
import PatientsViewPage from './pages/patients/PatientsViewPage';
import TodayPatientPage from './pages/patients/TodayPatientPage';
import CreateAssistantProfilePage from './pages/profile/CreateAssistantProfilePage';
import CreateDoctorProfilePage from './pages/profile/CreateDoctorProfilePage';
import CreateUserProfilePage from './pages/profile/CreateUserProfilePage';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/ui/LoadingSpinner';

import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import GlobalDashboardPage from './pages/admin/GlobalDashboardPage';
import AssistantBookingPage from './pages/assistants/AssistantBookingPage';
import AssistantsPage from './pages/assistants/AssistantsPage';
import ClinicsPage from './pages/clinics/ClinicsPage';
import DoctorBookingPage from './pages/doctors/DoctorBookingPage';
import MessagesPage from './pages/messages/MessagesPage';
import PatientMessagesPage from './pages/messages/PatientMessagesPage';
import ReportsPage from './pages/reports/ReportsPage';
import SettingsPage from './pages/settings/SettingsPage';

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
        <Route path="/about-me" element={<AboutMePage />} />
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : 
          <AuthLayout><LoginPage /></AuthLayout>
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : 
          <AuthLayout><RegisterPage /></AuthLayout>
        } />
        <Route path="/book-appointment" element={
          <ProtectedRoute>
            <DashboardLayout><PatientBookingPage /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/patients/view" element={
          <ProtectedRoute allowedRoles={['Admin', 'Doctor', 'Assistant']}>
            <DashboardLayout><PatientsViewPage /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/patients/live" element={<LivePatientPage />} />
        <Route path="/patients/today" element={
          <ProtectedRoute allowedRoles={['Admin', 'Doctor']}>
            <DashboardLayout><TodayPatientPage /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout><DashboardPage /></DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/appointments" element={
          <ProtectedRoute allowedRoles={['Admin', 'Doctor']}>
            <DashboardLayout><AppointmentsPage /></DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/doctors" element={
          <ProtectedRoute allowedRoles={['Admin', 'Doctor', 'Assistant']}>
            <DashboardLayout><DoctorsPage /></DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/patients" element={
          <ProtectedRoute allowedRoles={['Admin', 'Doctor', 'User']}>
            <DashboardLayout><PatientsPage /></DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/patients/book" element={
          <ProtectedRoute allowedRoles={['User']}>
            <DashboardLayout><PatientBookingPage /></DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/patients/messages" element={
          <ProtectedRoute allowedRoles={['User']}>
            <DashboardLayout><PatientMessagesPage /></DashboardLayout>
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
        
        <Route path="/doctors/booking" element={
          <ProtectedRoute allowedRoles={['Doctor']}>
            <DashboardLayout><DoctorBookingPage /></DashboardLayout>
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
        
        <Route path="/reports" element={
          <ProtectedRoute allowedRoles={['Admin', 'Doctor']}>
            <DashboardLayout><ReportsPage /></DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute allowedRoles={['Admin', 'Doctor', 'Assistant', 'User']}>
            <DashboardLayout><SettingsPage /></DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/messages" element={
          <ProtectedRoute allowedRoles={['Admin', 'Doctor', 'Assistant']}>
            <DashboardLayout><MessagesPage /></DashboardLayout>
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