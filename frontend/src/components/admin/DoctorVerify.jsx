import { useState, useEffect } from 'react';
import { getUnverifiedDoctors, verifyDoctor } from '../../api/doctorApi';
import { toast } from 'react-toastify';
import { CheckCircle } from 'lucide-react';

export default function DoctorVerify() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const { data } = await getUnverifiedDoctors();
      setDoctors(data);
    } catch (err) {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    try {
      await verifyDoctor(id);
      toast.success('Doctor verified!');
      fetchDoctors();
    } catch (err) {
      toast.error('Failed to verify');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Doctor Verification</h1>
      {doctors.length === 0 ? (
        <p className="text-gray-500">No doctors pending verification</p>
      ) : (
        <div className="space-y-4">
          {doctors.map((doc) => (
            <div key={doc.id} className="bg-white rounded-xl shadow p-6 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Dr. {doc.firstName || 'Doctor'} {doc.lastName || ''}</h3>
                <p className="text-blue-600">{doc.specialty}</p>
                <p className="text-sm text-gray-500">{doc.qualification} | {doc.experienceYears} years</p>
                <p className="text-sm text-gray-500">{doc.hospital}</p>
              </div>
              <button
                onClick={() => handleVerify(doc.id)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <CheckCircle size={18} /> Verify
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
