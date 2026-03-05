import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getPatientAppointments, getDoctorAppointments, cancelAppointment, confirmAppointment, completeAppointment } from '../../api/appointmentApi';
import { formatDate, formatTime, getStatusColor } from '../../utils/helpers';
import { toast } from 'react-toastify';

export default function AppointmentList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const { data } = user.role === 'DOCTOR'
        ? await getDoctorAppointments()
        : await getPatientAppointments();
      setAppointments(data);
    } catch (err) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await cancelAppointment(id, 'Cancelled by user');
      toast.success('Appointment cancelled');
      fetchAppointments();
    } catch (err) {
      toast.error('Failed to cancel');
    }
  };

  const handleConfirm = async (id) => {
    try {
      await confirmAppointment(id);
      toast.success('Appointment confirmed');
      fetchAppointments();
    } catch (err) {
      toast.error('Failed to confirm');
    }
  };

  const handleComplete = async (id) => {
    try {
      await completeAppointment(id);
      toast.success('Appointment completed');
      fetchAppointments();
    } catch (err) {
      toast.error('Failed to complete');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Appointments</h1>
      {appointments.length === 0 ? (
        <p className="text-gray-500">No appointments found</p>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => (
            <div key={apt.id} className="bg-white rounded-xl shadow p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-lg">Appointment #{apt.id}</p>
                  <p className="text-gray-500">
                    {formatDate(apt.appointmentDate)} at {formatTime(apt.startTime)}
                  </p>
                  {apt.reason && <p className="text-sm text-gray-400 mt-1">Reason: {apt.reason}</p>}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                  {apt.status}
                </span>
              </div>
              <div className="flex gap-2 mt-4">
                {apt.status === 'CONFIRMED' && (
                  <Link to={`/appointments/${apt.id}/video`} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700">
                    Join Video Call
                  </Link>
                )}
                {user.role === 'DOCTOR' && apt.status === 'PENDING' && (
                  <button onClick={() => handleConfirm(apt.id)} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700">
                    Confirm
                  </button>
                )}
                {user.role === 'DOCTOR' && apt.status === 'CONFIRMED' && (
                  <button onClick={() => handleComplete(apt.id)} className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-purple-700">
                    Complete
                  </button>
                )}
                {user.role === 'DOCTOR' && apt.status === 'COMPLETED' && (
                  <button onClick={() => navigate(`/doctor/prescriptions?appointmentId=${apt.id}&patientId=${apt.patientId}`)} className="bg-orange-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-orange-600">
                    Write Prescription
                  </button>
                )}
                {(apt.status === 'PENDING' || apt.status === 'CONFIRMED') && (
                  <button onClick={() => handleCancel(apt.id)} className="bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-sm hover:bg-red-200">
                    Cancel
                  </button>
                )}
                {apt.status === 'PENDING' && user.role === 'PATIENT' && (
                  <Link to={`/payment/${apt.id}`} className="bg-yellow-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-yellow-600">
                    Pay Now
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
