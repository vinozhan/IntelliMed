import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getDoctorProfile, getDoctorAvailability, createAvailability, deleteAvailability } from '../../api/doctorApi';
import { toast } from 'react-toastify';
import { Trash2 } from 'lucide-react';

export default function DoctorAvailability() {
  const [slots, setSlots] = useState([]);
  const [doctorId, setDoctorId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    slotDate: '', startTime: '', endTime: '', maxPatients: 1, slotDurationMinutes: 30,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: profile } = await getDoctorProfile();
        setDoctorId(profile.id);
        const { data } = await getDoctorAvailability(profile.id);
        setSlots(data);
      } catch (err) {
        toast.error('Please create your doctor profile first');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await createAvailability(form);
      toast.success('Slot added!');
      const { data } = await getDoctorAvailability(doctorId);
      setSlots(data);
      setForm({ slotDate: '', startTime: '', endTime: '', maxPatients: 1, slotDurationMinutes: 30 });
    } catch (err) {
      toast.error('Failed to add slot');
    }
  };

  const handleDelete = async (slotId) => {
    try {
      await deleteAvailability(slotId);
      setSlots(slots.filter((s) => s.id !== slotId));
      toast.success('Slot removed');
    } catch (err) {
      toast.error('Failed to remove slot');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Manage Availability</h1>

      <form onSubmit={handleAdd} className="bg-white rounded-xl shadow p-6 mb-6 space-y-4">
        <h2 className="text-lg font-semibold">Add New Slot</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" required className="w-full px-3 py-2 border rounded-lg" value={form.slotDate} onChange={(e) => setForm({ ...form, slotDate: e.target.value })} min={new Date().toISOString().split('T')[0]} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <input type="time" required className="w-full px-3 py-2 border rounded-lg" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
            <input type="time" required className="w-full px-3 py-2 border rounded-lg" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slot Duration</label>
            <select className="w-full px-3 py-2 border rounded-lg" value={form.slotDurationMinutes} onChange={(e) => setForm({ ...form, slotDurationMinutes: parseInt(e.target.value) })}>
              <option value={15}>15 min</option>
              <option value={20}>20 min</option>
              <option value={30}>30 min</option>
              <option value={45}>45 min</option>
              <option value={60}>60 min</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Patients</label>
            <input type="number" min="1" className="w-full px-3 py-2 border rounded-lg" value={form.maxPatients} onChange={(e) => setForm({ ...form, maxPatients: parseInt(e.target.value) })} />
          </div>
        </div>
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Add Slot
        </button>
      </form>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Current Slots</h2>
        {slots.length === 0 ? (
          <p className="text-gray-500">No availability slots configured</p>
        ) : (
          <div className="space-y-3">
            {slots.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{slot.slotDate}</p>
                  <p className="text-sm text-gray-500">{slot.startTime} - {slot.endTime} | Max: {slot.maxPatients}</p>
                </div>
                <button onClick={() => handleDelete(slot.id)} className="text-red-600 hover:text-red-700">
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
