import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              IntelliMed
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link to="/doctors" className="text-gray-600 hover:text-blue-600">
              Find Doctors
            </Link>
            {!user ? (
              <>
                <Link to="/login" className="text-gray-600 hover:text-blue-600">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                {user.role === 'PATIENT' && (
                  <>
                    <Link to="/patient/dashboard" className="text-gray-600 hover:text-blue-600">
                      Dashboard
                    </Link>
                    <Link to="/patient/profile" className="text-gray-600 hover:text-blue-600">
                      My Profile
                    </Link>
                    <Link to="/symptom-checker" className="text-gray-600 hover:text-blue-600">
                      AI Symptom Checker
                    </Link>
                  </>
                )}
                {user.role === 'DOCTOR' && (
                  <Link to="/doctor/dashboard" className="text-gray-600 hover:text-blue-600">
                    Dashboard
                  </Link>
                )}
                {user.role === 'ADMIN' && (
                  <Link to="/admin/dashboard" className="text-gray-600 hover:text-blue-600">
                    Admin
                  </Link>
                )}
                <span className="text-gray-500">
                  Hi, {user.firstName}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setOpen(!open)}>
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="md:hidden px-4 pb-4 space-y-2">
          <Link to="/doctors" className="block text-gray-600 py-1" onClick={() => setOpen(false)}>
            Find Doctors
          </Link>
          {!user ? (
            <>
              <Link to="/login" className="block text-gray-600 py-1" onClick={() => setOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="block text-blue-600 py-1" onClick={() => setOpen(false)}>
                Register
              </Link>
            </>
          ) : (
            <>
              {user.role === 'PATIENT' && (
                <>
                  <Link to="/patient/dashboard" className="block text-gray-600 py-1" onClick={() => setOpen(false)}>
                    Dashboard
                  </Link>
                  <Link to="/patient/profile" className="block text-gray-600 py-1" onClick={() => setOpen(false)}>
                    My Profile
                  </Link>
                  <Link to="/symptom-checker" className="block text-gray-600 py-1" onClick={() => setOpen(false)}>
                    AI Symptom Checker
                  </Link>
                </>
              )}
              {user.role === 'DOCTOR' && (
                <Link to="/doctor/dashboard" className="block text-gray-600 py-1" onClick={() => setOpen(false)}>
                  Dashboard
                </Link>
              )}
              {user.role === 'ADMIN' && (
                <Link to="/admin/dashboard" className="block text-gray-600 py-1" onClick={() => setOpen(false)}>
                  Admin
                </Link>
              )}
              <button onClick={handleLogout} className="block text-red-600 py-1">
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
