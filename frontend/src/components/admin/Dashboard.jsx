import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStats, getDoctorStats, getAppointmentStats, getPaymentStats } from '../../api/adminApi';
import PageHeader from '../ui/PageHeader';
import Card from '../ui/Card';
import StatsCard from '../ui/StatsCard';
import { Users, UserCheck, CreditCard, Calendar, DollarSign, Stethoscope, ClipboardList, ArrowRight } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAdminStats().catch(() => ({ data: {} })),
      getDoctorStats().catch(() => ({ data: {} })),
      getAppointmentStats().catch(() => ({ data: {} })),
      getPaymentStats().catch(() => ({ data: {} })),
    ])
      .then(([admin, doctor, appt, pay]) => {
        setStats({
          ...admin.data,
          ...doctor.data,
          ...appt.data,
          ...pay.data,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader title="Admin Dashboard" subtitle="Platform overview and management" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard icon={Users} label="Total Users" value={stats?.totalUsers ?? '-'} color="primary" loading={loading} />
        <StatsCard icon={Stethoscope} label="Doctors" value={stats?.totalDoctors ?? '-'} color="blue" loading={loading} />
        <StatsCard icon={Calendar} label="Appointments" value={stats?.totalAppointments ?? '-'} color="purple" loading={loading} />
        <StatsCard icon={DollarSign} label="Revenue" value={stats?.totalRevenue ? `$${stats.totalRevenue}` : '-'} color="accent" loading={loading} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard icon={Users} label="Patients" value={stats?.totalPatients ?? '-'} color="warm" loading={loading} />
        <StatsCard icon={UserCheck} label="Verified Doctors" value={stats?.verifiedDoctors ?? '-'} color="accent" loading={loading} />
        <StatsCard icon={ClipboardList} label="Pending Appts" value={stats?.pendingAppointments ?? '-'} color="warm" loading={loading} />
        <StatsCard icon={CreditCard} label="Payments" value={stats?.totalPayments ?? '-'} color="blue" loading={loading} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/admin/users">
          <Card variant="interactive" className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
              <Users size={24} className="text-primary-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-800">User Management</h3>
              <p className="text-xs text-slate-500">View and manage all users</p>
            </div>
            <ArrowRight size={16} className="text-slate-400" />
          </Card>
        </Link>
        <Link to="/admin/doctors/verify">
          <Card variant="interactive" className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center shrink-0">
              <UserCheck size={24} className="text-accent-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-800">Doctor Verification</h3>
              <p className="text-xs text-slate-500">Verify doctor profiles</p>
            </div>
            <ArrowRight size={16} className="text-slate-400" />
          </Card>
        </Link>
        <Link to="/admin/transactions">
          <Card variant="interactive" className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
              <CreditCard size={24} className="text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-800">Transactions</h3>
              <p className="text-xs text-slate-500">View payment history</p>
            </div>
            <ArrowRight size={16} className="text-slate-400" />
          </Card>
        </Link>
      </div>
    </div>
  );
}
