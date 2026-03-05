import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getDoctorPrescriptions, createPrescription, updatePrescription } from '../../api/doctorApi';
import { toast } from 'react-toastify';

export default function DoctorPrescriptions() {
  const [searchParams] = useSearchParams();
  const prefilledAppointmentId = searchParams.get('appointmentId') || '';
  const prefilledPatientId = searchParams.get('patientId') || '';
  const isViewMode = searchParams.get('view') === 'true';

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [viewingPrescription, setViewingPrescription] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    appointmentId: '', patientId: '', diagnosis: '', medications: '', instructions: '', notes: '',
  });

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  useEffect(() => {
    if (!loading && prefilledAppointmentId) {
      if (isViewMode) {
        const existing = prescriptions.find(p => String(p.appointmentId) === prefilledAppointmentId);
        if (existing) {
          setViewingPrescription(existing);
          setShowForm(false);
        }
      } else {
        setForm(f => ({ ...f, appointmentId: prefilledAppointmentId, patientId: prefilledPatientId }));
        setShowForm(true);
      }
    }
  }, [loading, prefilledAppointmentId, isViewMode, prescriptions]);

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

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updatePrescription(viewingPrescription.id, {
        diagnosis: form.diagnosis,
        medications: form.medications,
        instructions: form.instructions,
        notes: form.notes,
      });
      toast.success('Prescription updated!');
      setEditing(false);
      setViewingPrescription(null);
      fetchPrescriptions();
    } catch (err) {
      toast.error('Failed to update prescription');
    }
  };

  const startEditing = (prescription) => {
    setForm({
      appointmentId: prescription.appointmentId,
      patientId: prescription.patientId,
      diagnosis: prescription.diagnosis || '',
      medications: prescription.medications || '',
      instructions: prescription.instructions || '',
      notes: prescription.notes || '',
    });
    setEditing(true);
  };

  const openViewMode = (prescription) => {
    setViewingPrescription(prescription);
    setEditing(false);
    setShowForm(false);
  };

  const closeView = () => {
    setViewingPrescription(null);
    setEditing(false);
  };

  const readOnly = viewingPrescription && !editing;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Prescriptions</h1>
        {!viewingPrescription && (
          <button onClick={() => { setShowForm(!showForm); setViewingPrescription(null); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            {showForm ? 'Cancel' : 'New Prescription'}
          </button>
        )}
      </div>

      {/* View/Edit Prescription Detail */}
      {viewingPrescription && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {editing ? 'Edit Prescription' : 'Prescription Details'}
            </h2>
            <div className="flex gap-2">
              {!editing && (
                <button onClick={() => startEditing(viewingPrescription)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                  Edit
                </button>
              )}
              <button onClick={closeView} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300">
                Close
              </button>
            </div>
          </div>

          {readOnly ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-sm text-gray-500">Appointment ID</span><p className="font-medium">{viewingPrescription.appointmentId}</p></div>
                <div><span className="text-sm text-gray-500">Patient ID</span><p className="font-medium">{viewingPrescription.patientId}</p></div>
              </div>
              <div><span className="text-sm text-gray-500">Diagnosis</span><p className="font-medium">{viewingPrescription.diagnosis}</p></div>
              <div><span className="text-sm text-gray-500">Medications</span><p className="font-medium whitespace-pre-wrap">{viewingPrescription.medications}</p></div>
              {viewingPrescription.instructions && <div><span className="text-sm text-gray-500">Instructions</span><p className="font-medium whitespace-pre-wrap">{viewingPrescription.instructions}</p></div>}
              {viewingPrescription.notes && <div><span className="text-sm text-gray-500">Notes</span><p className="font-medium whitespace-pre-wrap">{viewingPrescription.notes}</p></div>}
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Appointment ID</label><input type="number" className="w-full px-4 py-2 border rounded-lg bg-gray-100" value={form.appointmentId} readOnly /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Patient ID</label><input type="number" className="w-full px-4 py-2 border rounded-lg bg-gray-100" value={form.patientId} readOnly /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label><input type="text" required className="w-full px-4 py-2 border rounded-lg" value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Medications</label><textarea required className="w-full px-4 py-2 border rounded-lg" rows="3" value={form.medications} onChange={(e) => setForm({ ...form, medications: e.target.value })} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label><textarea className="w-full px-4 py-2 border rounded-lg" rows="2" value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Notes</label><textarea className="w-full px-4 py-2 border rounded-lg" rows="2" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              <div className="flex gap-2">
                <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">Save Changes</button>
                <button type="button" onClick={() => setEditing(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* New Prescription Form */}
      {showForm && !viewingPrescription && (
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

      {/* Prescription List */}
      {!viewingPrescription && (
        <>
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : prescriptions.length === 0 ? (
            <p className="text-gray-500">No prescriptions yet</p>
          ) : (
            <div className="space-y-4">
              {prescriptions.map((p) => (
                <div key={p.id} className="bg-white rounded-xl shadow p-6 cursor-pointer hover:shadow-lg transition" onClick={() => openViewMode(p)}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{p.diagnosis}</h3>
                    <span className="text-sm text-gray-500">Patient #{p.patientId}</span>
                  </div>
                  <p className="text-gray-700 mb-1"><strong>Medications:</strong> {p.medications}</p>
                  {p.instructions && <p className="text-gray-700 mb-1"><strong>Instructions:</strong> {p.instructions}</p>}
                  {p.notes && <p className="text-gray-600 text-sm">{p.notes}</p>}
                  <p className="text-xs text-blue-500 mt-2">Click to view details</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
