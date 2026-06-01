import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AnnouncementType = 'info' | 'success' | 'warning' | 'urgent';

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: AnnouncementType;
  pinned: boolean;
  createdAt: string;
  createdBy: string;
}

interface NotificationStore {
  announcements: Announcement[];
  readIds: string[];

  // Admin actions
  createAnnouncement: (data: Omit<Announcement, 'id' | 'createdAt'>) => void;
  deleteAnnouncement: (id: string) => void;
  updateAnnouncement: (id: string, data: Partial<Omit<Announcement, 'id' | 'createdAt'>>) => void;

  // User actions
  markRead: (id: string) => void;
  markAllRead: () => void;

  // Computed helpers
  unreadCount: () => number;
  unreadAnnouncements: () => Announcement[];
  pinnedAnnouncements: () => Announcement[];
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      announcements: [],
      readIds: [],

      createAnnouncement: (data) => {
        const newAnn: Announcement = {
          ...data,
          id: `ann-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          announcements: [newAnn, ...state.announcements],
        }));
      },

      deleteAnnouncement: (id) => {
        set((state) => ({
          announcements: state.announcements.filter((a) => a.id !== id),
          readIds: state.readIds.filter((rid) => rid !== id),
        }));
      },

      updateAnnouncement: (id, data) => {
        set((state) => ({
          announcements: state.announcements.map((a) =>
            a.id === id ? { ...a, ...data } : a
          ),
        }));
      },

      markRead: (id) => {
        set((state) => ({
          readIds: state.readIds.includes(id)
            ? state.readIds
            : [...state.readIds, id],
        }));
      },

      markAllRead: () => {
        const allIds = get().announcements.map((a) => a.id);
        set({ readIds: allIds });
      },

      unreadCount: () => {
        const { announcements, readIds } = get();
        return announcements.filter((a) => !readIds.includes(a.id)).length;
      },

      unreadAnnouncements: () => {
        const { announcements, readIds } = get();
        return announcements.filter((a) => !readIds.includes(a.id));
      },

      pinnedAnnouncements: () => {
        return get().announcements.filter((a) => a.pinned);
      },
    }),
    {
      name: 'gymfit-notifications',
    }
  )
);
