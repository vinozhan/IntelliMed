import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  getPatientAppointments, getDoctorAppointments,
  cancelAppointment, confirmAppointment, completeAppointment, rejectAppointment,
} from '../../api/appointmentApi';
import { getDoctorPrescriptions } from '../../api/doctorApi';
import { getPatientPayments } from '../../api/paymentApi';
import { formatDate, formatTime } from '../../utils/helpers';
import { toast } from 'react-toastify';
import PageHeader from '../ui/PageHeader';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Tabs from '../ui/Tabs';
import ConfirmDialog from '../ui/ConfirmDialog';
import EmptyState from '../ui/EmptyState';
import { SkeletonCard } from '../ui/Skeleton';
import Avatar from '../ui/Avatar';
import EmptyCalendar from '../illustrations/EmptyCalendar';
import { Calendar, Video, ClipboardList } from 'lucide-react';

export default function AppointmentList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [prescriptionMap, setPrescriptionMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('ALL');
  const [confirmState, setConfirmState] = useState({ open: false, id: null, action: null });
  const [paidAppointments, setPaidAppointments] = useState(new Set());

  useEffect(() => { fetchAppointments(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAppointments = async () => {
    try {
      const { data } = user.role === 'DOCTOR' ? await getDoctorAppointments() : await getPatientAppointments();
      setAppointments(data);
      if (user.role === 'DOCTOR') {
        try {
          const { data: rx } = await getDoctorPrescriptions();
          const map = {};
          rx.forEach((p) => { map[p.appointmentId] = p; });
          setPrescriptionMap(map);
        } catch { /* prescriptions not available */ }
      }
      if (user.role === 'PATIENT') {
        try {
          const { data: payments } = await getPatientPayments();
          const paid = new Set(payments.filter((p) => p.status === 'COMPLETED').map((p) => p.appointmentId));
          setPaidAppointments(paid);
        } catch { /* payments not available */ }
      }
    } catch { toast.error('Failed to load appointments'); }
    finally { setLoading(false); }
  };

  const handleAction = async () => {
    const { id, action, reason } = confirmState;
    try {
      if (action === 'cancel') await cancelAppointment(id, reason || 'Cancelled by user');
      else if (action === 'reject') await rejectAppointment(id, reason || 'Rejected by doctor');
      else if (action === 'confirm') await confirmAppointment(id);
      else if (action === 'complete') await completeAppointment(id);
      toast.success(`Appointment ${action}${action.endsWith('e') ? 'd' : 'ed'}`);
      fetchAppointments();
    } catch { toast.error(`Failed to ${action}`); }
    finally { setConfirmState({ open: false, id: null, action: null }); }
  };

  const filtered = tab === 'ALL' ? appointments : appointments.filter((a) => {
    if (tab === 'UPCOMING') return a.status === 'PENDING' || a.status === 'CONFIRMED';
    return a.status === tab;
  });

  const counts = {
    ALL: appointments.length,
    UPCOMING: appointments.filter((a) => a.status === 'PENDING' || a.status === 'CONFIRMED').length,
    COMPLETED: appointments.filter((a) => a.status === 'COMPLETED').length,
    CANCELLED: appointments.filter((a) => a.status === 'CANCELLED' || a.status === 'REJECTED').length,
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader title="Appointments" subtitle="Manage your upcoming and past appointments" />

      <div className="mb-4 overflow-x-auto">
        <Tabs
          tabs={[
            { value: 'ALL', label: 'All', count: counts.ALL },
            { value: 'UPCOMING', label: 'Upcoming', count: counts.UPCOMING },
            { value: 'COMPLETED', label: 'Completed', count: counts.COMPLETED },
            { value: 'CANCELLED', label: 'Cancelled', count: counts.CANCELLED },
          ]}
          active={tab}
          onChange={setTab}
        />
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            illustration={<EmptyCalendar />}
            title={`No ${tab.toLowerCase()} appointments`}
            description={tab === 'UPCOMING' ? 'Book an appointment to get started' : 'Nothing here yet'}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((apt) => (
            <Card key={apt.id}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar
                    name={user.role === 'DOCTOR' ? `Patient ${apt.patientId}` : `Doctor ${apt.doctorId}`}
                    size="md"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Appointment <span className="font-mono">#{apt.id}</span></p>
                    <p className="text-xs text-slate-500">{formatDate(apt.appointmentDate)} at {formatTime(apt.startTime)}</p>
                    {apt.reason && <p className="text-xs text-slate-400 mt-0.5">{apt.reason}</p>}
                  </div>
                </div>
                <Badge status={apt.status} dot />
              </div>

              <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-50">
                {apt.status === 'CONFIRMED' && (
                  <Link to={`/appointments/${apt.id}/video`}>
                    <Button size="sm" variant="accent" icon={Video}>Join Video Call</Button>
                  </Link>
                )}
                {user.role === 'DOCTOR' && apt.status === 'PENDING' && (
                  <>
                    <Button size="sm" onClick={() => setConfirmState({ open: true, id: apt.id, action: 'confirm' })}>Confirm</Button>
                    <Button size="sm" variant="danger" onClick={() => setConfirmState({ open: true, id: apt.id, action: 'reject' })}>Reject</Button>
                  </>
                )}
                {user.role === 'DOCTOR' && apt.status === 'CONFIRMED' && (
                  <Button size="sm" variant="outline" onClick={() => setConfirmState({ open: true, id: apt.id, action: 'complete' })}>Mark Complete</Button>
                )}
                {user.role === 'DOCTOR' && apt.status === 'COMPLETED' && !prescriptionMap[apt.id] && (
                  <Button size="sm" variant="outline" onClick={() => navigate(`/doctor/prescriptions?appointmentId=${apt.id}&patientId=${apt.patientId}`)}>
                    Write Prescription
                  </Button>
                )}
                {user.role === 'DOCTOR' && apt.status === 'COMPLETED' && prescriptionMap[apt.id] && (
                  <Button size="sm" variant="ghost" onClick={() => navigate(`/doctor/prescriptions?appointmentId=${apt.id}&patientId=${apt.patientId}&view=true`)}>
                    View Prescription
                  </Button>
                )}
                {(apt.status === 'PENDING' || apt.status === 'CONFIRMED') && (
                  <Button size="sm" variant="ghost" className="!text-danger-600" onClick={() => setConfirmState({ open: true, id: apt.id, action: 'cancel' })}>
                    Cancel
                  </Button>
                )}
                {apt.status === 'PENDING' && user.role === 'PATIENT' && !paidAppointments.has(apt.id) && (
                  <Link to={`/payment/${apt.id}`}>
                    <Button size="sm" variant="outline">Pay Now</Button>
                  </Link>
                )}
                {user.role === 'PATIENT' && paidAppointments.has(apt.id) && (
                  <Badge color="accent" variant="soft">Paid</Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmState.open}
        onClose={() => setConfirmState({ open: false, id: null, action: null })}
        onConfirm={handleAction}
        title={`${confirmState.action ? confirmState.action.charAt(0).toUpperCase() + confirmState.action.slice(1) : ''} Appointment`}
        message={`Are you sure you want to ${confirmState.action} this appointment?`}
        confirmLabel={confirmState.action ? confirmState.action.charAt(0).toUpperCase() + confirmState.action.slice(1) : 'Confirm'}
        variant={confirmState.action === 'cancel' || confirmState.action === 'reject' ? 'danger' : 'primary'}
      />
    </div>
  );
}
