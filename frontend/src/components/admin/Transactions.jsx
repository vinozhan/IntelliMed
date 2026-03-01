import { useState, useEffect } from 'react';
import { getPatientPayments, refundPayment } from '../../api/paymentApi';
import { formatDateTime, getStatusColor } from '../../utils/helpers';
import { toast } from 'react-toastify';

export default function Transactions() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const { data } = await getPatientPayments();
        setPayments(data);
      } catch (err) {
        toast.error('Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const handleRefund = async (id) => {
    try {
      await refundPayment(id);
      toast.success('Refund processed');
      const { data } = await getPatientPayments();
      setPayments(data);
    } catch (err) {
      toast.error('Failed to process refund');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Transactions</h1>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Appointment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {payments.map((p) => (
              <tr key={p.id}>
                <td className="px-6 py-4 text-sm">{p.id}</td>
                <td className="px-6 py-4 text-sm">#{p.appointmentId}</td>
                <td className="px-6 py-4 text-sm font-medium">${p.amount}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(p.status)}`}>{p.status}</span>
                </td>
                <td className="px-6 py-4 text-sm">{formatDateTime(p.paidAt)}</td>
                <td className="px-6 py-4 text-sm">
                  {p.status === 'COMPLETED' && (
                    <button onClick={() => handleRefund(p.id)} className="text-red-600 hover:text-red-700 text-xs">Refund</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
