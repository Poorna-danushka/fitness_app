import axios, { AxiosInstance, AxiosError } from 'axios';
import { getToken, getRefreshToken, clearAuthStorage } from '../utils/security';

const API_URL = (import.meta.env.REACT_APP_API_URL as string) || 'http://localhost:5000/api/v1';

class APIService {
  private client: AxiosInstance;
  private refreshTokenPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add token
    this.client.interceptors.request.use((config) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && originalRequest) {
          const refreshToken = getRefreshToken();

          if (refreshToken && !this.refreshTokenPromise) {
            this.refreshTokenPromise = this.refreshAccessToken(refreshToken)
              .then(async (newToken) => {
                // Store new token
                const { storeToken } = await import('../utils/security');
                storeToken(newToken, refreshToken);
                return newToken;
              })
              .catch(() => {
                clearAuthStorage();
                window.location.href = '/login';
                return '';
              })
              .finally(() => {
                this.refreshTokenPromise = null;
              });
          }

          if (this.refreshTokenPromise) {
            const newToken = await this.refreshTokenPromise;
            if (newToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.client(originalRequest);
            }
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshAccessToken(refreshToken: string): Promise<string> {
    const response = await axios.post(`${API_URL}/auth/refresh`, {
      refreshToken,
    });
    return response.data.accessToken;
  }

  /**
   * Get request
   */
  async get<T = any>(url: string, params?: any): Promise<T> {
    try {
      const response = await this.client.get<T>(url, { params });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Post request
   */
  async post<T = any>(url: string, data?: any): Promise<T> {
    try {
      const response = await this.client.post<T>(url, data);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Put request
   */
  async put<T = any>(url: string, data?: any): Promise<T> {
    try {
      const response = await this.client.put<T>(url, data);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Delete request
   */
  async delete<T = any>(url: string): Promise<T> {
    try {
      const response = await this.client.delete<T>(url);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Handle errors
   */
  private handleError(error: any): void {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.status, error.response?.data);
    } else {
      console.error('Error:', error);
    }
  }
}

export default new APIService();
