import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getSession, createSession, startSession, endSession } from '../../api/telemedicineApi';
import { getAppointment, completeAppointment } from '../../api/appointmentApi';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { toast } from 'react-toastify';
import WaitingRoom from './WaitingRoom';
import Card from '../ui/Card';
import Button from '../ui/Button';
import ErrorState from '../ui/ErrorState';
import { Phone, PhoneOff, Video, FileText, CheckCircle } from 'lucide-react';

export default function JitsiMeetingRoom() {
  const { appointmentId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState(null);
  const [callEnded, setCallEnded] = useState(false);
  const [error, setError] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initSession = async () => {
      try {
        let sessionData;
        try {
          const { data } = await getSession(appointmentId);
          sessionData = data;
        } catch {
          if (user.role === 'DOCTOR') {
            const { data: apt } = await getAppointment(appointmentId);
            const { data } = await createSession({
              appointmentId: parseInt(appointmentId),
              patientId: apt.patientId,
            });
            sessionData = data;
          } else {
            setStatusMessage('Waiting for the doctor to start the session. Please try again shortly.');
            return;
          }
        }

        if (sessionData.status === 'ENDED' || sessionData.status === 'COMPLETED') {
          setStatusMessage('This consultation session has already ended.');
          return;
        }

        setSession(sessionData);
        if (user.role === 'DOCTOR' && sessionData.status === 'WAITING') {
          await startSession(sessionData.id);
        }
      } catch (err) {
        const status = err.response?.status;
        if (status === 400 || status === 409) {
          setStatusMessage('This consultation session has already been completed.');
        } else {
          setError(true);
        }
      } finally {
        setLoading(false);
      }
    };
    initSession();
  }, [appointmentId, user.role]);

  const handleEnd = async () => {
    if (session) {
      try {
        await endSession(session.id);
        await completeAppointment(appointmentId);
        toast.success('Consultation completed');
      } catch { /* end session cleanup */ }
    }
    setCallEnded(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-primary-600/20 rounded-2xl flex items-center justify-center">
            <Video size={28} className="text-primary-400 animate-pulse" />
          </div>
          <p className="text-slate-400 text-sm">Connecting to video session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface-secondary flex items-center justify-center p-4">
        <ErrorState
          title="Connection Failed"
          message="Unable to connect to the video session. Please try again."
          onRetry={() => { initialized.current = false; setError(false); setLoading(true); }}
        />
      </div>
    );
  }

  if (!session) {
    return (
      <WaitingRoom
        message={statusMessage}
        appointmentId={appointmentId}
        onBack={() => navigate(-1)}
      />
    );
  }

  // Post-call summary
  if (callEnded) {
    return (
      <div className="min-h-screen bg-surface-secondary flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-accent-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={28} className="text-accent-600" />
          </div>
          <h2 className="text-xl font-bold font-heading text-slate-800 mb-2">Consultation Complete</h2>
          <p className="text-sm text-slate-500 mb-6">
            Appointment <span className="font-mono">#{appointmentId}</span> has been completed.
          </p>
          <div className="flex flex-col gap-2">
            {user.role === 'DOCTOR' && (
              <Button
                icon={FileText}
                onClick={() => navigate(`/doctor/prescriptions?appointmentId=${appointmentId}&patientId=${session.patientId}`)}
              >
                Write Prescription
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => navigate(user.role === 'DOCTOR' ? '/doctor/appointments' : '/patient/appointments')}
            >
              Back to Appointments
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // In-call
  return (
    <div className="min-h-screen bg-slate-900">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800/90 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent-500/20 rounded-lg flex items-center justify-center">
            <Phone size={16} className="text-accent-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Video Consultation</h2>
            <p className="text-xs text-slate-400">Appointment #{appointmentId}</p>
          </div>
        </div>
        <Button variant="danger" size="sm" icon={PhoneOff} onClick={handleEnd}>
          End Call
        </Button>
      </div>
      <JitsiMeeting
        domain="meet.jit.si"
        roomName={session.roomName}
        configOverwrite={{
          startWithAudioMuted: true,
          startWithVideoMuted: false,
          disableModeratorIndicator: true,
        }}
        interfaceConfigOverwrite={{
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
        }}
        userInfo={{
          displayName: `${user.firstName} ${user.lastName}`,
          email: user.email,
        }}
        onApiReady={(externalApi) => {
          externalApi.addListener('readyToClose', handleEnd);
        }}
        getIFrameRef={(iframeRef) => {
          iframeRef.style.height = 'calc(100vh - 56px)';
          iframeRef.style.width = '100%';
        }}
      />
    </div>
  );
}
