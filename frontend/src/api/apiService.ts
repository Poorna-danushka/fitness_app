import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getToken, clearAuthStorage } from '../utils/security';

// ─── Axios instance ───────────────────────────────────────────────────────────

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // CSRF protection hint for servers
  },
});

// ─── Request interceptor: attach token + security headers ─────────────────────

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Strip any Authorization header for cross-origin requests (avoid leaking tokens)
    if (config.url && config.url.startsWith('http') && !config.url.startsWith(API_BASE_URL)) {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: unified error handling ─────────────────────────────

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — wipe auth and redirect
      clearAuthStorage();
      window.dispatchEvent(new CustomEvent('auth:expired'));
      // Only redirect if not already on auth pages
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login?reason=session_expired';
      }
    }

    if (error.response?.status === 403) {
      window.dispatchEvent(new CustomEvent('auth:forbidden'));
    }

    if (error.response?.status === 429) {
      window.dispatchEvent(
        new CustomEvent('auth:ratelimit', {
          detail: { retryAfter: error.response.headers['retry-after'] },
        })
      );
    }

    // Sanitize error message before returning (prevent reflection of server errors with HTML)
    const serverMsg = (error.response?.data as any)?.message;
    const safeMsg = typeof serverMsg === 'string' ? serverMsg.replace(/<[^>]*>/g, '') : null;

    return Promise.reject({
      ...error,
      safeMessage: safeMsg || getDefaultErrorMessage(error.response?.status),
    });
  }
);

function getDefaultErrorMessage(status?: number): string {
  switch (status) {
    case 400: return 'Invalid request. Please check your input.';
    case 401: return 'Your session has expired. Please log in again.';
    case 403: return 'You do not have permission to perform this action.';
    case 404: return 'The requested resource was not found.';
    case 409: return 'A conflict occurred. This resource may already exist.';
    case 422: return 'Validation failed. Please check your input.';
    case 429: return 'Too many requests. Please wait a moment and try again.';
    case 500: return 'A server error occurred. Please try again later.';
    default:  return 'An unexpected error occurred. Please try again.';
  }
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authAPI = {
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: { name?: string; weight?: number; height?: number }) =>
    api.put('/auth/profile', data),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/auth/change-password', { currentPassword, newPassword }),
  requestPasswordReset: (email: string) =>
    api.post('/auth/forgot-password', { email }),
};

// ─── Exercise API ─────────────────────────────────────────────────────────────

export const exerciseAPI = {
  getAll: () => api.get('/exercises'),
  getById: (id: string) => api.get(`/exercises/${id}`),
  create: (data: unknown) => api.post('/exercises', data),
  update: (id: string, data: unknown) => api.put(`/exercises/${id}`, data),
  delete: (id: string) => api.delete(`/exercises/${id}`),
};

// ─── Package API ──────────────────────────────────────────────────────────────

export const packageAPI = {
  getAll: () => api.get('/packages'),
  getById: (id: string) => api.get(`/packages/${id}`),
  create: (data: unknown) => api.post('/packages', data),
  update: (id: string, data: unknown) => api.put(`/packages/${id}`, data),
  delete: (id: string) => api.delete(`/packages/${id}`),
  
  // Exercise management
  getExercises: (packageId: string) => api.get(`/packages/${packageId}/exercises`),
  addExercise: (packageId: string, data: unknown) => api.post(`/packages/${packageId}/exercises`, data),
  updateExercise: (packageId: string, exerciseId: string, data: unknown) => 
    api.put(`/packages/${packageId}/exercises/${exerciseId}`, data),
  removeExercise: (packageId: string, exerciseId: string) => 
    api.delete(`/packages/${packageId}/exercises/${exerciseId}`),
  reorderExercises: (packageId: string, data: unknown) => 
    api.put(`/packages/${packageId}/exercises/reorder`, data),
};

// ─── Purchase API ─────────────────────────────────────────────────────────────

export const purchaseAPI = {
  getAll: () => api.get('/purchases'),
  getMy: () => api.get('/purchases/my-purchases'),
  create: (packageId: string, price: number) =>
    api.post('/purchases', { packageId, price }),
  createWithPayment: (packageId: string, paymentIntentId: string) =>
    api.post('/purchases/payment', { packageId, paymentIntentId }),
  updateStatus: (id: string, status: string) =>
    api.put(`/purchases/${id}/status`, { status }),
};

// ─── Payment API ──────────────────────────────────────────────────────────────

export const paymentAPI = {
  createPaymentIntent: (packageId: string, amount: number) =>
    api.post('/payments/intent', { packageId, amount }),
  confirmPayment: (paymentIntentId: string) =>
    api.post('/payments/confirm', { paymentIntentId }),
  getHistory: () => api.get('/payments/history'),
  refund: (paymentIntentId: string) =>
    api.post('/payments/refund', { paymentIntentId }),
};

// ─── Completed Exercise API ───────────────────────────────────────────────────

export const completedExerciseAPI = {
  markComplete: (exerciseId: string) =>
    api.post('/completed-exercises', { exerciseId }),
  getMy: () => api.get('/completed-exercises/my-completed'),
};

// ─── User API (Admin) ─────────────────────────────────────────────────────────

export const userAPI = {
  getAll: () => api.get('/users'),
};

// ─── Admin API ────────────────────────────────────────────────────────────────

export const adminAPI = {
  getAllUsers: () => api.get('/users'),
  updateUserRole: (id: string, role: string) =>
    api.put(`/users/${id}/role`, { role }),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
  getAllPackages: () => api.get('/packages'),
  getAllPurchases: () => api.get('/purchases'),
  getAllExercises: () => api.get('/exercises'),
  createPackage: (data: unknown) => api.post('/packages', data),
  updatePackage: (id: string, data: unknown) => api.put(`/packages/${id}`, data),
  deletePackage: (id: string) => api.delete(`/packages/${id}`),
  createExercise: (data: unknown) => api.post('/exercises', data),
  updateExercise: (id: string, data: unknown) => api.put(`/exercises/${id}`, data),
  deleteExercise: (id: string) => api.delete(`/exercises/${id}`),
  getPaymentStats: () => api.get('/payments/stats'),
};

// ─── Workout API ──────────────────────────────────────────────────────────────

export const workoutAPI = {
  getAll: () => api.get('/workouts'),
  getById: (id: string) => api.get(`/workouts/${id}`),
  create: (data: {
    exerciseId: string;
    duration: number;
    sets?: number | null;
    reps?: number | null;
    date: string;
    difficulty?: string | null; // beginner | intermediate | advanced
  }) => api.post('/workouts', data),
  update: (id: string, data: unknown) => api.put(`/workouts/${id}`, data),
  delete: (id: string) => api.delete(`/workouts/${id}`),
  getMy: () => api.get('/workouts/my-workouts'),
};

// ─── Notification API ───────────────────────────────────────────────────────────

export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  create: (data: unknown) => api.post('/notifications', data),
  update: (id: string, data: unknown) => api.put(`/notifications/${id}`, data),
  delete: (id: string) => api.delete(`/notifications/${id}`),
  markAsRead: (id: string) => api.post(`/notifications/${id}/read`),
  markAllAsRead: () => api.post('/notifications/read-all'),
};

export default api;
