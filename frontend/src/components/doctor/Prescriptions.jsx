import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getDoctorPrescriptions, createPrescription } from '../../api/doctorApi';
import { formatDateTime } from '../../utils/helpers';
import { toast } from 'react-toastify';

export default function DoctorPrescriptions() {
  const [searchParams] = useSearchParams();
  const prefilledAppointmentId = searchParams.get('appointmentId') || '';
  const prefilledPatientId = searchParams.get('patientId') || '';

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(!!prefilledAppointmentId);
  const [form, setForm] = useState({
    appointmentId: prefilledAppointmentId, patientId: prefilledPatientId, diagnosis: '', medications: '', instructions: '', notes: '',
  });

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const { data } = await getDoctorPrescriptions();
      setPrescriptions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createPrescription({
        ...form,
        appointmentId: parseInt(form.appointmentId),
        patientId: parseInt(form.patientId),
      });
      toast.success('Prescription created!');
      setShowForm(false);
      setForm({ appointmentId: '', patientId: '', diagnosis: '', medications: '', instructions: '', notes: '' });
      fetchPrescriptions();
    } catch (err) {
      toast.error('Failed to create prescription');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Prescriptions</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          {showForm ? 'Cancel' : 'New Prescription'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Appointment ID</label>
              <input type="number" required className="w-full px-4 py-2 border rounded-lg bg-gray-50" value={form.appointmentId} readOnly={!!prefilledAppointmentId} onChange={(e) => setForm({ ...form, appointmentId: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Patient ID</label>
              <input type="number" required className="w-full px-4 py-2 border rounded-lg bg-gray-50" value={form.patientId} readOnly={!!prefilledPatientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
            <input type="text" required className="w-full px-4 py-2 border rounded-lg" value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Medications</label>
            <textarea required className="w-full px-4 py-2 border rounded-lg" rows="3" value={form.medications} onChange={(e) => setForm({ ...form, medications: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
            <textarea className="w-full px-4 py-2 border rounded-lg" rows="2" value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea className="w-full px-4 py-2 border rounded-lg" rows="2" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
            Create Prescription
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : prescriptions.length === 0 ? (
        <p className="text-gray-500">No prescriptions yet</p>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((p) => (
            <div key={p.id} className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{p.diagnosis}</h3>
                <span className="text-sm text-gray-500">Patient #{p.patientId}</span>
              </div>
              <p className="text-gray-700 mb-1"><strong>Medications:</strong> {p.medications}</p>
              {p.instructions && <p className="text-gray-700 mb-1"><strong>Instructions:</strong> {p.instructions}</p>}
              {p.notes && <p className="text-gray-600 text-sm">{p.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
