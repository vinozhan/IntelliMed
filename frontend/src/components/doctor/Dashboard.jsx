import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getDoctorAppointments } from '../../api/appointmentApi';
import { getDoctorProfile } from '../../api/doctorApi';
import { formatDate, formatTime } from '../../utils/helpers';
import PageHeader from '../ui/PageHeader';
import Card from '../ui/Card';
import StatsCard from '../ui/StatsCard';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';
import { SkeletonCard } from '../ui/Skeleton';
import {
  Calendar, Clock, FileText, Video, Users, CheckCircle,
  AlertTriangle, ArrowRight, ClipboardList,
} from 'lucide-react';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDoctorAppointments(),
      getDoctorProfile().catch(() => null),
    ])
      .then(([aptsRes, profileRes]) => {
        setAppointments(aptsRes.data);
        if (profileRes) setProfile(profileRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pending = appointments.filter((a) => a.status === 'PENDING');
  const confirmed = appointments.filter((a) => a.status === 'CONFIRMED');
  const completed = appointments.filter((a) => a.status === 'COMPLETED');
  const upcoming = appointments.filter((a) => a.status === 'CONFIRMED' || a.status === 'PENDING');

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title={`Dr. ${user?.firstName} ${user?.lastName}`}
        subtitle={profile ? `${profile.specialty} | ${profile.hospital}` : 'Welcome to your dashboard'}
      />

      {!profile && !loading && (
        <Card variant="bordered" className="!bg-warm-50 !border-warm-200 mb-6">
          <div className="flex items-center gap-3">
            <AlertTriangle size={18} className="text-warm-600" />
            <p className="text-sm text-warm-800">
              Please complete your doctor profile.{' '}
              <Link to="/doctor/profile" className="text-primary-600 font-medium underline">Set up profile</Link>
            </p>
          </div>
        </Card>
      )}

      {profile && !profile.isVerified && (
        <Card variant="bordered" className="!bg-blue-50 !border-blue-200 mb-6">
          <div className="flex items-center gap-3">
            <Clock size={18} className="text-blue-600" />
            <p className="text-sm text-blue-800">Your profile is pending verification by an admin. Patients can still book appointments.</p>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard icon={Clock} label="Pending" value={loading ? '-' : pending.length} color="warm" loading={loading} />
        <StatsCard icon={CheckCircle} label="Confirmed" value={loading ? '-' : confirmed.length} color="primary" loading={loading} />
        <StatsCard icon={Users} label="Completed" value={loading ? '-' : completed.length} color="accent" loading={loading} />
        <StatsCard icon={Calendar} label="Total" value={loading ? '-' : appointments.length} color="purple" loading={loading} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Link to="/doctor/availability">
          <Card variant="interactive" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
              <Clock size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Manage Availability</h3>
              <p className="text-xs text-slate-500">Set your schedule</p>
            </div>
          </Card>
        </Link>
        <Link to="/doctor/prescriptions">
          <Card variant="interactive" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center shrink-0">
              <FileText size={20} className="text-accent-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Prescriptions</h3>
              <p className="text-xs text-slate-500">Write & manage</p>
            </div>
          </Card>
        </Link>
        <Link to="/doctor/profile">
          <Card variant="interactive" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
              <Calendar size={20} className="text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">My Profile</h3>
              <p className="text-xs text-slate-500">Edit details</p>
            </div>
          </Card>
        </Link>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold font-heading text-slate-800">Upcoming Appointments</h2>
          <Link to="/doctor/appointments" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>
        ) : upcoming.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No upcoming appointments" />
        ) : (
          <div className="space-y-3">
            {upcoming.slice(0, 5).map((apt) => (
              <div key={apt.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                    <Calendar size={18} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      Patient <span className="font-mono">#{apt.patientId}</span> &middot; Appt <span className="font-mono">#{apt.id}</span>
                    </p>
                    <p className="text-xs text-slate-500">{formatDate(apt.appointmentDate)} at {formatTime(apt.startTime)}</p>
                    {apt.reason && <p className="text-xs text-slate-400">{apt.reason}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge status={apt.status} dot />
                  {apt.status === 'CONFIRMED' && (
                    <Link to={`/appointments/${apt.id}/video`}>
                      <Button size="sm" variant="accent" icon={Video}>Start</Button>
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
