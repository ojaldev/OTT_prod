import { apiService } from './api';
import { User, RegisterData } from '../types/User';
import { ApiResponse } from '../types/Api';
import { API_ENDPOINTS } from '../utils/constants';
import { 
  getStoredToken, 
  setStoredToken, 
  removeStoredToken, 
  setStoredRefreshToken,
  getStoredUser,
  setStoredUser,
  removeStoredUser
} from '../utils/storage';
import logger from '../utils/logger';

interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

class AuthService {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response: ApiResponse<AuthResponse> = await apiService.post(
      API_ENDPOINTS.AUTH.LOGIN,
      { email, password }
    );
    
    // Store auth data in cookies and localStorage
    const { user, token, refreshToken } = response.data;
    setStoredToken(token);
    setStoredRefreshToken(refreshToken);
    setStoredUser(user);
    
    return response.data;
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    // Create a new object with only the fields required by the API
    const apiData = {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      role: userData.role || 'user' // Default to 'user' if not specified
    };
    
    const response: ApiResponse<AuthResponse> = await apiService.post(
      API_ENDPOINTS.AUTH.REGISTER,
      apiData
    );
    
    // Store auth data in cookies and localStorage
    const { user, token, refreshToken } = response.data;
    setStoredToken(token);
    setStoredRefreshToken(refreshToken);
    setStoredUser(user);
    
    return response.data;
  }

  async verifyToken(_token: string): Promise<User> {
    const response: ApiResponse<{ user: User }> = await apiService.get(
      API_ENDPOINTS.AUTH.VERIFY_TOKEN
    );
    return response.data.user;
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response: ApiResponse<AuthResponse> = await apiService.post(
      API_ENDPOINTS.AUTH.REFRESH_TOKEN,
      { refreshToken }
    );
    
    // Update stored tokens and user data
    const { user, token, refreshToken: newRefreshToken } = response.data;
    setStoredToken(token);
    setStoredRefreshToken(newRefreshToken);
    setStoredUser(user);
    
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiService.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      currentPassword,
      newPassword
    });
  }

  // Local authentication verification methods
  isAuthenticated(): boolean {
    const token = getStoredToken();
    return !!token;
  }

  getCurrentUser(): User | null {
    return getStoredUser() as User | null;
  }

  // This method can be used to verify the token with the backend if needed
  async verifyAuthentication(): Promise<boolean> {
    try {
      const token = getStoredToken();
      if (!token) return false;
      
      // First check if we have a user in storage
      const storedUser = this.getCurrentUser();
      if (storedUser) return true;
      
      // If no stored user, verify with backend
      const user = await this.verifyToken(token);
      if (user) {
        // Store the user data for future use
        setStoredUser(user);
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Error verifying authentication:', error);
      return false;
    }
  }

  logout(): void {
    // Remove all stored auth data
    removeStoredToken();
    removeStoredUser();
    
    logger.info('User logged out successfully');
  }
}

export const authService = new AuthService();
