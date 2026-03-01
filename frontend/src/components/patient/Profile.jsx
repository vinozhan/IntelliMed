import { useState, useEffect } from 'react';
import { getPatientProfile, updatePatientProfile } from '../../api/patientApi';
import { toast } from 'react-toastify';

export default function PatientProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await getPatientProfile();
        setProfile(data);
      } catch (err) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await updatePatientProfile(profile);
      setProfile(data);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Profile</h1>
      <form onSubmit={handleSave} className="bg-white rounded-xl shadow p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input type="text" className="w-full px-4 py-2 border rounded-lg" value={profile?.firstName || ''} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input type="text" className="w-full px-4 py-2 border rounded-lg" value={profile?.lastName || ''} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input type="tel" className="w-full px-4 py-2 border rounded-lg" value={profile?.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input type="date" className="w-full px-4 py-2 border rounded-lg" value={profile?.dateOfBirth || ''} onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select className="w-full px-4 py-2 border rounded-lg" value={profile?.gender || ''} onChange={(e) => setProfile({ ...profile, gender: e.target.value })}>
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
            <select className="w-full px-4 py-2 border rounded-lg" value={profile?.bloodType || ''} onChange={(e) => setProfile({ ...profile, bloodType: e.target.value })}>
              <option value="">Select</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bt) => (
                <option key={bt} value={bt}>{bt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
            <input type="text" className="w-full px-4 py-2 border rounded-lg" value={profile?.emergencyContact || ''} onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <textarea className="w-full px-4 py-2 border rounded-lg" rows="2" value={profile?.address || ''} onChange={(e) => setProfile({ ...profile, address: e.target.value })} />
        </div>
        <button type="submit" disabled={saving} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
