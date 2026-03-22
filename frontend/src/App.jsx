import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AppLayout from './components/layout/AppLayout';
import PublicLayout from './components/layout/PublicLayout';
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

function AuthenticatedRoute({ children, roles }) {
  const Wrapper = roles ? RoleRoute : PrivateRoute;
  return (
    <Wrapper roles={roles}>
      <AppLayout>{children}</AppLayout>
    </Wrapper>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/doctors" element={<PublicLayout><DoctorSearch /></PublicLayout>} />

          {/* Patient Routes */}
          <Route path="/patient/dashboard" element={
            <AuthenticatedRoute roles={['PATIENT']}><PatientDashboard /></AuthenticatedRoute>
          } />
          <Route path="/patient/profile" element={
            <AuthenticatedRoute roles={['PATIENT']}><PatientProfile /></AuthenticatedRoute>
          } />
          <Route path="/patient/reports" element={
            <AuthenticatedRoute roles={['PATIENT']}><Reports /></AuthenticatedRoute>
          } />
          <Route path="/patient/prescriptions" element={
            <AuthenticatedRoute roles={['PATIENT']}><PatientPrescriptions /></AuthenticatedRoute>
          } />
          <Route path="/patient/appointments" element={
            <AuthenticatedRoute roles={['PATIENT']}><AppointmentList /></AuthenticatedRoute>
          } />
          <Route path="/patient/payments" element={
            <AuthenticatedRoute roles={['PATIENT']}><PaymentHistory /></AuthenticatedRoute>
          } />

          {/* Doctor Routes */}
          <Route path="/doctor/dashboard" element={
            <AuthenticatedRoute roles={['DOCTOR']}><DoctorDashboard /></AuthenticatedRoute>
          } />
          <Route path="/doctor/profile" element={
            <AuthenticatedRoute roles={['DOCTOR']}><DoctorProfile /></AuthenticatedRoute>
          } />
          <Route path="/doctor/availability" element={
            <AuthenticatedRoute roles={['DOCTOR']}><DoctorAvailability /></AuthenticatedRoute>
          } />
          <Route path="/doctor/prescriptions" element={
            <AuthenticatedRoute roles={['DOCTOR']}><DoctorPrescriptions /></AuthenticatedRoute>
          } />
          <Route path="/doctor/appointments" element={
            <AuthenticatedRoute roles={['DOCTOR']}><AppointmentList /></AuthenticatedRoute>
          } />

          {/* Shared Auth Routes */}
          <Route path="/doctors/:doctorId/book" element={
            <AuthenticatedRoute><BookingForm /></AuthenticatedRoute>
          } />
          <Route path="/appointments/:appointmentId/video" element={
            <PrivateRoute><JitsiMeetingRoom /></PrivateRoute>
          } />
          <Route path="/payment/:appointmentId" element={
            <AuthenticatedRoute roles={['PATIENT']}><PaymentForm /></AuthenticatedRoute>
          } />
          <Route path="/symptom-checker" element={
            <AuthenticatedRoute roles={['PATIENT']}><SymptomChecker /></AuthenticatedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <AuthenticatedRoute roles={['ADMIN']}><AdminDashboard /></AuthenticatedRoute>
          } />
          <Route path="/admin/users" element={
            <AuthenticatedRoute roles={['ADMIN']}><UserMgmt /></AuthenticatedRoute>
          } />
          <Route path="/admin/doctors/verify" element={
            <AuthenticatedRoute roles={['ADMIN']}><DoctorVerify /></AuthenticatedRoute>
          } />
          <Route path="/admin/transactions" element={
            <AuthenticatedRoute roles={['ADMIN']}><Transactions /></AuthenticatedRoute>
          } />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          toastClassName="!rounded-xl !shadow-lg !font-body"
        />
      </Router>
    </AuthProvider>
  );
}
