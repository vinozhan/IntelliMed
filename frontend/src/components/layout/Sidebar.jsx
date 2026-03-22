import { NavLink } from 'react-router-dom';
import { X, Heart } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { NAV_ITEMS } from '../../utils/constants';
import Avatar from '../ui/Avatar';

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const items = NAV_ITEMS[user?.role] || [];

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-out lg:translate-x-0 lg:static lg:z-auto ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-slate-100 shrink-0">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Heart className="text-white" size={18} />
          </div>
          <span className="font-heading text-lg font-bold text-slate-800">IntelliMed</span>
          <button
            onClick={onClose}
            className="ml-auto lg:hidden p-1 rounded-lg hover:bg-slate-100"
            aria-label="Close sidebar"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path.includes('dashboard')}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
              aria-current={({ isActive }) => isActive ? 'page' : undefined}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-3 border-t border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <Avatar name={`${user?.firstName || ''} ${user?.lastName || ''}`} size="sm" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-700 truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-slate-400 truncate capitalize">{user?.role?.toLowerCase()}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
