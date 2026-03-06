import { useState, useEffect } from 'react';
import { getAllPaymentsAdmin } from '../../api/adminApi';
import { refundPayment } from '../../api/paymentApi';
import { formatDateTime } from '../../utils/helpers';
import { toast } from 'react-toastify';
import PageHeader from '../ui/PageHeader';
import DataTable from '../ui/DataTable';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import ConfirmDialog from '../ui/ConfirmDialog';
import { CreditCard } from 'lucide-react';

export default function Transactions() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refundId, setRefundId] = useState(null);
  const [refunding, setRefunding] = useState(false);

  useEffect(() => { fetchPayments(); }, []);

  const fetchPayments = async () => {
    try {
      const { data } = await getAllPaymentsAdmin();
      setPayments(Array.isArray(data) ? data : data.content || []);
    } catch { toast.error('Failed to load transactions'); }
    finally { setLoading(false); }
  };

  const handleRefund = async () => {
    setRefunding(true);
    try {
      await refundPayment(refundId);
      toast.success('Refund processed');
      fetchPayments();
    } catch { toast.error('Failed to process refund'); }
    finally { setRefunding(false); setRefundId(null); }
  };

  const columns = [
    { key: 'id', label: 'ID', render: (row) => <span className="font-mono text-xs">#{row.id}</span> },
    { key: 'appointmentId', label: 'Appointment', render: (row) => <span className="font-mono text-xs">#{row.appointmentId}</span> },
    { key: 'amount', label: 'Amount', render: (row) => <span className="font-mono font-semibold">${row.amount}</span> },
    { key: 'status', label: 'Status', render: (row) => <Badge status={row.status} dot /> },
    { key: 'paidAt', label: 'Date', render: (row) => <span className="text-slate-500 text-xs">{formatDateTime(row.paidAt)}</span> },
    {
      key: 'actions', label: 'Actions', render: (row) =>
        row.status === 'COMPLETED' ? (
          <Button size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); setRefundId(row.id); }}>Refund</Button>
        ) : null,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader title="Transactions" subtitle="View and manage platform payments" />
      <DataTable
        columns={columns}
        data={payments}
        loading={loading}
        emptyTitle="No transactions found"
        emptyIcon={CreditCard}
      />
      <ConfirmDialog
        open={refundId !== null}
        onClose={() => setRefundId(null)}
        onConfirm={handleRefund}
        loading={refunding}
        title="Process Refund"
        message="Are you sure you want to refund this payment? This action cannot be undone."
        confirmLabel="Refund"
        variant="danger"
      />
    </div>
  );
}
