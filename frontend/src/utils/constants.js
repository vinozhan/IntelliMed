import {
  LayoutDashboard, Calendar, ClipboardList, Pill, FileText, Brain,
  User, Search, Clock, Users, UserCheck, CreditCard, Stethoscope,
  Video, Bell,
} from 'lucide-react';

export const ROLES = {
  PATIENT: 'PATIENT',
  DOCTOR: 'DOCTOR',
  ADMIN: 'ADMIN',
};

export const APPOINTMENT_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  REJECTED: 'REJECTED',
};

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
};

export const SEVERITY_COLORS = {
  LOW: 'text-accent-700 bg-accent-100',
  MEDIUM: 'text-warm-700 bg-warm-100',
  HIGH: 'text-orange-700 bg-orange-100',
  CRITICAL: 'text-danger-700 bg-danger-100',
};

export const NAV_ITEMS = {
  PATIENT: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/patient/dashboard' },
    { icon: Search, label: 'Find Doctors', path: '/doctors' },
    { icon: ClipboardList, label: 'Appointments', path: '/patient/appointments' },
    { icon: Pill, label: 'Prescriptions', path: '/patient/prescriptions' },
    { icon: FileText, label: 'Medical Reports', path: '/patient/reports' },
    { icon: CreditCard, label: 'Payments', path: '/patient/payments' },
    { icon: Brain, label: 'Symptom Checker', path: '/symptom-checker' },
    { icon: User, label: 'My Profile', path: '/patient/profile' },
  ],
  DOCTOR: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/doctor/dashboard' },
    { icon: ClipboardList, label: 'Appointments', path: '/doctor/appointments' },
    { icon: Clock, label: 'Availability', path: '/doctor/availability' },
    { icon: Pill, label: 'Prescriptions', path: '/doctor/prescriptions' },
    { icon: User, label: 'My Profile', path: '/doctor/profile' },
  ],
  ADMIN: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: UserCheck, label: 'Doctor Verification', path: '/admin/doctors/verify' },
    { icon: CreditCard, label: 'Transactions', path: '/admin/transactions' },
  ],
};
