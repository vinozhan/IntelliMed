import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDoctorById, getDoctorAvailability } from '../../api/doctorApi';
import { createAppointment } from '../../api/appointmentApi';
import { toast } from 'react-toastify';

export default function BookingForm() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [form, setForm] = useState({ startTime: '', reason: '' });
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const { data } = await getDoctorById(doctorId);
        setDoctor(data);
      } catch (err) {
        toast.error('Doctor not found');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [doctorId]);

  useEffect(() => {
    if (selectedDate) {
      const fetchSlots = async () => {
        try {
          const { data } = await getDoctorAvailability(doctorId, selectedDate);
          setSlots(data);
        } catch (err) {
          console.error(err);
        }
      };
      fetchSlots();
    }
  }, [selectedDate, doctorId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBooking(true);
    try {
      const { data } = await createAppointment({
        doctorId: parseInt(doctorId),
        appointmentDate: selectedDate,
        startTime: form.startTime,
        reason: form.reason,
      });
      toast.success('Appointment booked!');
      navigate(`/payment/${data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Book Appointment</h1>

      {doctor && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-xl font-semibold">Dr. {doctor.firstName || 'Doctor'} {doctor.lastName || ''}</h2>
          <p className="text-blue-600">{doctor.specialty}</p>
          <p className="text-gray-500">{doctor.hospital}</p>
          <p className="text-lg font-bold text-green-600 mt-2">${doctor.consultationFee}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
          <input
            type="date"
            required
            className="w-full px-4 py-2 border rounded-lg"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        {slots.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Available Slots</label>
            <div className="grid grid-cols-3 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  className={`px-3 py-2 border rounded-lg text-sm ${
                    form.startTime === slot.startTime
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'hover:border-blue-500'
                  }`}
                  onClick={() => setForm({ ...form, startTime: slot.startTime })}
                >
                  {slot.startTime} - {slot.endTime}
                </button>
              ))}
            </div>
          </div>
        )}

        {slots.length === 0 && selectedDate && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
            <input
              type="time"
              required
              className="w-full px-4 py-2 border rounded-lg"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit</label>
          <textarea
            className="w-full px-4 py-2 border rounded-lg"
            rows="3"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            placeholder="Describe your symptoms or reason for visit..."
          />
        </div>

        <button
          type="submit"
          disabled={booking || !form.startTime}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {booking ? 'Booking...' : 'Confirm Booking & Proceed to Payment'}
        </button>
      </form>
    </div>
  );
}
