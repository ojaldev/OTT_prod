import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Content, ContentFilters, DataState, DataAction } from '../types/Content';

interface DataContextType {
  state: DataState;
  setContent: (content: Content[]) => void;
  addContent: (content: Content) => void;
  updateContent: (id: string, content: Partial<Content>) => void;
  deleteContent: (id: string) => void;
  setFilters: (filters: Partial<ContentFilters>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const dataReducer = (state: DataState, action: DataAction): DataState => {
  switch (action.type) {
    case 'SET_CONTENT':
      return { ...state, content: action.payload };
    case 'ADD_CONTENT':
      return { ...state, content: [...state.content, action.payload] };
    case 'UPDATE_CONTENT':
      return {
        ...state,
        content: state.content.map(item =>
          item._id === action.payload.id
            ? { ...item, ...action.payload.data }
            : item
        )
      };
    case 'DELETE_CONTENT':
      return {
        ...state,
        content: state.content.filter(item => item._id !== action.payload)
      };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

const initialState: DataState = {
  content: [],
  filters: {
    platform: '',
    genre: '',
    language: '',
    year: '',
    search: ''
  },
  loading: false,
  error: null
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  const setContent = (content: Content[]) => {
    dispatch({ type: 'SET_CONTENT', payload: content });
  };

  const addContent = (content: Content) => {
    dispatch({ type: 'ADD_CONTENT', payload: content });
  };

  const updateContent = (id: string, data: Partial<Content>) => {
    dispatch({ type: 'UPDATE_CONTENT', payload: { id, data } });
  };

  const deleteContent = (id: string) => {
    dispatch({ type: 'DELETE_CONTENT', payload: id });
  };

  const setFilters = (filters: Partial<ContentFilters>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const value: DataContextType = {
    state,
    setContent,
    addContent,
    updateContent,
    deleteContent,
    setFilters,
    setLoading,
    setError
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
