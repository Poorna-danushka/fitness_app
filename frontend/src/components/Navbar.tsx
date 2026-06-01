import { useAuth } from '../context/AuthContext';
import { Bell, Search, Menu } from 'lucide-react';

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user } = useAuth();

  return (
    <header className="h-16 border-b border-white/[0.06] bg-black/70 backdrop-blur-md flex items-center justify-between px-4 md:px-6 z-20 sticky top-0 shrink-0">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden text-gray-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/[0.06]"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search bar */}
        <div className="hidden sm:flex items-center gap-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl px-3.5 py-2 w-56 md:w-72 group focus-within:border-green-500/40 focus-within:bg-white/[0.06] transition-all duration-200">
          <Search className="w-4 h-4 text-gray-600 group-focus-within:text-green-500 transition-colors shrink-0" />
          <input
            type="text"
            placeholder="Search exercises, packages..."
            className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-gray-600"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 md:gap-5">
        {/* Notification bell */}
        <button className="relative text-gray-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/[0.06]">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full ring-2 ring-black" />
        </button>

        {/* Divider */}
        <div className="hidden md:block w-px h-5 bg-white/10" />

        {/* User info */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-white leading-tight">{user?.name || 'User'}</p>
            <p className="text-xs text-green-500 font-medium font-display tracking-wide">Pro Member</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-black font-bold text-sm glow-green cursor-pointer">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}