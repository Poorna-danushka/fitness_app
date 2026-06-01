import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, Menu, User, LogOut, ChevronRight, Check, CheckCheck, Settings } from 'lucide-react';
import { useAnnouncements, AnnouncementType } from '../hooks/useNotifications';
import { Link, useNavigate } from 'react-router-dom';

interface NavbarProps {
  onMenuClick: () => void;
}

const TYPE_COLORS: Record<AnnouncementType, { dot: string }> = {
  info:    { dot: '#3b82f6' },
  success: { dot: '#22c55e' },
  warning: { dot: '#eab308' },
  urgent:  { dot: '#ef4444' },
};

function timeAgo(isoString: string) {
  const diff = Date.now() - new Date(isoString).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  // Only load notification data for regular users
  const { announcements, readIds, markRead, markAllRead, unreadCount } = useAnnouncements();

  const [bellOpen, setBellOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);

  const bellRef  = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  const unread = isAdmin ? 0 : unreadCount;

  // Close dropdowns on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (bellRef.current  && !bellRef.current.contains(e.target as Node))  setBellOpen(false);
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const handleBellOpen = () => {
    setBellOpen((v) => !v);
    setAvatarOpen(false);
  };

  const handleAvatarOpen = () => {
    setAvatarOpen((v) => !v);
    setBellOpen(false);
  };

  const handleNotifClick = (id: string) => {
    markRead(id);
    setBellOpen(false);
    navigate('/notifications');
  };

  return (
    <header className="h-16 border-b border-white/[0.06] bg-black/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 z-30 sticky top-0 shrink-0">

      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden text-gray-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/[0.06]"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <div className="hidden sm:flex items-center gap-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl px-3.5 py-2 w-56 md:w-72 group focus-within:border-green-500/40 focus-within:bg-white/[0.06] transition-all duration-200">
          <Search className="w-4 h-4 text-gray-600 group-focus-within:text-green-500 transition-colors shrink-0" />
          <input
            type="text"
            placeholder="Search exercises, packages..."
            className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-gray-600"
          />
          <span className="hidden lg:flex items-center gap-0.5 text-[10px] text-gray-700 shrink-0 border border-white/[0.08] rounded px-1 py-0.5">⌘K</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 md:gap-3">

        {/* Notification Bell — USER ONLY (admin creates, doesn't receive) */}
        {!isAdmin && (
          <div className="relative" ref={bellRef}>
            <button
              id="navbar-bell"
              onClick={handleBellOpen}
              className="relative text-gray-500 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/[0.06] active:scale-95"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unread > 0 && (
                <span className="badge-pop absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center px-1 ring-2 ring-black">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>

            {/* Bell dropdown */}
            {bellOpen && (
              <div className="dropdown-panel absolute right-0 top-full mt-2 w-80 z-50">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07]">
                  <div>
                    <p className="font-semibold text-sm text-white">Notifications</p>
                    {unread > 0 && <p className="text-xs text-gray-500">{unread} unread</p>}
                  </div>
                  {unread > 0 && (
                    <button
                      onClick={markAllRead}
                      className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 transition-colors font-medium"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                {/* List */}
                <div className="max-h-72 overflow-y-auto custom-scrollbar">
                  {announcements.length === 0 ? (
                    <div className="py-10 text-center">
                      <Bell className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                      <p className="text-gray-600 text-sm">No announcements yet</p>
                    </div>
                  ) : (
                    announcements.slice(0, 8).map((ann) => {
                      const isUnread = !readIds.includes(ann.id);
                      const dot = TYPE_COLORS[ann.type].dot;
                      return (
                        <button
                          key={ann.id}
                          onClick={() => handleNotifClick(ann.id)}
                          className="w-full text-left px-4 py-3 border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors group"
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className="mt-1.5 w-2 h-2 rounded-full shrink-0 transition-opacity"
                              style={{ background: dot, opacity: isUnread ? 1 : 0.3 }}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className={`text-sm font-semibold truncate ${isUnread ? 'text-white' : 'text-gray-400'}`}>
                                  {ann.title}
                                </p>
                                {ann.pinned && (
                                  <span className="text-[9px] font-bold uppercase tracking-wider text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded shrink-0">
                                    Pinned
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{ann.message}</p>
                              <p className="text-[10px] text-gray-700 mt-1">{timeAgo(ann.createdAt)}</p>
                            </div>
                            {isUnread && (
                              <Check className="w-3.5 h-3.5 text-gray-700 group-hover:text-green-400 transition-colors shrink-0 mt-1" />
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2.5 border-t border-white/[0.07]">
                  <Link
                    to="/notifications"
                    onClick={() => setBellOpen(false)}
                    className="flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-green-400 transition-colors font-medium py-1"
                  >
                    View all notifications
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="hidden md:block w-px h-5 bg-white/10" />

        {/* Avatar dropdown */}
        <div className="relative" ref={avatarRef}>
          <button
            id="navbar-avatar"
            onClick={handleAvatarOpen}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-white/[0.04] transition-colors active:scale-95"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-white leading-tight">{user?.name || 'User'}</p>
              <p className="text-xs font-medium" style={{ color: isAdmin ? '#c084fc' : '#4ade80' }}>
                {isAdmin ? 'Administrator' : 'Pro Member'}
              </p>
            </div>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-black font-bold text-sm shrink-0"
              style={{
                background: isAdmin
                  ? 'linear-gradient(135deg, #a855f7, #7c3aed)'
                  : 'linear-gradient(135deg, #4ade80, #22c55e)',
                boxShadow: isAdmin
                  ? '0 0 16px rgba(168,85,247,0.3)'
                  : '0 0 16px rgba(34,197,94,0.3)',
              }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </button>

          {avatarOpen && (
            <div className="dropdown-panel absolute right-0 top-full mt-2 w-52 z-50 py-1.5">
              <div className="px-3 pb-2 pt-1 border-b border-white/[0.07] mb-1">
                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              {!isAdmin && (
                <Link
                  to="/profile"
                  onClick={() => setAvatarOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/[0.04] transition-colors rounded-lg mx-1"
                >
                  <User className="w-4 h-4" />
                  My Profile
                </Link>
              )}
              {!isAdmin && (
                <Link
                  to="/notifications"
                  onClick={() => setAvatarOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/[0.04] transition-colors rounded-lg mx-1"
                >
                  <Settings className="w-4 h-4" />
                  Notifications
                </Link>
              )}
              <div className={`border-t border-white/[0.07] ${!isAdmin ? 'mt-1 pt-1' : ''} mx-1`}>
                <button
                  onClick={() => { setAvatarOpen(false); logout(); }}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/[0.07] transition-colors rounded-lg w-full"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}