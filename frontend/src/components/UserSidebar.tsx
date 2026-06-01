import { Link, useLocation } from 'react-router-dom';
import { Home, Package, Activity, User, LogOut, X, Zap, Dumbbell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Props {
  onClose?: () => void;
}

export default function UserSidebar({ onClose }: Props) {
  const location = useLocation();
  const { logout, user } = useAuth();

  const navItems = [
    { name: 'Dashboard',   path: '/dashboard',   icon: <Home     className="w-5 h-5" /> },
    { name: 'Packages',    path: '/packages',    icon: <Package  className="w-5 h-5" /> },
    { name: 'My Package',  path: '/my-package',  icon: <Activity className="w-5 h-5" /> },
    { name: 'Workouts',    path: '/workouts',    icon: <Dumbbell className="w-5 h-5" /> },
    { name: 'Profile',     path: '/profile',     icon: <User     className="w-5 h-5" /> },
  ];

  return (
    <div className="w-64 bg-[#0a0a0a] border-r border-white/[0.06] flex flex-col h-screen text-white">
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-white/[0.06]">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shadow-[0_0_12px_rgba(34,197,94,0.4)]">
            <Zap className="w-4 h-4 text-black" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-black tracking-tight">
            GymFit<span className="text-green-400">Pro</span>
          </span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User profile pill */}
      <div className="mx-4 my-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-green-500 to-green-300 flex items-center justify-center font-bold text-black text-sm shrink-0 shadow-[0_0_10px_rgba(34,197,94,0.3)]">
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sm truncate">{user?.name || 'Member'}</p>
          <p className="text-xs text-green-400 font-medium">Pro Member</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 px-3 flex flex-col gap-1 overflow-y-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 px-3 mb-2">Menu</p>
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            location.pathname.startsWith(item.path + '/');
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                isActive
                  ? 'bg-green-500/15 text-green-300 font-semibold border border-green-500/20'
                  : 'text-gray-500 hover:bg-white/[0.04] hover:text-gray-200'
              }`}
            >
              <span className={isActive ? 'text-green-400' : ''}>{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/[0.06]">
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-red-500/10 hover:text-red-400 w-full transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
