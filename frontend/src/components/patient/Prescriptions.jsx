import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getPrescriptionsByPatientId } from '../../api/patientApi';
import { formatDateTime } from '../../utils/helpers';
import { toast } from 'react-toastify';

export default function PatientPrescriptions() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await getPrescriptionsByPatientId(user.userId);
        setPrescriptions(data);
      } catch (err) {
        toast.error('Failed to load prescriptions');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.userId]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Prescriptions</h1>
      {prescriptions.length === 0 ? (
        <p className="text-gray-500">No prescriptions found</p>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((p) => (
            <div key={p.id} className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-lg">{p.diagnosis}</h3>
                <span className="text-sm text-gray-500">{formatDateTime(p.issuedAt)}</span>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-600">Medications:</span>
                  <p className="text-gray-800">{p.medications}</p>
                </div>
                {p.instructions && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Instructions:</span>
                    <p className="text-gray-800">{p.instructions}</p>
                  </div>
                )}
                {p.notes && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Notes:</span>
                    <p className="text-gray-800">{p.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
