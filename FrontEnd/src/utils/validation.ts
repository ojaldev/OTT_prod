import { Content } from '../types/Content';

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateContentData = (data: Partial<Content>): {
  isValid: boolean;
  errors: Record<string, string>;
} => {
  const errors: Record<string, string> = {};
  
  if (!data.platform?.trim()) {
    errors.platform = 'Platform is required';
  }
  
  if (!data.title?.trim()) {
    errors.title = 'Title is required';
  }
  
  if (!data.primaryLanguage?.trim()) {
    errors.primaryLanguage = 'Primary language is required';
  }
  
  if (!data.year || data.year < 1900 || data.year > 2030) {
    errors.year = 'Year must be between 1900 and 2030';
  }
  
  if (data.seasons && data.seasons < 0) {
    errors.seasons = 'Seasons cannot be negative';
  }
  
  if (data.episodes && data.episodes < 0) {
    errors.episodes = 'Episodes cannot be negative';
  }
  
  if (data.durationHours && data.durationHours < 0) {
    errors.durationHours = 'Duration cannot be negative';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const sanitizeInput = (input: string): string => {
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/javascript:/gi, '')
              .trim();
};
