import { useState, useEffect } from 'react';
import { getDoctorProfile, getDoctorAvailability, createAvailability, deleteAvailability } from '../../api/doctorApi';
import { toast } from 'react-toastify';
import PageHeader from '../ui/PageHeader';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import ConfirmDialog from '../ui/ConfirmDialog';
import EmptyState from '../ui/EmptyState';
import Skeleton from '../ui/Skeleton';
import { Trash2, Clock, Plus } from 'lucide-react';

export default function DoctorAvailability() {
  const [slots, setSlots] = useState([]);
  const [doctorId, setDoctorId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    slotDate: '', startTime: '', endTime: '', maxPatients: 1, slotDurationMinutes: 30,
  });
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: profile } = await getDoctorProfile();
        setDoctorId(profile.id);
        const { data } = await getDoctorAvailability(profile.id);
        setSlots(data);
      } catch { toast.error('Please create your doctor profile first'); }
      finally { setLoading(false); }
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
    } catch { toast.error('Failed to add slot'); }
  };

  const handleDelete = async () => {
    try {
      await deleteAvailability(deleteId);
      setSlots(slots.filter((s) => s.id !== deleteId));
      toast.success('Slot removed');
    } catch { toast.error('Failed to remove slot'); }
    finally { setDeleteId(null); }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Skeleton variant="rect" height={40} width="40%" />
        <Skeleton variant="rect" height={200} />
        <Skeleton variant="rect" height={200} />
      </div>
    );
  }

  // Group slots by date
  const grouped = slots.reduce((acc, slot) => {
    const date = slot.slotDate;
    if (!acc[date]) acc[date] = [];
    acc[date].push(slot);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader title="Manage Availability" subtitle="Configure your appointment slots" />

      <form onSubmit={handleAdd}>
        <Card className="mb-6">
          <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Plus size={16} /> Add New Slot
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            <Input label="Date" type="date" required value={form.slotDate} onChange={(e) => setForm({ ...form, slotDate: e.target.value })} min={new Date().toISOString().split('T')[0]} />
            <Input label="Start Time" type="time" required value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
            <Input label="End Time" type="time" required value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
            <Select label="Duration" value={form.slotDurationMinutes} onChange={(e) => setForm({ ...form, slotDurationMinutes: parseInt(e.target.value) })}>
              <option value={15}>15 min</option>
              <option value={20}>20 min</option>
              <option value={30}>30 min</option>
              <option value={45}>45 min</option>
              <option value={60}>60 min</option>
            </Select>
            <Input label="Max Patients Per Slot" type="number" min="1" value={form.maxPatients} onChange={(e) => setForm({ ...form, maxPatients: parseInt(e.target.value) })} />
          </div>
          <Button type="submit" icon={Plus}>Add Slot</Button>
        </Card>
      </form>

      <Card>
        <h2 className="text-base font-semibold text-slate-800 mb-4">Current Slots</h2>
        {Object.keys(grouped).length === 0 ? (
          <EmptyState icon={Clock} title="No availability slots" description="Add slots so patients can book appointments" />
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([date, dateSlots]) => (
              <div key={date}>
                <h3 className="text-sm font-semibold text-slate-600 mb-2">{new Date(date + 'T00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                <div className="space-y-2">
                  {dateSlots.map((slot) => (
                    <div key={slot.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Clock size={14} className="text-primary-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{slot.startTime} - {slot.endTime}</p>
                          <p className="text-xs text-slate-500">Max: {slot.maxPatients} patients</p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="!text-danger-500" onClick={() => setDeleteId(slot.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Slot"
        message="Are you sure you want to remove this availability slot?"
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
