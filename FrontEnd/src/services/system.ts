import { apiService } from './api';
import { API_ENDPOINTS } from '../utils/constants';

export interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number; // seconds
  environment: string;
  version: string;
  database: string;
  memory: {
    used: number; // GB
    total: number; // GB
  };
}

class SystemService {
  async getHealth(): Promise<HealthResponse> {
    return apiService.get(API_ENDPOINTS.SYSTEM.HEALTH);
  }
}

export const systemService = new SystemService();
