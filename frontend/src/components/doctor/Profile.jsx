import { useState, useEffect, useRef } from 'react';
import { getDoctorProfile, createDoctorProfile, updateDoctorProfile, getSpecialties, uploadProfilePicture } from '../../api/doctorApi';
import { toast } from 'react-toastify';
import useFormValidation from '../../hooks/useFormValidation';
import PageHeader from '../ui/PageHeader';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Skeleton from '../ui/Skeleton';
import Avatar from '../ui/Avatar';
import { BadgeCheck, Clock, Camera, Loader2 } from 'lucide-react';

export default function DoctorProfile() {
  const [profile, setProfile] = useState({
    specialty: '', qualification: '', experienceYears: '', consultationFee: '', hospital: '',
  });
  const [specialties, setSpecialties] = useState([]);
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

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

  const handlePictureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await uploadProfilePicture(formData);
      setProfile(data);
      toast.success('Profile picture updated!');
    } catch {
      toast.error('Failed to upload picture');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
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
        <div className="flex items-center gap-4 mb-6">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            {uploading ? (
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                <Loader2 size={24} className="text-primary-600 animate-spin" />
              </div>
            ) : (
              <Avatar
                src={profile.profileImageUrl || '/images/default-avatar.svg'}
                name={`${profile.firstName || 'Dr'} ${profile.lastName || ''}`}
                size="xl"
              />
            )}
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={18} className="text-white" />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePictureUpload}
              className="hidden"
            />
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-800">Dr. {profile.firstName} {profile.lastName}</p>
            {profile.isVerified ? (
              <Badge color="accent" variant="soft"><BadgeCheck size={12} className="inline" /> Verified</Badge>
            ) : (
              <Badge color="warm" variant="soft"><Clock size={12} className="inline" /> Pending Verification</Badge>
            )}
          </div>
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
