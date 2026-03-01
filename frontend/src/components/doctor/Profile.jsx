import { useState, useEffect } from 'react';
import { getDoctorProfile, createDoctorProfile, updateDoctorProfile, getSpecialties } from '../../api/doctorApi';
import { toast } from 'react-toastify';

export default function DoctorProfile() {
  const [profile, setProfile] = useState({
    specialty: '', qualification: '', experienceYears: '', consultationFee: '', hospital: '',
  });
  const [specialties, setSpecialties] = useState([]);
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [specRes] = await Promise.all([getSpecialties()]);
        setSpecialties(specRes.data);
        const { data } = await getDoctorProfile();
        setProfile(data);
      } catch (err) {
        setIsNew(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isNew) {
        const { data } = await createDoctorProfile(profile);
        setProfile(data);
        setIsNew(false);
        toast.success('Profile created!');
      } else {
        const { data } = await updateDoctorProfile(profile);
        setProfile(data);
        toast.success('Profile updated!');
      }
    } catch (err) {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        {isNew ? 'Create Doctor Profile' : 'Edit Doctor Profile'}
      </h1>
      <form onSubmit={handleSave} className="bg-white rounded-xl shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
          <select className="w-full px-4 py-2 border rounded-lg" value={profile.specialty || ''} onChange={(e) => setProfile({ ...profile, specialty: e.target.value })} required>
            <option value="">Select Specialty</option>
            {specialties.map((s) => (<option key={s} value={s}>{s}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
          <input type="text" className="w-full px-4 py-2 border rounded-lg" value={profile.qualification || ''} onChange={(e) => setProfile({ ...profile, qualification: e.target.value })} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
            <input type="number" className="w-full px-4 py-2 border rounded-lg" value={profile.experienceYears || ''} onChange={(e) => setProfile({ ...profile, experienceYears: parseInt(e.target.value) || '' })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee ($)</label>
            <input type="number" step="0.01" className="w-full px-4 py-2 border rounded-lg" value={profile.consultationFee || ''} onChange={(e) => setProfile({ ...profile, consultationFee: parseFloat(e.target.value) || '' })} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hospital</label>
          <input type="text" className="w-full px-4 py-2 border rounded-lg" value={profile.hospital || ''} onChange={(e) => setProfile({ ...profile, hospital: e.target.value })} />
        </div>
        <button type="submit" disabled={saving} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {saving ? 'Saving...' : isNew ? 'Create Profile' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
}
