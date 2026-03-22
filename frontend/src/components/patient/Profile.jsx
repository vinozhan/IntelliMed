import { useState, useEffect, useRef } from 'react';
import { getPatientProfile, updatePatientProfile, uploadProfilePicture } from '../../api/patientApi';
import { toast } from 'react-toastify';
import useFormValidation from '../../hooks/useFormValidation';
import PageHeader from '../ui/PageHeader';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import Skeleton from '../ui/Skeleton';
import Avatar from '../ui/Avatar';
import { Camera, Loader2 } from 'lucide-react';

export default function PatientProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const { errors, validateAll, clearError } = useFormValidation({
    firstName: [{ required: true, message: 'First name is required' }],
    lastName: [{ required: true, message: 'Last name is required' }],
  });

  useEffect(() => {
    getPatientProfile()
      .then(({ data }) => setProfile(data))
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
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
      const { data } = await updatePatientProfile(profile);
      setProfile(data);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
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
      <PageHeader title="My Profile" subtitle="Manage your personal and medical information" />

      <div className="flex items-center gap-4 mb-6">
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          {uploading ? (
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
              <Loader2 size={24} className="text-primary-600 animate-spin" />
            </div>
          ) : (
            <Avatar
              src={profile?.profileImageUrl || '/images/default-avatar.svg'}
              name={`${profile?.firstName || ''} ${profile?.lastName || ''}`}
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
          <p className="text-lg font-semibold text-slate-800">{profile?.firstName} {profile?.lastName}</p>
          <p className="text-sm text-slate-500">{profile?.email}</p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <Card className="space-y-6">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Personal Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="First Name" value={profile?.firstName || ''} onChange={(e) => handleChange('firstName', e.target.value)} error={errors.firstName} />
            <Input label="Last Name" value={profile?.lastName || ''} onChange={(e) => handleChange('lastName', e.target.value)} error={errors.lastName} />
          </div>
          <Input label="Phone" type="tel" value={profile?.phone || ''} onChange={(e) => handleChange('phone', e.target.value)} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Date of Birth" type="date" value={profile?.dateOfBirth || ''} onChange={(e) => handleChange('dateOfBirth', e.target.value)} />
            <Select label="Gender" value={profile?.gender || ''} onChange={(e) => handleChange('gender', e.target.value)}>
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </Select>
          </div>

          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider pt-2">Medical Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Blood Type" value={profile?.bloodType || ''} onChange={(e) => handleChange('bloodType', e.target.value)}>
              <option value="">Select</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bt) => (
                <option key={bt} value={bt}>{bt}</option>
              ))}
            </Select>
            <Input label="Emergency Contact" value={profile?.emergencyContact || ''} onChange={(e) => handleChange('emergencyContact', e.target.value)} />
          </div>
          <Textarea label="Address" rows={2} value={profile?.address || ''} onChange={(e) => handleChange('address', e.target.value)} />

          <Button type="submit" loading={saving} className="w-full" size="lg">
            Save Profile
          </Button>
        </Card>
      </form>
    </div>
  );
}
