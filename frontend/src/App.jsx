import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import PrivateRoute from './components/common/PrivateRoute';
import RoleRoute from './components/common/RoleRoute';

import HomePage from './pages/HomePage';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';

import PatientDashboard from './components/patient/Dashboard';
import PatientProfile from './components/patient/Profile';
import Reports from './components/patient/Reports';
import PatientPrescriptions from './components/patient/Prescriptions';

import DoctorDashboard from './components/doctor/Dashboard';
import DoctorProfile from './components/doctor/Profile';
import DoctorAvailability from './components/doctor/Availability';
import DoctorPrescriptions from './components/doctor/Prescriptions';

import DoctorSearch from './components/appointment/DoctorSearch';
import BookingForm from './components/appointment/BookingForm';
import AppointmentList from './components/appointment/AppointmentList';

import JitsiMeetingRoom from './components/telemedicine/JitsiMeetingRoom';
import PaymentForm from './components/payment/PaymentForm';
import PaymentHistory from './components/payment/PaymentHistory';

import SymptomChecker from './components/ai/SymptomChecker';

import AdminDashboard from './components/admin/Dashboard';
import UserMgmt from './components/admin/UserMgmt';
import DoctorVerify from './components/admin/DoctorVerify';
import Transactions from './components/admin/Transactions';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
              <Route path="/doctors" element={<DoctorSearch />} />

              {/* Patient Routes */}
              <Route path="/patient/dashboard" element={
                <RoleRoute roles={['PATIENT']}><PatientDashboard /></RoleRoute>
              } />
              <Route path="/patient/profile" element={
                <RoleRoute roles={['PATIENT']}><PatientProfile /></RoleRoute>
              } />
              <Route path="/patient/reports" element={
                <RoleRoute roles={['PATIENT']}><Reports /></RoleRoute>
              } />
              <Route path="/patient/prescriptions" element={
                <RoleRoute roles={['PATIENT']}><PatientPrescriptions /></RoleRoute>
              } />
              <Route path="/patient/appointments" element={
                <RoleRoute roles={['PATIENT']}><AppointmentList /></RoleRoute>
              } />
              <Route path="/patient/payments" element={
                <RoleRoute roles={['PATIENT']}><PaymentHistory /></RoleRoute>
              } />

              {/* Doctor Routes */}
              <Route path="/doctor/dashboard" element={
                <RoleRoute roles={['DOCTOR']}><DoctorDashboard /></RoleRoute>
              } />
              <Route path="/doctor/profile" element={
                <RoleRoute roles={['DOCTOR']}><DoctorProfile /></RoleRoute>
              } />
              <Route path="/doctor/availability" element={
                <RoleRoute roles={['DOCTOR']}><DoctorAvailability /></RoleRoute>
              } />
              <Route path="/doctor/prescriptions" element={
                <RoleRoute roles={['DOCTOR']}><DoctorPrescriptions /></RoleRoute>
              } />
              <Route path="/doctor/appointments" element={
                <RoleRoute roles={['DOCTOR']}><AppointmentList /></RoleRoute>
              } />

              {/* Shared Auth Routes */}
              <Route path="/doctors/:doctorId/book" element={
                <PrivateRoute><BookingForm /></PrivateRoute>
              } />
              <Route path="/appointments/:appointmentId/video" element={
                <PrivateRoute><JitsiMeetingRoom /></PrivateRoute>
              } />
              <Route path="/payment/:appointmentId" element={
                <RoleRoute roles={['PATIENT']}><PaymentForm /></RoleRoute>
              } />
              <Route path="/symptom-checker" element={
                <RoleRoute roles={['PATIENT']}><SymptomChecker /></RoleRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={
                <RoleRoute roles={['ADMIN']}><AdminDashboard /></RoleRoute>
              } />
              <Route path="/admin/users" element={
                <RoleRoute roles={['ADMIN']}><UserMgmt /></RoleRoute>
              } />
              <Route path="/admin/doctors/verify" element={
                <RoleRoute roles={['ADMIN']}><DoctorVerify /></RoleRoute>
              } />
              <Route path="/admin/transactions" element={
                <RoleRoute roles={['ADMIN']}><Transactions /></RoleRoute>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
        <ToastContainer position="top-right" autoClose={3000} />
      </Router>
    </AuthProvider>
  );
}
