import { useCallback } from 'react';
import { useUIStore } from '../stores/uiStore';

/**
 * Hook for displaying notifications
 */
export const useNotification = () => {
  const { addNotification } = useUIStore();

  const success = useCallback(
    (message: string) => addNotification(message, 'success'),
    [addNotification]
  );

  const error = useCallback(
    (message: string) => addNotification(message, 'error'),
    [addNotification]
  );

  const info = useCallback(
    (message: string) => addNotification(message, 'info'),
    [addNotification]
  );

  const warning = useCallback(
    (message: string) => addNotification(message, 'warning'),
    [addNotification]
  );

  return { success, error, info, warning };
};

/**
 * Hook for theme management
 */
export const useTheme = () => {
  const { theme, setTheme, toggleTheme } = useUIStore();

  const isDark = theme === 'dark';

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme,
  };
};

/**
 * Hook for sidebar management
 */
export const useSidebar = () => {
  const { sidebarOpen, setSidebarOpen, toggleSidebar } = useUIStore();

  return {
    isOpen: sidebarOpen,
    setOpen: setSidebarOpen,
    toggle: toggleSidebar,
  };
};
