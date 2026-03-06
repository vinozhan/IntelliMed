import { useState, useEffect } from 'react';
import { getDoctorProfile, createDoctorProfile, updateDoctorProfile, getSpecialties } from '../../api/doctorApi';
import { toast } from 'react-toastify';
import useFormValidation from '../../hooks/useFormValidation';
import PageHeader from '../ui/PageHeader';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Skeleton from '../ui/Skeleton';
import { BadgeCheck, Clock } from 'lucide-react';

export default function DoctorProfile() {
  const [profile, setProfile] = useState({
    specialty: '', qualification: '', experienceYears: '', consultationFee: '', hospital: '',
  });
  const [specialties, setSpecialties] = useState([]);
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { errors, validateAll, clearError } = useFormValidation({
    specialty: [{ required: true, message: 'Specialty is required' }],
    qualification: [{ required: true, message: 'Qualification is required' }],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const specRes = await getSpecialties();
        setSpecialties(specRes.data);
        const { data } = await getDoctorProfile();
        setProfile(data);
      } catch { setIsNew(true); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleChange = (field, value) => {
    setProfile({ ...profile, [field]: value });
    clearError(field);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateAll(profile)) return;
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
    } catch { toast.error('Failed to save profile'); }
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton variant="rect" height={40} width="40%" />
        <Skeleton variant="rect" height={400} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title={isNew ? 'Create Doctor Profile' : 'Edit Doctor Profile'}
        subtitle={isNew ? 'Set up your professional profile' : 'Update your professional details'}
      />

      {!isNew && (
        <div className="flex items-center gap-2 mb-6">
          {profile.isVerified ? (
            <Badge color="accent" variant="soft"><BadgeCheck size={12} className="inline" /> Verified</Badge>
          ) : (
            <Badge color="warm" variant="soft"><Clock size={12} className="inline" /> Pending Verification</Badge>
          )}
        </div>
      )}

      <form onSubmit={handleSave}>
        <Card className="space-y-5">
          <Select label="Specialty" value={profile.specialty || ''} onChange={(e) => handleChange('specialty', e.target.value)} error={errors.specialty} required>
            <option value="">Select Specialty</option>
            {specialties.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>

          <Input label="Qualification" value={profile.qualification || ''} onChange={(e) => handleChange('qualification', e.target.value)} error={errors.qualification} required placeholder="e.g., MBBS, MD" />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Experience (years)" type="number" value={profile.experienceYears || ''} onChange={(e) => handleChange('experienceYears', parseInt(e.target.value) || '')} />
            <Input label="Consultation Fee ($)" type="number" step="0.01" value={profile.consultationFee || ''} onChange={(e) => handleChange('consultationFee', parseFloat(e.target.value) || '')} />
          </div>

          <Input label="Hospital" value={profile.hospital || ''} onChange={(e) => handleChange('hospital', e.target.value)} placeholder="e.g., City General Hospital" />

          <Button type="submit" loading={saving} className="w-full" size="lg">
            {isNew ? 'Create Profile' : 'Update Profile'}
          </Button>
        </Card>
      </form>
    </div>
  );
}
