import { useState, useEffect } from 'react';
import { getPatientPayments } from '../../api/paymentApi';
import { formatDateTime, getStatusColor } from '../../utils/helpers';
import { toast } from 'react-toastify';

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const { data } = await getPatientPayments();
        setPayments(data);
      } catch (err) {
        toast.error('Failed to load payments');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Payment History</h1>
      {payments.length === 0 ? (
        <p className="text-gray-500">No payments found</p>
      ) : (
        <div className="space-y-4">
          {payments.map((p) => (
            <div key={p.id} className="bg-white rounded-xl shadow p-6 flex items-center justify-between">
              <div>
                <p className="font-semibold">Appointment #{p.appointmentId}</p>
                <p className="text-sm text-gray-500">{formatDateTime(p.paidAt)}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">${p.amount}</p>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(p.status)}`}>
                  {p.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
