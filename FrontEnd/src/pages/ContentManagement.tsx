import React, { useState, useEffect } from 'react';
import { Plus, Download } from 'lucide-react';
import { useData } from '../context/DataContext';
import { contentService } from '../services/content';
import { Content, CreateContentData } from '../types/Content';
import { TableColumn } from '../types/Common';
import FilterPanel from '../components/dashboard/FilterPanel';
import DataTable from '../components/dashboard/DataTable';
import Pagination from '../components/common/Pagination';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import ContentForm from '../components/admin/ContentForm';
import { formatDate } from '../utils/formatting';

const ContentManagement: React.FC = () => {
  const { state, setContent, addContent, updateContent, deleteContent, setLoading, setError } = useData();
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadContent();
  }, [state.filters, currentPage]);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await contentService.getContent(state.filters, currentPage, 20);
      setContent(response.data.docs);
      setTotalPages(response.data.totalPages);
      setTotalItems(response.data.totalDocs);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContent = async (data: CreateContentData) => {
    try {
      setLoading(true);
      const response = await contentService.createContent(data);
      addContent(response.data);
      setIsFormModalOpen(false);
      setEditingContent(undefined);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create content');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateContent = async (data: CreateContentData) => {
    if (!editingContent) return;
    
    try {
      setError(null);
      setLoading(true);
      const response = await contentService.updateContent(editingContent._id, data);
      const updated = (response as any)?.data ?? response;
      if ((response as any)?.success === false) {
        throw new Error((response as any)?.message || 'Failed to update content');
      }
      updateContent(editingContent._id, updated);
      setIsFormModalOpen(false);
      setEditingContent(undefined);
    } catch (error) {
      const message = (error as any)?.message || 'Failed to update content';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContent = async (content: Content) => {
    if (!confirm(`Are you sure you want to delete "${content.title}"?`)) return;
    
    try {
      setIsDeleting(content._id);
      await contentService.deleteContent(content._id);
      deleteContent(content._id);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete content');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleExportCSV = async () => {
    try {
      const blob = await contentService.exportCSV(state.filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `content-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to export CSV');
    }
  };

  const columns: TableColumn<Content>[] = [
    { key: 'title', label: 'Title', width: '25%' },
    { key: 'platform', label: 'Platform', width: '15%' },
    { key: 'assignedGenre', label: 'Genre', width: '12%' },
    { key: 'primaryLanguage', label: 'Language', width: '12%' },
    { key: 'year', label: 'Year', width: '8%' },
    { 
      key: 'totalDubbings', 
      label: 'Dubbings', 
      width: '10%',
      render: (value) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
          {value || 0}
        </span>
      )
    },
    { 
      key: 'createdAt', 
      label: 'Created', 
      width: '12%',
      render: (value) => formatDate(value, 'MMM dd, yyyy')
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Content Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage and organize OTT content</p>
        </div>
        
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </Button>
          
          <Button
            onClick={() => setIsFormModalOpen(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Content</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <FilterPanel />

      {/* Error Display */}
      {state.error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <p className="text-red-600 dark:text-red-400">{state.error}</p>
        </div>
      )}

      {/* Content Table */}
      <DataTable
        data={state.content}
        columns={columns}
        onEdit={(content) => {
          setEditingContent(content);
          setIsFormModalOpen(true);
        }}
        onDelete={handleDeleteContent}
        loading={state.loading}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Content Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingContent(undefined);
        }}
        title={editingContent ? 'Edit Content' : 'Add New Content'}
        size="xl"
      >
        <ContentForm
          content={editingContent}
          onSubmit={editingContent ? handleUpdateContent : handleCreateContent}
          onCancel={() => {
            setIsFormModalOpen(false);
            setEditingContent(undefined);
          }}
          loading={state.loading}
        />
      </Modal>
    </div>
  );
};

export default ContentManagement;
