import { apiService } from './api';
import logger from '../utils/logger';
import { 
  User, 
  UserFilters, 
  UserListResponse, 
  UserActivityFilters, 
  UserActivityResponse,
  BulkUserOperation,
  BulkOperationResponse,
  ApiResponse,
  RegisterData,
  RegisterResponse
} from '../types/User';

class UserService {
  private buildQueryParams(filters?: UserFilters): string {
    if (!filters) return '';
    
    const params = new URLSearchParams();
    
    // Add all filter parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    
    return params.toString();
  }

  async getUsers(filters?: UserFilters): Promise<{ data: UserListResponse }> {
    try {
      logger.info('UserService: Fetching users with filters', { filters });
      const queryParams = this.buildQueryParams(filters);
      const url = `/users${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await apiService.get<{ data: UserListResponse }>(url);
      return response;
    } catch (error) {
      logger.error('UserService: Error fetching users', { error });
      throw error;
    }
  }

  async getUserById(id: string): Promise<{ data: User }> {
    try {
      logger.info('UserService: Fetching user by ID', { id });
      const response = await apiService.get<{ data: User }>(`/users/${id}`);
      return response;
    } catch (error) {
      logger.error('UserService: Error fetching user by ID', { id, error });
      throw error;
    }
  }

  async getCurrentUserProfile(): Promise<{ data: User }> {
    try {
      logger.info('UserService: Fetching current user profile');
      const response = await apiService.get<{ data: User }>('/users/profile');
      return response;
    } catch (error) {
      logger.error('UserService: Error fetching current user profile', { error });
      throw error;
    }
  }

  async updateUserRole(id: string, role: 'user' | 'admin'): Promise<{ data: User }> {
    try {
      logger.info('UserService: Updating user role', { id, role });
      const response = await apiService.put<{ data: User }>(`/users/${id}/role`, { role });
      return response;
    } catch (error) {
      logger.error('UserService: Error updating user role', { id, role, error });
      throw error;
    }
  }

  async toggleUserStatus(id: string): Promise<{ data: User }> {
    try {
      logger.info('UserService: Toggling user status', { id });
      const response = await apiService.put<{ data: User }>(`/users/${id}/toggle-status`, {});
      return response;
    } catch (error) {
      logger.error('UserService: Error toggling user status', { id, error });
      throw error;
    }
  }

  async deleteUser(id: string): Promise<{ data: { message: string } }> {
    try {
      logger.info('UserService: Deleting user', { id });
      const response = await apiService.delete<{ data: { message: string } }>(`/users/${id}`);
      return response;
    } catch (error) {
      logger.error('UserService: Error deleting user', { id, error });
      throw error;
    }
  }

  async bulkUpdateRoles(data: BulkUserOperation): Promise<{ data: BulkOperationResponse }> {
    try {
      logger.info('UserService: Bulk updating user roles', { 
        userCount: data.userIds.length, 
        role: data.role 
      });
      const response = await apiService.put<{ data: BulkOperationResponse }>('/users/bulk/roles', data);
      return response;
    } catch (error) {
      logger.error('UserService: Error bulk updating user roles', { error });
      throw error;
    }
  }

  async bulkToggleStatus(data: BulkUserOperation): Promise<{ data: BulkOperationResponse }> {
    try {
      logger.info('UserService: Bulk toggling user status', { 
        userCount: data.userIds.length, 
        setActive: data.setActive 
      });
      const response = await apiService.put<{ data: BulkOperationResponse }>('/users/bulk/status', data);
      return response;
    } catch (error) {
      logger.error('UserService: Error bulk toggling user status', { error });
      throw error;
    }
  }

  async getUserActivities(
    userId: string, 
    filters?: UserActivityFilters
  ): Promise<{ data: UserActivityResponse }> {
    try {
      logger.info('UserService: Fetching user activities', { userId, filters });
      const queryParams = this.buildQueryParams(filters as any);
      const url = `/users/${userId}/activities${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await apiService.get<ApiResponse<UserActivityResponse>>(url);
      
      // Handle nested data structure from API
      if (response && typeof response === 'object' && 'data' in response && response.data) {
        // If the API returns a nested data object with the expected structure
        if ('docs' in response.data || 'activities' in response.data) {
          return { data: response.data as UserActivityResponse };
        }
      }
      
      // If the response has the expected API structure with nested data
      if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
        return { data: response.data as UserActivityResponse };
      }
      
      // Fallback for backward compatibility
      return { data: {} as UserActivityResponse };
    } catch (error) {
      logger.error('UserService: Error fetching user activities', { userId, error });
      throw error;
    }
  }

  async getAllActivities(
    filters?: UserActivityFilters
  ): Promise<{ data: UserActivityResponse }> {
    try {
      logger.info('UserService: Fetching all user activities', { filters });
      const queryParams = this.buildQueryParams(filters as any);
      const url = `/users/activities/all${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await apiService.get<ApiResponse<UserActivityResponse>>(url);
      
      // Handle nested data structure from API
      if (response && typeof response === 'object' && 'data' in response && response.data) {
        // If the API returns a nested data object with the expected structure
        if ('docs' in response.data || 'activities' in response.data) {
          return { data: response.data as UserActivityResponse };
        }
      }
      
      // If the response has the expected API structure with nested data
      if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
        return { data: response.data as UserActivityResponse };
      }
      
      // Fallback for backward compatibility
      return { data: {} as UserActivityResponse };
    } catch (error) {
      logger.error('UserService: Error fetching all user activities', { error });
      throw error;
    }
  }

  async register(userData: RegisterData): Promise<RegisterResponse> {
    try {
      logger.info('UserService: Registering new user', { username: userData.username, email: userData.email });
      // Try using the users endpoint for admin user creation instead of auth/register
      const response = await apiService.post<RegisterResponse>('/auth/register', userData);
      logger.debug('UserService: User created successfully');
      return response;
    } catch (error) {
      logger.error('UserService: Error creating user', { error });
      throw error;
    }
  }
}

export const userService = new UserService();
