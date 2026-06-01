import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import UserSidebar from './UserSidebar';
import { useAuth } from '../context/AuthContext';
import { Bell, Menu, Search, Home, Dumbbell, Package, User } from 'lucide-react';

const BOTTOM_NAV = [
  { path: '/dashboard',  icon: Home,     label: 'Home'     },
  { path: '/workouts',   icon: Dumbbell, label: 'Workouts' },
  { path: '/my-package', icon: Package,  label: 'Package'  },
  { path: '/profile',    icon: User,     label: 'Profile'  },
];

export default function UserLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — desktop always visible, mobile slide-in */}
      <aside
        className={`fixed lg:relative inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <UserSidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 lg:h-16 border-b border-white/[0.06] bg-black/60 backdrop-blur-md flex items-center justify-between px-4 lg:px-6 shrink-0 gap-4">
          {/* Left: mobile menu + search */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden md:flex items-center bg-white/[0.04] border border-white/[0.08] rounded-full px-4 py-2 w-56">
              <Search className="w-4 h-4 text-gray-600 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-gray-600"
              />
            </div>
          </div>

          {/* Right: notifications + avatar */}
          <div className="flex items-center gap-3">
            <button className="relative text-gray-500 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white leading-tight">{user?.name || 'Member'}</p>
                <p className="text-xs text-green-400 font-medium">Pro Member</p>
              </div>
              <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-gradient-to-tr from-green-500 to-green-300 flex items-center justify-center text-black font-bold text-sm shadow-[0_0_12px_rgba(34,197,94,0.3)]">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Page content — extra bottom padding on mobile for bottom nav */}
        <main className="flex-1 overflow-auto p-4 lg:p-6 bg-[#050505] relative pb-24 lg:pb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/[0.03] to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ── Mobile Bottom Navigation ───────────────────────────── */}
      <nav className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/[0.07]">
        <div className="flex items-center justify-around h-16 px-2">
          {BOTTOM_NAV.map(({ path, icon: Icon, label }) => {
            const isActive =
              location.pathname === path ||
              location.pathname.startsWith(path + '/');
            return (
              <Link
                key={path}
                to={path}
                className="flex flex-col items-center gap-1 flex-1 py-2 rounded-xl transition-all relative"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-green-500/15'
                      : 'bg-transparent'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? 'text-green-400' : 'text-gray-600'
                    }`}
                  />
                </div>
                <span
                  className={`text-[10px] font-bold tracking-wide transition-colors ${
                    isActive ? 'text-green-400' : 'text-gray-700'
                  }`}
                >
                  {label}
                </span>
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-green-400" />
                )}
              </Link>
            );
          })}
        </div>
        {/* Safe-area spacer (iOS home indicator) */}
        <div className="h-safe-bottom bg-[#0a0a0a]" style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
      </nav>
    </div>
  );
}
