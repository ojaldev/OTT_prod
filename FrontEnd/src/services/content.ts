import { apiService } from './api';
import { Content, ContentFilters, CreateContentData, UpdateContentData } from '../types/Content';
import { ApiResponse, PaginatedResponse } from '../types/Api';
import { API_ENDPOINTS } from '../utils/constants';

interface ContentResponse {
  success: boolean;
  data: PaginatedResponse<Content>;
  message: string;
}

interface SingleContentResponse {
  success: boolean;
  data: Content;
  message: string;
}

class ContentService {
  async getContent(filters?: ContentFilters, page = 1, limit = 20): Promise<ContentResponse> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    return apiService.get(`${API_ENDPOINTS.CONTENT.BASE}?${params.toString()}`);
  }

  async getContentById(id: string): Promise<SingleContentResponse> {
    return apiService.get(`${API_ENDPOINTS.CONTENT.BASE}/${id}`);
  }

  async createContent(data: CreateContentData): Promise<SingleContentResponse> {
    return apiService.post(API_ENDPOINTS.CONTENT.BASE, data);
  }

  async updateContent(id: string, data: UpdateContentData): Promise<SingleContentResponse> {
    return apiService.put(`${API_ENDPOINTS.CONTENT.BASE}/${id}`, data);
  }

  async deleteContent(id: string): Promise<{ success: boolean; message: string }> {
    return apiService.delete(`${API_ENDPOINTS.CONTENT.BASE}/${id}`);
  }

  async importCSV(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('csvFile', file);
    return apiService.upload(API_ENDPOINTS.CONTENT.IMPORT_CSV, formData);
  }

  async exportCSV(filters?: ContentFilters): Promise<Blob> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }

    const response = await apiService.get<Blob>(`${API_ENDPOINTS.CONTENT.EXPORT_CSV}?${params.toString()}`, {
      responseType: 'blob'
    });
    
    // The response is already a Blob when responseType is 'blob'
    return response;
  }

  async checkDuplicate(platform: string, title: string, year: number): Promise<{ exists: boolean }> {
    return apiService.post(API_ENDPOINTS.CONTENT.CHECK_DUPLICATE, { platform, title, year });
  }

  async getCsvImportErrors(page = 1, limit = 100): Promise<ApiResponse<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    sessions: { startedAt: string; file: string }[];
    errors: Array<{
      row: number;
      error: string;
      data: Record<string, string>;
      sessionStartedAt: string;
      file: string;
    }>;
  }>> {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    return apiService.get(`${API_ENDPOINTS.CONTENT.IMPORT_CSV_ERRORS}?${params.toString()}`);
  }
}

export const contentService = new ContentService();
