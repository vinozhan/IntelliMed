import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getDoctorAppointments } from '../../api/appointmentApi';
import { getDoctorProfile } from '../../api/doctorApi';
import { formatDate, formatTime, getStatusColor } from '../../utils/helpers';
import { toast } from 'react-toastify';
import { Calendar, Clock, FileText, Video } from 'lucide-react';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aptsRes, profileRes] = await Promise.all([
          getDoctorAppointments(),
          getDoctorProfile().catch(() => null),
        ]);
        setAppointments(aptsRes.data);
        if (profileRes) setProfile(profileRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const today = appointments.filter(
    (a) => (a.status === 'CONFIRMED' || a.status === 'PENDING')
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Dr. {user?.firstName} {user?.lastName}
      </h1>
      {profile && (
        <p className="text-gray-500 mb-8">{profile.specialty} | {profile.hospital}</p>
      )}
      {!profile && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">
            Please complete your doctor profile.{' '}
            <Link to="/doctor/profile" className="text-blue-600 underline">Set up profile</Link>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link to="/doctor/availability" className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition">
          <Clock className="text-blue-600 mb-3" size={32} />
          <h3 className="font-semibold">Manage Availability</h3>
          <p className="text-sm text-gray-500 mt-1">Set your available slots</p>
        </Link>
        <Link to="/doctor/prescriptions" className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition">
          <FileText className="text-green-600 mb-3" size={32} />
          <h3 className="font-semibold">Prescriptions</h3>
          <p className="text-sm text-gray-500 mt-1">Write and manage prescriptions</p>
        </Link>
        <Link to="/doctor/profile" className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition">
          <Calendar className="text-purple-600 mb-3" size={32} />
          <h3 className="font-semibold">My Profile</h3>
          <p className="text-sm text-gray-500 mt-1">Edit your profile details</p>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Appointments</h2>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : today.length === 0 ? (
          <p className="text-gray-500">No upcoming appointments</p>
        ) : (
          <div className="space-y-4">
            {today.map((apt) => (
              <div key={apt.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Patient #{apt.patientId} - Appointment #{apt.id}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(apt.appointmentDate)} at {formatTime(apt.startTime)}
                  </p>
                  {apt.reason && <p className="text-sm text-gray-400">Reason: {apt.reason}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                    {apt.status}
                  </span>
                  {apt.status === 'CONFIRMED' && (
                    <Link
                      to={`/appointments/${apt.id}/video`}
                      className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700 flex items-center gap-1"
                    >
                      <Video size={14} /> Start Call
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
