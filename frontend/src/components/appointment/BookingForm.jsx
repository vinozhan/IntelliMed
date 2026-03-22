import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDoctorById, getDoctorAvailability } from '../../api/doctorApi';
import { createAppointment } from '../../api/appointmentApi';
import { toast } from 'react-toastify';
import PageHeader from '../ui/PageHeader';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import Skeleton from '../ui/Skeleton';
import Badge from '../ui/Badge';
import { Stethoscope, MapPin, Calendar, Clock, CheckCircle } from 'lucide-react';

export default function BookingForm() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [form, setForm] = useState({ startTime: '', reason: '' });
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    getDoctorById(doctorId)
      .then(({ data }) => setDoctor(data))
      .catch(() => toast.error('Doctor not found'))
      .finally(() => setLoading(false));
  }, [doctorId]);

  useEffect(() => {
    if (selectedDate) {
      getDoctorAvailability(doctorId, selectedDate)
        .then(({ data }) => setSlots(data))
        .catch(() => {});
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

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Skeleton variant="rect" height={40} width="50%" className="mb-4" />
        <Skeleton variant="rect" height={200} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Book Appointment" />

      {doctor && (
        <Card className="mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
              <Stethoscope size={24} className="text-primary-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-800">Dr. {doctor.firstName || 'Doctor'} {doctor.lastName || ''}</h2>
              <p className="text-sm text-primary-600">{doctor.specialty}</p>
              {doctor.hospital && <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin size={12} /> {doctor.hospital}</p>}
            </div>
            <span className="text-xl font-bold font-mono text-accent-600">${doctor.consultationFee}</span>
          </div>
        </Card>
      )}

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-6">
        {['Date', 'Time Slot', 'Details', 'Confirm'].map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step > i + 1 ? 'bg-accent-500 text-white' : step === i + 1 ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {step > i + 1 ? <CheckCircle size={14} /> : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${step === i + 1 ? 'text-primary-600' : 'text-slate-400'}`}>{label}</span>
            {i < 3 && <div className={`flex-1 h-px ${step > i + 1 ? 'bg-accent-500' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="space-y-5">
          {/* Step 1: Date */}
          {step >= 1 && (
            <div>
              <Input
                label="Select Date"
                type="date"
                icon={Calendar}
                required
                value={selectedDate}
                onChange={(e) => { setSelectedDate(e.target.value); setForm({ ...form, startTime: '' }); if (e.target.value) setStep(2); }}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          )}

          {/* Step 2: Time Slot */}
          {step >= 2 && selectedDate && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Clock size={14} className="inline mr-1" /> Available Slots
              </label>
              {slots.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      className={`px-3 py-2.5 border rounded-xl text-sm font-medium transition-all ${
                        form.startTime === slot.startTime
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'border-slate-200 text-slate-700 hover:border-primary-400 hover:bg-primary-50'
                      }`}
                      onClick={() => { setForm({ ...form, startTime: slot.startTime }); setStep(3); }}
                    >
                      {slot.startTime}
                    </button>
                  ))}
                </div>
              ) : (
                <div>
                  <p className="text-sm text-slate-500 mb-2">No predefined slots. Enter a time:</p>
                  <Input type="time" required value={form.startTime} onChange={(e) => { setForm({ ...form, startTime: e.target.value }); if (e.target.value) setStep(3); }} />
                </div>
              )}
            </div>
          )}

          {/* Step 3: Reason */}
          {step >= 3 && form.startTime && (
            <Textarea
              label="Reason for Visit"
              rows={3}
              value={form.reason}
              onChange={(e) => { setForm({ ...form, reason: e.target.value }); setStep(4); }}
              placeholder="Describe your symptoms or reason for visit..."
            />
          )}

          {/* Step 4: Confirm */}
          {step >= 4 && (
            <Button type="submit" loading={booking} disabled={!form.startTime} className="w-full" size="lg">
              Confirm Booking & Proceed to Payment
            </Button>
          )}
        </Card>
      </form>
    </div>
  );
}
