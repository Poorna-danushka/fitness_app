import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Plus, Trash2, Pin, Info, CheckCircle, AlertTriangle, Zap,
  Eye, X, MessageSquare
} from 'lucide-react';
import { useAdminAnnouncements, AnnouncementType, Announcement } from '../../hooks/useNotifications';
import { useAuth } from '../../context/AuthContext';

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
  return new Date(iso).toLocaleDateString();
}

function NotifPreview({ ann }: { ann: Partial<Announcement> }) {
  const cfg = TYPE_CONFIG[ann.type || 'info'];
  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: cfg.bgColor,
        borderLeft: `3px solid ${cfg.borderColor}`,
        border: `1px solid rgba(255,255,255,0.06)`,
        borderLeftColor: cfg.borderColor,
        borderLeftWidth: '3px',
      }}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0" style={{ color: cfg.borderColor }}>{cfg.icon}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-sm text-white">{ann.title || 'Announcement title'}</p>
            {ann.pinned && <span className="text-[9px] font-bold uppercase tracking-wider text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded">Pinned</span>}
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.badgeClass}`}>{cfg.label}</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">{ann.message || 'Your announcement message will appear here.'}</p>
        </div>
      </div>
    </div>
  );
}

export default function ManageNotifications() {
  const { user } = useAuth();
  const { announcements, createAnnouncement, deleteAnnouncement, updateAnnouncement } = useAdminAnnouncements();

  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    message: '',
    type: 'info' as AnnouncementType,
    pinned: false,
  });
  const [errors, setErrors] = useState<{ title?: string; message?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!form.title.trim())   e.title   = 'Title is required.';
    if (!form.message.trim()) e.message = 'Message is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = () => {
    if (!validate()) return;
    createAnnouncement({ ...form, createdBy: user?.name || 'Admin' });
    setForm({ title: '', message: '', type: 'info', pinned: false });
    setErrors({});
    setShowForm(false);
    setShowPreview(false);
  };

  const togglePin = (ann: Announcement) => {
    updateAnnouncement(ann.id, { pinned: !ann.pinned });
  };

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-1 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center">
                <Bell className="w-5 h-5 text-purple-400" />
              </div>
              Notifications
            </h1>
            <p className="text-gray-500 text-sm">Create and manage announcements visible to all users.</p>
          </div>
          <button
            id="create-notification-btn"
            onClick={() => { setShowForm(true); setShowPreview(false); }}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            New Announcement
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total',  value: announcements.length,                              color: 'text-white' },
          { label: 'Pinned', value: announcements.filter(a => a.pinned).length,        color: 'text-yellow-400' },
          { label: 'Urgent', value: announcements.filter(a => a.type === 'urgent').length, color: 'text-red-400' },
        ].map((s) => (
          <div key={s.label} className="card-surface p-4 rounded-2xl text-center">
            <p className={`text-2xl font-bold font-display ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-600 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="card-surface rounded-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <h2 className="font-semibold text-white text-sm">Create Announcement</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className={`btn-ghost text-xs py-1.5 px-3 ${showPreview ? 'border-purple-500/30 text-purple-300' : ''}`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  {showPreview ? 'Hide Preview' : 'Preview'}
                </button>
                <button onClick={() => { setShowForm(false); setErrors({}); }} className="btn-icon">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Type selector */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(TYPE_CONFIG) as AnnouncementType[]).map((t) => {
                    const cfg = TYPE_CONFIG[t];
                    const isSelected = form.type === t;
                    return (
                      <button
                        key={t}
                        onClick={() => setForm({ ...form, type: t })}
                        className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${cfg.badgeClass} ${
                          isSelected ? 'opacity-100' : 'opacity-40 hover:opacity-70'
                        }`}
                        style={isSelected ? { outline: `2px solid ${cfg.borderColor}`, outlineOffset: '2px' } : {}}
                      >
                        {cfg.icon}
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Title</label>
                <input
                  id="notif-title"
                  className={`input-dark ${errors.title ? 'border-red-500/50' : ''}`}
                  placeholder="e.g. New workout package available"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  maxLength={100}
                />
                {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
              </div>

              {/* Message */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Message</label>
                <textarea
                  id="notif-message"
                  className={`textarea-dark ${errors.message ? 'border-red-500/50' : ''}`}
                  placeholder="Describe the announcement in detail..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  maxLength={500}
                  rows={3}
                />
                <div className="flex items-center justify-between mt-1">
                  {errors.message && <p className="text-red-400 text-xs">{errors.message}</p>}
                  <p className="text-gray-700 text-xs ml-auto">{form.message.length}/500</p>
                </div>
              </div>

              {/* Pinned toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div>
                  <p className="text-sm font-medium text-white">Pin this announcement</p>
                  <p className="text-xs text-gray-600">Pinned announcements appear first and in the dashboard banner</p>
                </div>
                <div
                  className={`toggle-track ${form.pinned ? 'on' : ''}`}
                  onClick={() => setForm({ ...form, pinned: !form.pinned })}
                >
                  <div className="toggle-thumb" />
                </div>
              </div>

              {/* Preview */}
              <AnimatePresence>
                {showPreview && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Live Preview</label>
                    <NotifPreview ann={form} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button onClick={() => { setShowForm(false); setErrors({}); }} className="btn-ghost">Cancel</button>
                <button id="submit-notification-btn" onClick={handleCreate} className="btn-primary">
                  <Bell className="w-4 h-4" />
                  Publish Announcement
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Announcement List */}
      <div className="space-y-3">
        <h2 className="font-semibold text-sm text-gray-400">
          All Announcements <span className="text-gray-700">({announcements.length})</span>
        </h2>

        {announcements.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card-surface rounded-2xl py-16 flex flex-col items-center justify-center gap-4 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-white/[0.04] flex items-center justify-center">
              <Bell className="w-7 h-7 text-gray-700" />
            </div>
            <div>
              <p className="font-semibold text-gray-400 text-sm">No announcements yet</p>
              <p className="text-gray-700 text-xs mt-1">Create your first announcement to notify all users.</p>
            </div>
            <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
              <Plus className="w-4 h-4" />
              Create Announcement
            </button>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {announcements.map((ann, i) => {
              const cfg = TYPE_CONFIG[ann.type];
              return (
                <motion.div
                  key={ann.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="group rounded-2xl overflow-hidden border border-white/[0.06] bg-[#0d0d0f] hover:border-white/[0.1] transition-all"
                  style={{ borderLeft: `3px solid ${cfg.borderColor}` }}
                >
                  <div className="p-4 flex items-start gap-4">
                    <div
                      className="shrink-0 mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: cfg.bgColor, color: cfg.borderColor }}
                    >
                      {cfg.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-sm text-white">{ann.title}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.badgeClass}`}>{cfg.label}</span>
                        {ann.pinned && (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Pin className="w-2.5 h-2.5" /> Pinned
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed mb-2">{ann.message}</p>
                      <div className="flex items-center gap-3 text-[10px] text-gray-700">
                        <span>by {ann.createdBy}</span>
                        <span>·</span>
                        <span>{timeAgo(ann.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => togglePin(ann)}
                        title={ann.pinned ? 'Unpin' : 'Pin'}
                        className={`btn-icon ${ann.pinned ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' : ''}`}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(ann.id)}
                        className="btn-icon hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {deleteConfirmId === ann.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-white/[0.06] px-4 py-3 flex items-center justify-between bg-red-500/[0.05]"
                      >
                        <p className="text-xs text-red-400">Delete this announcement? This cannot be undone.</p>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setDeleteConfirmId(null)} className="btn-ghost text-xs py-1.5 px-3">Cancel</button>
                          <button
                            onClick={() => { deleteAnnouncement(ann.id); setDeleteConfirmId(null); }}
                            className="btn-danger text-xs py-1.5 px-3"
                          >
                            Delete
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
