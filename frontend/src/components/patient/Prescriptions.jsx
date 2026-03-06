import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getPrescriptionsByPatientId } from '../../api/patientApi';
import { formatDateTime } from '../../utils/helpers';
import { toast } from 'react-toastify';
import PageHeader from '../ui/PageHeader';
import Card from '../ui/Card';
import EmptyState from '../ui/EmptyState';
import { SkeletonCard } from '../ui/Skeleton';
import { Pill, FileText } from 'lucide-react';

export default function PatientPrescriptions() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPrescriptionsByPatientId(user.userId)
      .then(({ data }) => setPrescriptions(data))
      .catch(() => toast.error('Failed to load prescriptions'))
      .finally(() => setLoading(false));
  }, [user.userId]);

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader title="My Prescriptions" subtitle="View prescriptions from your consultations" />

      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>
      ) : prescriptions.length === 0 ? (
        <Card>
          <EmptyState icon={Pill} title="No prescriptions" description="Prescriptions from your consultations will appear here" />
        </Card>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((p) => (
            <Card key={p.id}>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                  <FileText size={18} className="text-primary-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className="text-base font-semibold text-slate-800">{p.diagnosis}</h3>
                    <span className="text-xs text-slate-500">{formatDateTime(p.issuedAt)}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3 pl-[52px]">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Medications</span>
                  <p className="text-sm text-slate-700 mt-0.5 whitespace-pre-wrap">{p.medications}</p>
                </div>
                {p.instructions && (
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Instructions</span>
                    <p className="text-sm text-slate-700 mt-0.5 whitespace-pre-wrap">{p.instructions}</p>
                  </div>
                )}
                {p.notes && (
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Notes</span>
                    <p className="text-sm text-slate-700 mt-0.5 whitespace-pre-wrap">{p.notes}</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
