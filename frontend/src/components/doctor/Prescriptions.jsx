import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getDoctorPrescriptions, createPrescription, updatePrescription } from '../../api/doctorApi';
import { toast } from 'react-toastify';
import PageHeader from '../ui/PageHeader';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import EmptyState from '../ui/EmptyState';
import { SkeletonCard } from '../ui/Skeleton';
import { FileText, Plus, Edit2 } from 'lucide-react';

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

  useEffect(() => { fetchPrescriptions(); }, []);

  useEffect(() => {
    if (!loading && prefilledAppointmentId) {
      if (isViewMode) {
        const existing = prescriptions.find(p => String(p.appointmentId) === prefilledAppointmentId);
        if (existing) { setViewingPrescription(existing); setShowForm(false); }
      } else {
        setForm(f => ({ ...f, appointmentId: prefilledAppointmentId, patientId: prefilledPatientId }));
        setShowForm(true);
      }
    }
  }, [loading, prefilledAppointmentId, prefilledPatientId, isViewMode, prescriptions]);

  const fetchPrescriptions = async () => {
    try { const { data } = await getDoctorPrescriptions(); setPrescriptions(data); }
    catch { /* no prescriptions */ }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createPrescription({ ...form, appointmentId: parseInt(form.appointmentId), patientId: parseInt(form.patientId) });
      toast.success('Prescription created!');
      setShowForm(false);
      setForm({ appointmentId: '', patientId: '', diagnosis: '', medications: '', instructions: '', notes: '' });
      fetchPrescriptions();
    } catch { toast.error('Failed to create prescription'); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updatePrescription(viewingPrescription.id, {
        diagnosis: form.diagnosis, medications: form.medications, instructions: form.instructions, notes: form.notes,
      });
      toast.success('Prescription updated!');
      setEditing(false);
      setViewingPrescription(null);
      fetchPrescriptions();
    } catch { toast.error('Failed to update prescription'); }
  };

  const startEditing = (rx) => {
    setForm({ appointmentId: rx.appointmentId, patientId: rx.patientId, diagnosis: rx.diagnosis || '', medications: rx.medications || '', instructions: rx.instructions || '', notes: rx.notes || '' });
    setEditing(true);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Prescriptions"
        actions={!viewingPrescription && (
          <Button
            icon={showForm ? undefined : Plus}
            variant={showForm ? 'secondary' : 'primary'}
            onClick={() => { setShowForm(!showForm); setViewingPrescription(null); }}
          >
            {showForm ? 'Cancel' : 'New Prescription'}
          </Button>
        )}
      />

      {/* View Modal */}
      <Modal
        open={viewingPrescription !== null}
        onClose={() => { setViewingPrescription(null); setEditing(false); }}
        title={editing ? 'Edit Prescription' : 'Prescription Details'}
        size="lg"
      >
        {viewingPrescription && !editing && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-xs text-slate-500">Appointment ID</span><p className="font-mono text-sm font-medium">#{viewingPrescription.appointmentId}</p></div>
              <div><span className="text-xs text-slate-500">Patient ID</span><p className="font-mono text-sm font-medium">#{viewingPrescription.patientId}</p></div>
            </div>
            <div><span className="text-xs text-slate-500">Diagnosis</span><p className="text-sm font-medium text-slate-800">{viewingPrescription.diagnosis}</p></div>
            <div><span className="text-xs text-slate-500">Medications</span><p className="text-sm text-slate-700 whitespace-pre-wrap">{viewingPrescription.medications}</p></div>
            {viewingPrescription.instructions && <div><span className="text-xs text-slate-500">Instructions</span><p className="text-sm text-slate-700 whitespace-pre-wrap">{viewingPrescription.instructions}</p></div>}
            {viewingPrescription.notes && <div><span className="text-xs text-slate-500">Notes</span><p className="text-sm text-slate-700 whitespace-pre-wrap">{viewingPrescription.notes}</p></div>}
            <div className="pt-2">
              <Button icon={Edit2} onClick={() => startEditing(viewingPrescription)}>Edit</Button>
            </div>
          </div>
        )}
        {viewingPrescription && editing && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <Input label="Diagnosis" required value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} />
            <Textarea label="Medications" required rows={3} value={form.medications} onChange={(e) => setForm({ ...form, medications: e.target.value })} />
            <Textarea label="Instructions" rows={2} value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} />
            <Textarea label="Notes" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <div className="flex gap-2">
              <Button type="submit" variant="accent">Save Changes</Button>
              <Button type="button" variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Create Form */}
      {showForm && !viewingPrescription && (
        <form onSubmit={handleSubmit}>
          <Card className="mb-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Appointment ID" type="number" required value={form.appointmentId} readOnly={!!prefilledAppointmentId} onChange={(e) => setForm({ ...form, appointmentId: e.target.value })} />
              <Input label="Patient ID" type="number" required value={form.patientId} readOnly={!!prefilledPatientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} />
            </div>
            <Input label="Diagnosis" required value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} />
            <Textarea label="Medications" required rows={3} value={form.medications} onChange={(e) => setForm({ ...form, medications: e.target.value })} />
            <Textarea label="Instructions" rows={2} value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} />
            <Textarea label="Notes" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <Button type="submit" variant="accent">Create Prescription</Button>
          </Card>
        </form>
      )}

      {/* List */}
      {!viewingPrescription && (
        <>
          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>
          ) : prescriptions.length === 0 ? (
            <Card><EmptyState icon={FileText} title="No prescriptions yet" description="Prescriptions you write will appear here" /></Card>
          ) : (
            <div className="space-y-3">
              {prescriptions.map((p) => (
                <Card key={p.id} variant="interactive" onClick={() => { setViewingPrescription(p); setEditing(false); setShowForm(false); }}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center shrink-0">
                      <FileText size={18} className="text-accent-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h3 className="text-sm font-semibold text-slate-800">{p.diagnosis}</h3>
                        <span className="text-xs text-slate-400 font-mono shrink-0 ml-2">Patient #{p.patientId}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{p.medications}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
