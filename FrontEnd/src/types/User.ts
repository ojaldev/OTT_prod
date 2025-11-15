export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword?: string; // Only used for form validation, not sent to API
  role?: 'user' | 'admin'; // Optional, defaults to "user"
}

export interface LoginData {
  email: string;
  password: string;
  // Optional UI-only flag; not sent to API directly
  remember?: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'CLEAR_ERROR' };

// User Management Types
export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'user' | 'admin';
  isActive?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
  createdAfter?: string;
  createdBefore?: string;
  lastLoginAfter?: string;
  lastLoginBefore?: string;
}

export interface UserListResponse {
  users?: User[];
  docs?: User[];
  total?: number;
  totalDocs?: number;
  page: number;
  limit: number;
  totalPages: number;
  pagingCounter?: number;
  hasPrevPage?: boolean;
  hasNextPage?: boolean;
  prevPage?: number | null;
  nextPage?: number | null;
}

export interface UserActivity {
  _id: string;
  user: {
    _id: string;
    username: string;
    email: string;
    role: string;
  };
  action: string;
  details: {
    ip: string;
    userAgent: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface UserActivityFilters {
  userId?: string;
  page?: number;
  limit?: number;
  action?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
}

export interface UserActivityResponse {
  activities?: UserActivity[];
  docs?: UserActivity[];
  total?: number;
  totalDocs?: number;
  page: number;
  limit: number;
  totalPages: number;
  pagingCounter?: number;
  hasPrevPage?: boolean;
  hasNextPage?: boolean;
  prevPage?: number | null;
  nextPage?: number | null;
}

export interface BulkUserOperation {
  userIds: string[];
  role?: 'user' | 'admin';
  setActive?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface BulkOperationResponse {
  matched: number;
  modified: number;
  message: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    refreshToken: string;
  };
}
