import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Package, Dumbbell, CreditCard, LogOut, X, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Props {
  onClose?: () => void;
}

export default function AdminSidebar({ onClose }: Props) {
  const location = useLocation();
  const { logout, user } = useAuth();

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Users', path: '/admin/users', icon: <Users className="w-5 h-5" /> },
    { name: 'Packages', path: '/admin/packages', icon: <Package className="w-5 h-5" /> },
    { name: 'Exercises', path: '/admin/exercises', icon: <Dumbbell className="w-5 h-5" /> },
    { name: 'Purchases', path: '/admin/purchases', icon: <CreditCard className="w-5 h-5" /> },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="w-64 bg-[#0a0a0a] border-r border-white/[0.06] flex flex-col h-screen text-white">
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-white/[0.06]">
        <Link to="/admin/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center shadow-[0_0_12px_rgba(168,85,247,0.4)]">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-black tracking-tight">
            GymFit<span className="text-purple-400">Admin</span>
          </span>
        </Link>
        {/* Mobile close button */}
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Admin profile pill */}
      <div className="mx-4 my-4 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-purple-300 flex items-center justify-center font-bold text-sm shrink-0">
          {user?.name?.charAt(0).toUpperCase() || 'A'}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sm truncate">{user?.name || 'Admin'}</p>
          <p className="text-xs text-purple-400 font-medium">Administrator</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 px-3 flex flex-col gap-1 overflow-y-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 px-3 mb-2">Management</p>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                isActive
                  ? 'bg-purple-500/15 text-purple-300 font-semibold border border-purple-500/20'
                  : 'text-gray-500 hover:bg-white/[0.04] hover:text-gray-200'
              }`}
            >
              <span className={isActive ? 'text-purple-400' : ''}>{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/[0.06]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-red-500/10 hover:text-red-400 w-full transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}