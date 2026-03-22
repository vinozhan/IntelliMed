import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { registerUser } from '../../api/authApi';
import { toast } from 'react-toastify';
import useFormValidation from '../../hooks/useFormValidation';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Mail, Lock, User, Phone, Heart, Stethoscope } from 'lucide-react';

export default function RegisterForm() {
  const [form, setForm] = useState({
    email: '', password: '', firstName: '', lastName: '', phone: '', role: 'PATIENT',
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const { errors, validateAll, clearError } = useFormValidation({
    firstName: [{ required: true, message: 'First name is required' }],
    lastName: [{ required: true, message: 'Last name is required' }],
    email: [{ required: true, message: 'Email is required' }, { email: true, message: 'Enter a valid email' }],
    password: [{ required: true, message: 'Password is required' }, { minLength: 6, message: 'At least 6 characters' }],
  });

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
    clearError(field);
  };

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return Math.min(s, 4);
  };

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColor = ['', 'bg-danger-500', 'bg-warm-500', 'bg-primary-500', 'bg-accent-500'];
  const strength = passwordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll(form)) return;
    setLoading(true);
    try {
      const { data } = await registerUser(form);
      login(data);
      toast.success('Account created!');
      if (data.role === 'DOCTOR') navigate('/doctor/dashboard');
      else navigate('/patient/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 p-12 flex-col justify-between relative overflow-hidden">
        <div className="flex items-center gap-2.5 relative z-10">
          <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
            <Heart className="text-white" size={20} />
          </div>
          <span className="text-xl font-bold font-heading text-white">IntelliMed</span>
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold font-heading text-white leading-tight mb-4">
            Join the future<br />of healthcare.
          </h1>
          <p className="text-primary-200 text-lg leading-relaxed">
            Create your account to book appointments, consult doctors, and get AI-powered health insights.
          </p>
        </div>
        <img
          src="/images/auth-illustration.png"
          alt=""
          className="absolute bottom-0 right-0 w-3/4 max-w-sm object-contain opacity-20"
          loading="lazy"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <p className="text-primary-300 text-sm relative z-10">&copy; {new Date().getFullYear()} IntelliMed</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-surface-secondary">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Heart className="text-white" size={16} />
            </div>
            <span className="text-lg font-bold font-heading text-slate-800">IntelliMed</span>
          </div>

          <h2 className="text-2xl font-bold font-heading text-slate-800 mb-1">Create Account</h2>
          <p className="text-sm text-slate-500 mb-6">Choose your role and fill in your details</p>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => handleChange('role', 'PATIENT')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                form.role === 'PATIENT'
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <User size={24} className={form.role === 'PATIENT' ? 'text-primary-600' : 'text-slate-400'} />
              <span className={`text-sm font-medium ${form.role === 'PATIENT' ? 'text-primary-700' : 'text-slate-600'}`}>Patient</span>
            </button>
            <button
              type="button"
              onClick={() => handleChange('role', 'DOCTOR')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                form.role === 'DOCTOR'
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <Stethoscope size={24} className={form.role === 'DOCTOR' ? 'text-primary-600' : 'text-slate-400'} />
              <span className={`text-sm font-medium ${form.role === 'DOCTOR' ? 'text-primary-700' : 'text-slate-600'}`}>Doctor</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First Name"
                placeholder="John"
                icon={User}
                value={form.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                error={errors.firstName}
              />
              <Input
                label="Last Name"
                placeholder="Doe"
                value={form.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                error={errors.lastName}
              />
            </div>
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              error={errors.email}
              autoComplete="email"
            />
            <div>
              <Input
                label="Password"
                type="password"
                placeholder="Min. 6 characters"
                icon={Lock}
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                error={errors.password}
                autoComplete="new-password"
              />
              {form.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full ${i <= strength ? strengthColor[strength] : 'bg-slate-200'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500">{strengthLabel[strength]}</span>
                </div>
              )}
            </div>
            <Input
              label="Phone (optional)"
              type="tel"
              placeholder="+94 XX XXX XXXX"
              icon={Phone}
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
            <Button type="submit" loading={loading} className="w-full" size="lg">
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
