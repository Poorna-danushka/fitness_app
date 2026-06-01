import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Package, Dumbbell, CreditCard, LogOut, X, Shield, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAdminAnnouncements } from '../hooks/useNotifications';

interface Props {
  onClose?: () => void;
}

export default function AdminSidebar({ onClose }: Props) {
  const location = useLocation();
  const { logout, user } = useAuth();
  const { announcements } = useAdminAnnouncements();

  const menuItems = [
    { name: 'Dashboard',     path: '/admin/dashboard',     icon: <LayoutDashboard className="w-[18px] h-[18px]" /> },
    { name: 'Users',         path: '/admin/users',         icon: <Users           className="w-[18px] h-[18px]" /> },
    { name: 'Packages',      path: '/admin/packages',      icon: <Package         className="w-[18px] h-[18px]" /> },
    { name: 'Exercises',     path: '/admin/exercises',     icon: <Dumbbell        className="w-[18px] h-[18px]" /> },
    { name: 'Purchases',     path: '/admin/purchases',     icon: <CreditCard      className="w-[18px] h-[18px]" /> },
    { name: 'Notifications', path: '/admin/notifications', icon: <Bell            className="w-[18px] h-[18px]" />, badge: announcements.length },
  ];

  return (
    <div className="w-64 bg-[#080809] border-r border-white/[0.06] flex flex-col h-screen text-white">

      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-white/[0.06]">
        <Link to="/admin/dashboard" className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 bg-purple-600 rounded-xl flex items-center justify-center"
            style={{ boxShadow: '0 0 16px rgba(168,85,247,0.35)' }}
          >
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-black tracking-tight font-display">
            GymFit<span className="text-purple-400">Admin</span>
          </span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-gray-600 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/[0.06]">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Admin profile pill */}
      <div className="mx-4 mt-4 mb-2 p-3 rounded-2xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/15 flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-purple-700 flex items-center justify-center font-bold text-sm shrink-0"
          style={{ boxShadow: '0 0 12px rgba(168,85,247,0.3)' }}
        >
          {user?.name?.charAt(0).toUpperCase() || 'A'}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate text-white">{user?.name || 'Admin'}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            <p className="text-xs text-purple-400 font-medium">Administrator</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 px-3 flex flex-col gap-0.5 overflow-y-auto custom-scrollbar">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-700 px-3 mb-2 mt-1">Management</p>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={`sidebar-nav-item sidebar-nav-item-admin ${isActive ? 'active' : 'text-gray-500'}`}
            >
              <span className={isActive ? 'text-purple-400' : 'text-gray-600'}>{item.icon}</span>
              <span className="flex-1">{item.name}</span>
              {item.badge != null && item.badge > 0 && (
                <span className="min-w-[20px] h-5 bg-purple-500/20 text-purple-300 text-[10px] font-bold rounded-full flex items-center justify-center px-1.5 border border-purple-500/20">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/[0.06]">
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-red-500/10 hover:text-red-400 w-full transition-all"
        >
          <LogOut className="w-[18px] h-[18px]" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}