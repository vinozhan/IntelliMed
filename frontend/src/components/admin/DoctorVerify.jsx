import { useState, useEffect } from 'react';
import { getUnverifiedDoctors, verifyDoctor } from '../../api/doctorApi';
import { toast } from 'react-toastify';
import PageHeader from '../ui/PageHeader';
import Card from '../ui/Card';
import Button from '../ui/Button';
import ConfirmDialog from '../ui/ConfirmDialog';
import EmptyState from '../ui/EmptyState';
import { SkeletonCard } from '../ui/Skeleton';
import { CheckCircle, UserCheck, Stethoscope, MapPin, Award } from 'lucide-react';

export default function DoctorVerify() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyId, setVerifyId] = useState(null);

  useEffect(() => { fetchDoctors(); }, []);

  const fetchDoctors = async () => {
    try { const { data } = await getUnverifiedDoctors(); setDoctors(data); }
    catch { toast.error('Failed to load doctors'); }
    finally { setLoading(false); }
  };

  const handleVerify = async () => {
    try {
      await verifyDoctor(verifyId);
      toast.success('Doctor verified!');
      fetchDoctors();
    } catch { toast.error('Failed to verify'); }
    finally { setVerifyId(null); }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader title="Doctor Verification" subtitle="Review and verify doctor profiles" />

      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>
      ) : doctors.length === 0 ? (
        <Card>
          <EmptyState icon={UserCheck} title="All caught up!" description="No doctors pending verification" />
        </Card>
      ) : (
        <div className="space-y-4">
          {doctors.map((doc) => (
            <Card key={doc.id}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                    <Stethoscope size={22} className="text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-800">Dr. {doc.firstName || 'Doctor'} {doc.lastName || ''}</h3>
                    <p className="text-sm text-primary-600 font-medium">{doc.specialty}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                      {doc.qualification && (
                        <span className="text-xs text-slate-500 flex items-center gap-1"><Award size={12} /> {doc.qualification}</span>
                      )}
                      {doc.hospital && (
                        <span className="text-xs text-slate-500 flex items-center gap-1"><MapPin size={12} /> {doc.hospital}</span>
                      )}
                      {doc.experienceYears && (
                        <span className="text-xs text-slate-500">{doc.experienceYears} years exp.</span>
                      )}
                    </div>
                  </div>
                </div>
                <Button icon={CheckCircle} variant="accent" onClick={() => setVerifyId(doc.id)}>
                  Verify
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={verifyId !== null}
        onClose={() => setVerifyId(null)}
        onConfirm={handleVerify}
        title="Verify Doctor"
        message="Are you sure you want to verify this doctor? They will be marked as verified on the platform."
        confirmLabel="Verify"
        variant="primary"
      />
    </div>
  );
}
