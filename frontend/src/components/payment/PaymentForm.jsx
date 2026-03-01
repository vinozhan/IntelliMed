import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createPaymentIntent, confirmPayment } from '../../api/paymentApi';
import { getAppointment } from '../../api/appointmentApi';
import { getDoctorById } from '../../api/doctorApi';
import { toast } from 'react-toastify';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PK || 'pk_test_XXXX');

function CheckoutForm({ appointmentId }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: apt } = await getAppointment(appointmentId);
        setAppointment(apt);
        const { data: doc } = await getDoctorById(apt.doctorId);
        setDoctor(doc);

        const { data: payment } = await createPaymentIntent({
          appointmentId: parseInt(appointmentId),
          doctorId: apt.doctorId,
          amount: doc.consultationFee || 50,
        });
        setClientSecret(payment.stripeClientSecret);
      } catch (err) {
        toast.error('Failed to initialize payment');
      } finally {
        setLoading(false);
      }
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

      if (error) {
        toast.error(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        await confirmPayment(paymentIntent.id);
        toast.success('Payment successful!');
        navigate('/patient/dashboard');
      }
    } catch (err) {
      toast.error('Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {doctor && (
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="font-semibold">Dr. {doctor.firstName || 'Doctor'} - {doctor.specialty}</p>
          <p className="text-2xl font-bold text-green-600 mt-1">${doctor.consultationFee || 50}</p>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Card Details</label>
        <div className="border rounded-lg p-4">
          <CardElement options={{
            style: {
              base: { fontSize: '16px', color: '#424770' },
              invalid: { color: '#9e2146' },
            },
          }} />
        </div>
      </div>
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 text-lg font-semibold"
      >
        {processing ? 'Processing...' : `Pay $${doctor?.consultationFee || 50}`}
      </button>
      <p className="text-xs text-gray-400 text-center">Test card: 4242 4242 4242 4242</p>
    </form>
  );
}

export default function PaymentForm() {
  const { appointmentId } = useParams();

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Payment</h1>
      <div className="bg-white rounded-xl shadow p-6">
        <Elements stripe={stripePromise}>
          <CheckoutForm appointmentId={appointmentId} />
        </Elements>
      </div>
    </div>
  );
}
