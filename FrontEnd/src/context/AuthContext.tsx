import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, AuthState, AuthAction, RegisterData } from '../types/User';
import { authService } from '../services/auth';
import { 
  getStoredToken, 
  removeStoredToken, 
  setStoredToken, 
  getStoredRefreshToken, 
  setStoredRefreshToken,
  getStoredUser,
  setStoredUser,
  removeStoredUser
} from '../utils/storage';
import logger from '../utils/logger';

interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        user: action.payload.user, 
        token: action.payload.token,
        isAuthenticated: true 
      };
    case 'LOGIN_FAILURE':
      return { 
        ...state, 
        loading: false, 
        error: action.payload, 
        user: null, 
        token: null,
        isAuthenticated: false 
      };
    case 'LOGOUT':
      return { 
        loading: false, 
        user: null, 
        token: null, 
        isAuthenticated: false, 
        error: null 
      };
    case 'UPDATE_USER':
      return { 
        ...state, 
        user: state.user ? { ...state.user, ...action.payload } : null 
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true, // Start with loading true to prevent flash of login page
  error: null
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = getStoredToken();
      const refreshToken = getStoredRefreshToken();
      const storedUser = getStoredUser();
      
      logger.info('Initializing auth from cookies/storage');
      
      if (token && storedUser) {
        // We have both token and user data in cookies/storage
        // No need to verify with backend, just use the stored data
        logger.info('Found valid token and user data in cookies/storage');
        dispatch({ 
          type: 'LOGIN_SUCCESS', 
          payload: { user: storedUser as User, token } 
        });
      } else if (token && !storedUser) {
        // We have a token but no user data, need to verify with backend
        try {
          logger.info('Found token but no user data, verifying with backend');
          // Only call backend if we don't have user data stored locally
          await verifyToken(token);
        } catch (error) {
          // If token verification fails and we have a refresh token, try to refresh
          if (refreshToken) {
            try {
              logger.info('Token verification failed, attempting to refresh token');
              await refreshAccessToken(refreshToken);
            } catch (refreshError) {
              // If refresh fails too, clear tokens and redirect to login
              logger.error('Token refresh failed', refreshError);
              dispatch({ type: 'LOGIN_FAILURE', payload: 'Authentication failed' });
              removeStoredToken();
            }
          } else {
            // No refresh token available
            logger.error('No valid authentication');
            dispatch({ type: 'LOGIN_FAILURE', payload: 'No valid authentication' });
            removeStoredToken();
          }
        }
      } else if (refreshToken) {
        // No access token but we have a refresh token
        try {
          logger.info('No access token found, attempting to refresh with stored refresh token');
          await refreshAccessToken(refreshToken);
        } catch (error) {
          logger.error('Token refresh failed', error);
          dispatch({ type: 'LOGIN_FAILURE', payload: 'Authentication failed' });
          removeStoredToken();
        }
      } else {
        // No tokens at all
        logger.info('No authentication tokens found');
        dispatch({ type: 'LOGIN_FAILURE', payload: 'Your session has expired. Please log in again.' });
      }
    };
    
    initializeAuth();
  }, []);

  const verifyToken = async (token: string) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      const user = await authService.verifyToken(token);
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { user, token } 
      });
    } catch (error) {
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: 'Token verification failed' 
      });
      removeStoredToken();
      throw error; // Rethrow to allow handling in the caller
    }
  };
  
  const refreshAccessToken = async (refreshToken: string) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      const response = await authService.refreshToken(refreshToken);
      const { user, token, refreshToken: newRefreshToken } = response;
      
      // Store the new tokens
      setStoredToken(token);
      if (newRefreshToken) {
        setStoredRefreshToken(newRefreshToken);
      }
      
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { user, token } 
      });
    } catch (error) {
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: 'Token refresh failed' 
      });
      removeStoredToken();
      throw error; // Rethrow to allow handling in the caller
    }
  };

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      const response = await authService.login(email, password);
      const { user, token, refreshToken } = response;
      
      // Store tokens and user data in cookies
      setStoredToken(token);
      if (refreshToken) {
        setStoredRefreshToken(refreshToken);
      }
      
      // Store user data in cookies for future authentication checks
      setStoredUser(user);
      
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { user, token } 
      });
    } catch (error) {
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: error instanceof Error ? error.message : 'Login failed' 
      });
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      const response = await authService.register(userData);
      // Extract user, token and refreshToken from the response
      const { user, token, refreshToken } = response;
      
      // Store tokens and user data in cookies
      setStoredToken(token);
      if (refreshToken) {
        setStoredRefreshToken(refreshToken);
      }
      
      // Store user data in cookies for future authentication checks
      setStoredUser(user);
      
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { user, token } 
      });
    } catch (error) {
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: error instanceof Error ? error.message : 'Registration failed' 
      });
      throw error;
    }
  };

  const logout = () => {
    // Remove all stored authentication data from cookies and localStorage
    removeStoredToken();
    removeStoredUser();
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (userData: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const value: AuthContextType = {
    state,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
