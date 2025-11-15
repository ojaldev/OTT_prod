import { TOKEN_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from './constants';
import logger from './logger';

// Cookie management functions
const setCookie = (name: string, value: string, days: number = 1): void => {
  try {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/;SameSite=Strict;Secure`;
  } catch (error) {
    logger.error(`Error setting cookie ${name}:`, error);
  }
};

const getCookie = (name: string): string | null => {
  try {
    const nameEQ = `${name}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  } catch (error) {
    logger.error(`Error getting cookie ${name}:`, error);
    return null;
  }
};

const removeCookie = (name: string): void => {
  try {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Strict`;
  } catch (error) {
    logger.error(`Error removing cookie ${name}:`, error);
  }
};

// Token management with cookies
export const getStoredToken = (): string | null => {
  try {
    // Try cookie first
    const cookieToken = getCookie(TOKEN_STORAGE_KEY);
    if (cookieToken) return cookieToken;
    
    // Fall back to localStorage for backward compatibility
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch (error) {
    logger.error('Error getting stored token:', error);
    return null;
  }
};

export const setStoredToken = (token: string): void => {
  try {
    // Store in both cookie and localStorage
    setCookie(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch (error) {
    logger.error('Error setting stored token:', error);
  }
};

export const removeStoredToken = (): void => {
  try {
    // Remove from both cookie and localStorage
    removeCookie(TOKEN_STORAGE_KEY);
    removeCookie(REFRESH_TOKEN_STORAGE_KEY);
    removeCookie(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch (error) {
    logger.error('Error removing stored token:', error);
  }
};

export const getStoredRefreshToken = (): string | null => {
  try {
    // Try cookie first
    const cookieToken = getCookie(REFRESH_TOKEN_STORAGE_KEY);
    if (cookieToken) return cookieToken;
    
    // Fall back to localStorage for backward compatibility
    return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  } catch (error) {
    logger.error('Error getting stored refresh token:', error);
    return null;
  }
};

export const setStoredRefreshToken = (token: string): void => {
  try {
    // Store in both cookie and localStorage
    setCookie(REFRESH_TOKEN_STORAGE_KEY, token, 7); // Refresh token lasts longer
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, token);
  } catch (error) {
    logger.error('Error setting stored refresh token:', error);
  }
};

export const getStoredData = <T>(key: string): T | null => {
  try {
    // Try cookie first
    const cookieData = getCookie(key);
    if (cookieData) {
      return JSON.parse(cookieData) as T;
    }
    
    // Fall back to localStorage
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    logger.error(`Error getting stored data for key ${key}:`, error);
    return null;
  }
};

export const setStoredData = <T>(key: string, data: T): void => {
  try {
    const jsonData = JSON.stringify(data);
    // Store in both cookie and localStorage
    setCookie(key, jsonData);
    localStorage.setItem(key, jsonData);
  } catch (error) {
    logger.error(`Error setting stored data for key ${key}:`, error);
  }
};

export const removeStoredData = (key: string): void => {
  try {
    // Remove from both cookie and localStorage
    removeCookie(key);
    localStorage.removeItem(key);
  } catch (error) {
    logger.error(`Error removing stored data for key ${key}:`, error);
  }
};

// User-specific storage functions
export const getStoredUser = () => {
  return getStoredData(USER_STORAGE_KEY);
};

export const setStoredUser = (userData: any) => {
  setStoredData(USER_STORAGE_KEY, userData);
};

export const removeStoredUser = () => {
  removeStoredData(USER_STORAGE_KEY);
};
