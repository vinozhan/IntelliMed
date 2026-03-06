import { useState, useEffect } from 'react';
import { getPatientPayments } from '../../api/paymentApi';
import { formatDateTime } from '../../utils/helpers';
import { toast } from 'react-toastify';
import PageHeader from '../ui/PageHeader';
import DataTable from '../ui/DataTable';
import Badge from '../ui/Badge';
import { CreditCard } from 'lucide-react';

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPatientPayments()
      .then(({ data }) => setPayments(data))
      .catch(() => toast.error('Failed to load payments'))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'id', label: 'ID', render: (row) => <span className="font-mono text-xs">#{row.id}</span> },
    { key: 'appointmentId', label: 'Appointment', render: (row) => <span className="font-mono text-xs">#{row.appointmentId}</span> },
    { key: 'amount', label: 'Amount', render: (row) => <span className="font-mono font-semibold">${row.amount}</span> },
    { key: 'status', label: 'Status', render: (row) => <Badge status={row.status} dot /> },
    { key: 'paidAt', label: 'Date', render: (row) => <span className="text-slate-500">{formatDateTime(row.paidAt)}</span> },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader title="Payment History" subtitle="View all your transactions" />
      <DataTable
        columns={columns}
        data={payments}
        loading={loading}
        emptyTitle="No payments found"
        emptyDescription="Your payment history will appear here after bookings"
        emptyIcon={CreditCard}
      />
    </div>
  );
}
