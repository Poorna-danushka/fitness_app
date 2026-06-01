import { motion } from 'framer-motion';
import { Bell, CheckCheck, Check, Info, CheckCircle, AlertTriangle, Zap, Pin } from 'lucide-react';
import { useAnnouncements, AnnouncementType, Announcement } from '../hooks/useNotifications';
import { useState } from 'react';

const TYPE_CONFIG: Record<AnnouncementType, {
  label: string; icon: React.ReactNode;
  badgeClass: string; borderColor: string; bgColor: string;
}> = {
  info:    { label: 'Info',    icon: <Info          className="w-4 h-4" />, badgeClass: 'badge-info',    borderColor: '#3b82f6', bgColor: 'rgba(59,130,246,0.08)'  },
  success: { label: 'Success', icon: <CheckCircle   className="w-4 h-4" />, badgeClass: 'badge-success', borderColor: '#22c55e', bgColor: 'rgba(34,197,94,0.08)'   },
  warning: { label: 'Warning', icon: <AlertTriangle className="w-4 h-4" />, badgeClass: 'badge-warning', borderColor: '#eab308', bgColor: 'rgba(234,179,8,0.08)'   },
  urgent:  { label: 'Urgent',  icon: <Zap           className="w-4 h-4" />, badgeClass: 'badge-urgent',  borderColor: '#ef4444', bgColor: 'rgba(239,68,68,0.08)'   },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

type FilterType = 'all' | AnnouncementType;

export default function UserNotificationsPage() {
  // Reads directly from localStorage — always up to date
  const { announcements, readIds, markRead, markAllRead, unreadCount } = useAnnouncements();
  const [filter, setFilter] = useState<FilterType>('all');

  const unread = unreadCount;

  const sorted = [...announcements].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const filtered = filter === 'all'
    ? sorted
    : sorted.filter((a: Announcement) => a.type === filter);

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all',     label: 'All' },
    { key: 'urgent',  label: 'Urgent' },
    { key: 'warning', label: 'Warning' },
    { key: 'info',    label: 'Info' },
    { key: 'success', label: 'Success' },
  ];

  return (
    <div className="space-y-6 pb-16 max-w-3xl mx-auto">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-1 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-green-500/15 border border-green-500/25 flex items-center justify-center">
                <Bell className="w-5 h-5 text-green-400" />
              </div>
              Notifications
              {unread > 0 && (
                <span className="badge-pop text-sm font-bold bg-red-500 text-white px-2.5 py-0.5 rounded-full">
                  {unread} new
                </span>
              )}
            </h1>
            <p className="text-gray-500 text-sm">Stay updated with the latest announcements from your gym.</p>
          </div>
          {unread > 0 && (
            <button onClick={markAllRead} className="btn-ghost text-sm flex items-center gap-2">
              <CheckCheck className="w-4 h-4" />
              Mark all as read
            </button>
          )}
        </div>
      </motion.div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {filters.map((f) => {
          const count = f.key === 'all'
            ? announcements.length
            : announcements.filter((a) => a.type === f.key).length;
          const isActive = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                isActive
                  ? 'bg-green-500/15 text-green-300 border-green-500/30'
                  : 'bg-white/[0.04] text-gray-500 border-white/[0.07] hover:text-gray-300 hover:border-white/[0.12]'
              }`}
            >
              {f.label}
              {count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-green-500/25 text-green-300' : 'bg-white/[0.08] text-gray-600'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card-surface rounded-2xl py-20 flex flex-col items-center gap-5 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
            <Bell className="w-9 h-9 text-gray-700" />
          </div>
          <div>
            <p className="font-semibold text-gray-400 text-base">No notifications found</p>
            <p className="text-gray-700 text-sm mt-1">
              {filter === 'all'
                ? 'No announcements from your gym yet. Check back later!'
                : `No ${filter} notifications found.`}
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {filtered.map((ann: Announcement, i: number) => {
            const isUnread = !readIds.includes(ann.id);
            const cfg = TYPE_CONFIG[ann.type];
            return (
              <motion.div
                key={ann.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => markRead(ann.id)}
                className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all"
                style={{
                  background: isUnread ? cfg.bgColor : 'rgba(255,255,255,0.015)',
                  border: `1px solid rgba(255,255,255,${isUnread ? '0.09' : '0.05'})`,
                  borderLeft: `3px solid ${cfg.borderColor}`,
                }}
              >
                <div className="p-5 flex items-start gap-4">
                  <div
                    className="shrink-0 mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: cfg.bgColor, color: cfg.borderColor }}
                  >
                    {cfg.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <p className={`font-semibold text-sm ${isUnread ? 'text-white' : 'text-gray-400'}`}>
                        {ann.title}
                      </p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.badgeClass}`}>
                        {cfg.label}
                      </span>
                      {ann.pinned && (
                        <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded">
                          <Pin className="w-2.5 h-2.5" /> Pinned
                        </span>
                      )}
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse ml-auto shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">{ann.message}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-700">
                      <span>From {ann.createdBy}</span>
                      <span>·</span>
                      <span>{timeAgo(ann.createdAt)}</span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isUnread ? (
                      <div className="w-8 h-8 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" title="Mark as read">
                        <Check className="w-3.5 h-3.5 text-green-400" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center">
                        <CheckCheck className="w-3.5 h-3.5 text-gray-700" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
