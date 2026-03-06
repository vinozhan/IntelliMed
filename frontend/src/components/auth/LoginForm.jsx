import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { loginUser } from '../../api/authApi';
import { toast } from 'react-toastify';
import useFormValidation from '../../hooks/useFormValidation';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Mail, Lock, Eye, EyeOff, Heart } from 'lucide-react';

export default function LoginForm() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const { errors, validateAll, clearError } = useFormValidation({
    email: [{ required: true, message: 'Email is required' }, { email: true, message: 'Enter a valid email' }],
    password: [{ required: true, message: 'Password is required' }],
  });

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
    clearError(field);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll(form)) return;
    setLoading(true);
    try {
      const { data } = await loginUser(form);
      login(data);
      toast.success('Welcome back!');
      if (data.role === 'DOCTOR') navigate('/doctor/dashboard');
      else if (data.role === 'ADMIN') navigate('/admin/dashboard');
      else navigate('/patient/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 p-12 flex-col justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
            <Heart className="text-white" size={20} />
          </div>
          <span className="text-xl font-bold font-heading text-white">IntelliMed</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold font-heading text-white leading-tight mb-4">
            Your health journey<br />starts here.
          </h1>
          <p className="text-primary-200 text-lg leading-relaxed">
            AI-powered healthcare platform connecting patients with verified doctors for seamless consultations.
          </p>
        </div>
        <p className="text-primary-300 text-sm">&copy; {new Date().getFullYear()} IntelliMed</p>
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

          <h2 className="text-2xl font-bold font-heading text-slate-800 mb-1">Welcome back</h2>
          <p className="text-sm text-slate-500 mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                icon={Lock}
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                error={errors.password}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="mt-1 text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <Button type="submit" loading={loading} className="w-full" size="lg">
              Sign In
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-medium hover:text-primary-700">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
