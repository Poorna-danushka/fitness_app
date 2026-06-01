import apiClient from './apiClient';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    subscriptionStatus?: string;
    isEmailVerified?: boolean;
  };
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  weight?: number;
  height?: number;
  isEmailVerified?: boolean;
  subscriptionStatus?: string;
  createdAt?: string;
}

/**
 * Register new user
 */
export const registerUser = (data: RegisterRequest): Promise<AuthResponse> => {
  return apiClient.post('/auth/register', data);
};

/**
 * Login user
 */
export const loginUser = (data: LoginRequest): Promise<AuthResponse> => {
  return apiClient.post('/auth/login', data);
};

/**
 * Verify email
 */
export const verifyEmail = (token: string): Promise<any> => {
  return apiClient.post('/auth/verify-email', { token });
};

/**
 * Get current user
 */
export const getCurrentUser = (): Promise<{ success: boolean; user: User }> => {
  return apiClient.get('/auth/me');
};

/**
 * Update profile
 */
export const updateProfile = (data: Partial<User>): Promise<AuthResponse> => {
  return apiClient.put('/auth/profile', data);
};

/**
 * Logout user
 */
export const logoutUser = (): Promise<any> => {
  return apiClient.post('/auth/logout', {});
};

/**
 * Refresh access token
 */
export const refreshAccessToken = (refreshToken: string): Promise<{ accessToken: string }> => {
  return apiClient.post('/auth/refresh', { refreshToken });
};
