import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createPaymentIntent, confirmPayment } from '../../api/paymentApi';
import { getAppointment } from '../../api/appointmentApi';
import { getDoctorById } from '../../api/doctorApi';
import { toast } from 'react-toastify';
import PageHeader from '../ui/PageHeader';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Skeleton from '../ui/Skeleton';
import { Shield, Lock, CreditCard } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PK || 'pk_test_XXXX');

function CheckoutForm({ appointmentId }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: apt } = await getAppointment(appointmentId);
        const { data: doc } = await getDoctorById(apt.doctorId);
        setDoctor(doc);
        const { data: payment } = await createPaymentIntent({
          appointmentId: parseInt(appointmentId),
          doctorId: apt.doctorId,
          amount: doc.consultationFee || 50,
        });
        setClientSecret(payment.stripeClientSecret);
      } catch { toast.error('Failed to initialize payment'); }
      finally { setLoading(false); }
    };
    init();
  }, [appointmentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });
      if (error) { toast.error(error.message); }
      else if (paymentIntent.status === 'succeeded') {
        await confirmPayment(paymentIntent.id);
        toast.success('Payment successful!');
        setSuccess(true);
        setTimeout(() => navigate('/patient/dashboard'), 2500);
      }
    } catch { toast.error('Payment failed'); }
    finally { setProcessing(false); }
  };

  if (loading) {
    return <div className="space-y-4"><Skeleton variant="rect" height={80} /><Skeleton variant="rect" height={120} /></div>;
  }

  if (success) {
    return (
      <div className="text-center py-6 animate-fade-in">
        <img
          src="/images/payment-success.png"
          alt="Payment successful"
          className="w-48 h-auto mx-auto mb-4"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <h3 className="text-xl font-bold font-heading text-accent-600 mb-2">Payment Successful!</h3>
        <p className="text-sm text-slate-500">Redirecting to your dashboard...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {doctor && (
        <Card variant="bordered" className="!bg-surface-tertiary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Consultation with</p>
              <p className="font-semibold text-slate-800">Dr. {doctor.firstName || 'Doctor'} - {doctor.specialty}</p>
            </div>
            <span className="text-2xl font-bold font-mono text-accent-600">${doctor.consultationFee || 50}</span>
          </div>
        </Card>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Card Details</label>
        <div className="border border-slate-200 rounded-xl p-4 bg-white focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-all">
          <CardElement options={{
            style: {
              base: { fontSize: '16px', color: '#1e293b', fontFamily: '"DM Sans", sans-serif', '::placeholder': { color: '#94a3b8' } },
              invalid: { color: '#dc2626' },
            },
          }} />
        </div>
      </div>

      <div className="flex items-center gap-4 justify-center text-xs text-slate-400">
        <span className="flex items-center gap-1"><Shield size={12} /> Secure</span>
        <span className="flex items-center gap-1"><Lock size={12} /> Encrypted</span>
        <span className="flex items-center gap-1"><CreditCard size={12} /> Stripe</span>
      </div>

      <Button type="submit" disabled={!stripe || processing} loading={processing} className="w-full" size="lg" variant="accent">
        Pay ${doctor?.consultationFee || 50}
      </Button>

      <p className="text-xs text-slate-400 text-center">Test card: 4242 4242 4242 4242</p>
    </form>
  );
}

export default function PaymentForm() {
  const { appointmentId } = useParams();
  return (
    <div className="max-w-lg mx-auto">
      <PageHeader title="Payment" subtitle="Complete your appointment booking" />
      <Card>
        <Elements stripe={stripePromise}>
          <CheckoutForm appointmentId={appointmentId} />
        </Elements>
      </Card>
    </div>
  );
}
