import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getSession, createSession, startSession, endSession } from '../../api/telemedicineApi';
import { getAppointment, completeAppointment } from '../../api/appointmentApi';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { toast } from 'react-toastify';

export default function JitsiMeetingRoom() {
  const { appointmentId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState(null);
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
          setStatusMessage('Unable to connect to the video session. Please try again.');
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
      } catch (err) {
        console.error(err);
      }
    }
    navigate(-1);
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  if (!session) return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <p className="text-gray-600 text-lg mb-4">{statusMessage || 'Session not available'}</p>
      <button onClick={() => navigate(-1)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Go Back</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
        <h2 className="text-white font-semibold">Video Consultation</h2>
        <button onClick={handleEnd} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
          End Call
        </button>
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
