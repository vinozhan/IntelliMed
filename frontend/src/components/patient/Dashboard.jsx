import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getPatientAppointments } from '../../api/appointmentApi';
import { formatDate, formatTime, getStatusColor } from '../../utils/helpers';
import { Calendar, FileText, Brain, User } from 'lucide-react';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await getPatientAppointments();
        setAppointments(data);
      } catch (err) {
        console.error('Failed to fetch appointments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const upcoming = appointments.filter(
    (a) => a.status === 'CONFIRMED' || a.status === 'PENDING'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Welcome, {user?.firstName}!
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Link to="/doctors" className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition">
          <Calendar className="text-blue-600 mb-3" size={32} />
          <h3 className="font-semibold text-gray-800">Book Appointment</h3>
          <p className="text-sm text-gray-500 mt-1">Find and book a doctor</p>
        </Link>
        <Link to="/patient/reports" className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition">
          <FileText className="text-green-600 mb-3" size={32} />
          <h3 className="font-semibold text-gray-800">Medical Reports</h3>
          <p className="text-sm text-gray-500 mt-1">View & upload reports</p>
        </Link>
        <Link to="/symptom-checker" className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition">
          <Brain className="text-purple-600 mb-3" size={32} />
          <h3 className="font-semibold text-gray-800">Symptom Checker</h3>
          <p className="text-sm text-gray-500 mt-1">AI-powered analysis</p>
        </Link>
        <Link to="/patient/prescriptions" className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition">
          <User className="text-orange-600 mb-3" size={32} />
          <h3 className="font-semibold text-gray-800">Prescriptions</h3>
          <p className="text-sm text-gray-500 mt-1">View prescriptions</p>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Appointments</h2>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : upcoming.length === 0 ? (
          <p className="text-gray-500">No upcoming appointments</p>
        ) : (
          <div className="space-y-4">
            {upcoming.slice(0, 5).map((apt) => (
              <div key={apt.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Appointment #{apt.id}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(apt.appointmentDate)} at {formatTime(apt.startTime)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                    {apt.status}
                  </span>
                  {apt.status === 'CONFIRMED' && (
                    <Link
                      to={`/appointments/${apt.id}/video`}
                      className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700"
                    >
                      Join Call
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
