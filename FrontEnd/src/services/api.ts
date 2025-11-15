import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { 
  getStoredToken, 
  setStoredToken, 
  removeStoredToken, 
  getStoredRefreshToken, 
  setStoredRefreshToken,
  setStoredUser
} from '../utils/storage';
import logger from '../utils/logger';
import { API_ENDPOINTS } from '../utils/constants';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = getStoredToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Log outgoing requests
        const method = config.method?.toUpperCase() || 'UNKNOWN';
        const url = config.url || 'UNKNOWN';
        logger.info(`API Request: ${method} ${url}`, { 
          method, 
          url, 
          params: config.params,
          // Don't log sensitive data like request body
        });
        
        // More detailed logging for debugging filters
        console.log(`🔍 API Request: ${method} ${url}`);
        console.log('Full URL:', config.baseURL + url);
        console.log('Query params:', config.params);
        if (url.includes('?')) {
          console.log('URL query string:', url.split('?')[1]);
        }
        
        return config;
      },
      (error) => {
        logger.error('API Request Error', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        const method = response.config.method?.toUpperCase() || 'UNKNOWN';
        const url = response.config.url || 'UNKNOWN';
        const status = response.status;
        
        logger.info(`API Response: ${method} ${url} ${status}`, {
          method,
          url,
          status,
          responseTime: response.headers['x-response-time'] || 'unknown',
        });
        
        return response.data;
      },
      async (error) => {
        const originalRequest = error.config;
        const config = error.config || {};
        const method = config.method?.toUpperCase() || 'UNKNOWN';
        const url = config.url || 'UNKNOWN';
        const status = error.response?.status || 'UNKNOWN';
        
        logger.error(`API Error: ${method} ${url} ${status}`, {
          method,
          url,
          status,
          error: error.response?.data || error.message
        });
        
        // Handle token expiration
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          // Try to refresh the token
          const refreshToken = getStoredRefreshToken();
          if (refreshToken) {
            try {
              logger.info('Attempting to refresh token');
              
              // Create a new axios instance to avoid interceptors loop
              const response = await axios.post(
                `${this.api.defaults.baseURL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`,
                { refreshToken }
              );
              
              const { token, refreshToken: newRefreshToken, user } = response.data;
              
              // Update stored tokens and user data in cookies
              setStoredToken(token);
              if (newRefreshToken) {
                setStoredRefreshToken(newRefreshToken);
              }
              
              // Store user data in cookie for future authentication checks
              if (user) {
                setStoredUser(user);
              }
              
              // Update the authorization header
              originalRequest.headers.Authorization = `Bearer ${token}`;
              
              // Retry the original request
              return this.api(originalRequest);
            } catch (refreshError) {
              logger.error('Token refresh failed', refreshError);
              removeStoredToken(); // This will remove all tokens and user data from cookies
              window.location.href = '/login';
              return Promise.reject(refreshError);
            }
          } else {
            // No refresh token available
            removeStoredToken(); // This will remove all tokens and user data from cookies
            window.location.href = '/login';
          }
        }
        
        return Promise.reject(error.response?.data || error.message);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.api.get(url, config);
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.api.post(url, data, config);
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.api.put(url, data, config);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.api.delete(url, config);
  }

  async upload<T>(url: string, formData: FormData): Promise<T> {
    return this.api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
}

export const apiService = new ApiService();
