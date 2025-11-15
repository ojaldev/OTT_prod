export interface Content {
  _id: string;
  platform: string;
  title: string;
  selfDeclaredGenre?: string;
  assignedGenre?: string;
  primaryLanguage: string;
  selfDeclaredFormat?: string;
  assignedFormat?: string;
  year: number;
  releaseDate?: Date;
  seasons?: number;
  episodes?: number;
  durationHours?: number;
  source?: string;
  sourceFlags: {
    inHouse: boolean;
    commissioned: boolean;
    coProduction: boolean;
  };
  dubbing: {
    tamil: boolean;
    telugu: boolean;
    kannada: boolean;
    malayalam: boolean;
    hindi: boolean;
    punjabi: boolean;
    bengali: boolean;
    marathi: boolean;
    bhojpuri: boolean;
    gujarati: boolean;
    english: boolean;
    haryanvi: boolean;
    rajasthani: boolean;
    deccani: boolean;
    arabic: boolean;
  };
  totalDubbings: number;
  ageRating: string;
  createdBy: string | User;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentFilters {
  platform?: string;
  genre?: string;
  language?: string;
  year?: string;
  search?: string;
  ageRating?: string;
  source?: string;
}

export interface CreateContentData extends Omit<Content, '_id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'totalDubbings'> {}

export interface UpdateContentData extends Partial<CreateContentData> {}

export interface DataState {
  content: Content[];
  filters: ContentFilters;
  loading: boolean;
  error: string | null;
}

export type DataAction =
  | { type: 'SET_CONTENT'; payload: Content[] }
  | { type: 'ADD_CONTENT'; payload: Content }
  | { type: 'UPDATE_CONTENT'; payload: { id: string; data: Partial<Content> } }
  | { type: 'DELETE_CONTENT'; payload: string }
  | { type: 'SET_FILTERS'; payload: Partial<ContentFilters> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

import { User } from './User';
