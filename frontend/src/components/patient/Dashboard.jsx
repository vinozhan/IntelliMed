import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getPatientAppointments } from '../../api/appointmentApi';
import { formatDate, formatTime } from '../../utils/helpers';
import PageHeader from '../ui/PageHeader';
import Card from '../ui/Card';
import StatsCard from '../ui/StatsCard';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { SkeletonCard } from '../ui/Skeleton';
import EmptyState from '../ui/EmptyState';
import {
  Calendar, FileText, Brain, Search, ClipboardList, Pill,
  CreditCard, Video, ArrowRight,
} from 'lucide-react';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPatientAppointments()
      .then(({ data }) => setAppointments(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const upcoming = appointments.filter(
    (a) => a.status === 'CONFIRMED' || a.status === 'PENDING'
  );
  const completed = appointments.filter((a) => a.status === 'COMPLETED');

  const quickActions = [
    { icon: Search, label: 'Find Doctors', desc: 'Search & book', path: '/doctors', color: 'bg-primary-100 text-primary-600' },
    { icon: ClipboardList, label: 'Appointments', desc: 'View all', path: '/patient/appointments', color: 'bg-blue-100 text-blue-600' },
    { icon: Pill, label: 'Prescriptions', desc: 'Your meds', path: '/patient/prescriptions', color: 'bg-danger-100 text-danger-600' },
    { icon: FileText, label: 'Reports', desc: 'Upload & view', path: '/patient/reports', color: 'bg-accent-100 text-accent-600' },
    { icon: Brain, label: 'AI Checker', desc: 'Symptom analysis', path: '/symptom-checker', color: 'bg-purple-100 text-purple-600' },
    { icon: CreditCard, label: 'Payments', desc: 'History', path: '/patient/payments', color: 'bg-warm-100 text-warm-600' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title={`Welcome back, ${user?.firstName}!`}
        subtitle="Here's an overview of your health dashboard"
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatsCard icon={Calendar} label="Upcoming" value={loading ? '-' : upcoming.length} color="primary" loading={loading} />
        <StatsCard icon={ClipboardList} label="Completed" value={loading ? '-' : completed.length} color="accent" loading={loading} />
        <StatsCard icon={Pill} label="Total Visits" value={loading ? '-' : appointments.length} color="purple" loading={loading} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {quickActions.map((item) => (
          <Link key={item.path} to={item.path}>
            <Card variant="interactive" className="text-center !p-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 ${item.color.split(' ')[0]}`}>
                <item.icon size={20} className={item.color.split(' ')[1]} />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">{item.label}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold font-heading text-slate-800">Upcoming Appointments</h2>
          <Link to="/patient/appointments" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>
        ) : upcoming.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No upcoming appointments"
            description="Browse doctors and book your first appointment"
          />
        ) : (
          <div className="space-y-3">
            {upcoming.slice(0, 5).map((apt) => (
              <div
                key={apt.id}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                    <Calendar size={18} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Appointment #{apt.id}</p>
                    <p className="text-xs text-slate-500">
                      {formatDate(apt.appointmentDate)} at {formatTime(apt.startTime)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge status={apt.status} dot />
                  {apt.status === 'CONFIRMED' && (
                    <Link to={`/appointments/${apt.id}/video`}>
                      <Button size="sm" variant="accent" icon={Video}>Join</Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
