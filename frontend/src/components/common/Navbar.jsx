import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Menu, X, Heart } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const dashboardPath = user?.role === 'DOCTOR' ? '/doctor/dashboard'
    : user?.role === 'ADMIN' ? '/admin/dashboard'
    : '/patient/dashboard';

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60" role="navigation" aria-label="Public navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Heart className="text-white" size={18} />
            </div>
            <Link to="/" className="text-xl font-bold font-heading text-slate-800">
              IntelliMed
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Link to="/doctors" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-colors">
              Find Doctors
            </Link>
            {!user ? (
              <>
                <Link to="/login" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-colors">
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 active:scale-[0.98] transition-all"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <Link
                to={dashboardPath}
                className="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 active:scale-[0.98] transition-all"
              >
                Dashboard
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setOpen(!open)} className="p-2 rounded-lg hover:bg-slate-100" aria-label="Toggle menu">
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pb-4 pt-2 space-y-1 animate-slide-up">
          <Link to="/doctors" className="block px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-50" onClick={() => setOpen(false)}>
            Find Doctors
          </Link>
          {!user ? (
            <>
              <Link to="/login" className="block px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-50" onClick={() => setOpen(false)}>
                Sign In
              </Link>
              <Link to="/register" className="block px-3 py-2 text-sm font-medium text-primary-600 rounded-lg hover:bg-primary-50" onClick={() => setOpen(false)}>
                Get Started
              </Link>
            </>
          ) : (
            <Link to={dashboardPath} className="block px-3 py-2 text-sm font-medium text-primary-600 rounded-lg hover:bg-primary-50" onClick={() => setOpen(false)}>
              Dashboard
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
