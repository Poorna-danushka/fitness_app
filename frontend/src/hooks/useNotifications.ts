/**
 * Backend-connected notification system.
 * Replaces the old localStorage-based implementation.
 */
import { useState, useEffect, useCallback } from 'react';
import { notificationAPI } from '../api/apiService';
import { useAuth } from '../context/AuthContext';

export type AnnouncementType = 'info' | 'success' | 'warning' | 'urgent';

export interface Announcement {
  id: string; // Will map from _id returned by MongoDB
  _id: string;
  title: string;
  message: string;
  type: AnnouncementType;
  pinned: boolean;
  createdAt: string;
  createdBy: string;
}

// ─── User hook (read + mark-read) ────────────────────────────────────────────

export function useAnnouncements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [localReadIds, setLocalReadIds] = useState<string[]>([]);
  
  // We extract readNotifications from the user object in AuthContext.
  // The backend '/auth/me' returns readNotifications on the user.
  const readIds: string[] = Array.from(new Set([
    ...((user as any)?.readNotifications || []),
    ...localReadIds
  ]));

  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await notificationAPI.getAll();
      const data = res.data.map((n: any) => ({ ...n, id: n._id }));
      setAnnouncements(data);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
    // In a real production app we'd use WebSockets or React Query polling.
    // For now we fetch once on mount.
    const interval = setInterval(fetchAnnouncements, 30000); // Polling every 30s as a fallback
    return () => clearInterval(interval);
  }, [fetchAnnouncements]);

  const markRead = async (id: string) => {
    if (readIds.includes(id)) return;
    
    // Optimistic update
    setLocalReadIds(prev => [...prev, id]);
    
    try {
      await notificationAPI.markAsRead(id);
    } catch (error) {
      console.error('Failed to mark read:', error);
      // Revert optimistic update on failure
      setLocalReadIds(prev => prev.filter(i => i !== id));
    }
  };

  const markAllRead = async () => {
    const allIds = announcements.map(a => a.id);
    setLocalReadIds(prev => Array.from(new Set([...prev, ...allIds])));

    try {
      await notificationAPI.markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all read:', error);
    }
  };

  const unreadCount = announcements.filter((a) => !readIds.includes(a.id)).length;

  const pinnedUnread = announcements
    .filter((a) => a.pinned && !readIds.includes(a.id))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return { announcements, readIds, markRead, markAllRead, unreadCount, pinnedUnread, refresh: fetchAnnouncements };
}

// ─── Admin hook (full CRUD) ───────────────────────────────────────────────────

export function useAdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await notificationAPI.getAll();
      const data = res.data.map((n: any) => ({ ...n, id: n._id }));
      setAnnouncements(data);
    } catch (error) {
      console.error('Failed to fetch admin announcements:', error);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const createAnnouncement = async (data: Partial<Announcement>) => {
    try {
      await notificationAPI.create(data);
      fetchAnnouncements();
    } catch (error) {
      console.error('Failed to create announcement:', error);
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      await notificationAPI.delete(id);
      fetchAnnouncements();
    } catch (error) {
      console.error('Failed to delete announcement:', error);
    }
  };

  const updateAnnouncement = async (id: string, data: Partial<Announcement>) => {
    try {
      await notificationAPI.update(id, data);
      fetchAnnouncements();
    } catch (error) {
      console.error('Failed to update announcement:', error);
    }
  };

  return { announcements, createAnnouncement, deleteAnnouncement, updateAnnouncement, refresh: fetchAnnouncements };
}
