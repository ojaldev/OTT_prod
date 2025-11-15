import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { BulkUserOperation } from '../../types/User';
import logger from '../../utils/logger';
import { useTheme } from '../../context/ThemeContext';

interface BulkActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: 'role' | 'status' | 'delete';
  userIds: string[];
  onConfirm: (data: BulkUserOperation) => Promise<void>;
}

const BulkActionModal: React.FC<BulkActionModalProps> = ({
  isOpen,
  onClose,
  actionType,
  userIds,
  onConfirm
}) => {
  const { theme } = useTheme();
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [setActive, setSetActive] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getActionTitle = () => {
    switch (actionType) {
      case 'role':
        return 'Change User Roles';
      case 'status':
        return 'Change User Status';
      case 'delete':
        return 'Delete Users';
      default:
        return 'Bulk Action';
    }
  };

  const getActionDescription = () => {
    switch (actionType) {
      case 'role':
        return `Change the role of ${userIds.length} selected users.`;
      case 'status':
        return `Change the status of ${userIds.length} selected users.`;
      case 'delete':
        return `Are you sure you want to delete ${userIds.length} selected users? This action cannot be undone.`;
      default:
        return '';
    }
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data: BulkUserOperation = { userIds };
      
      if (actionType === 'role') {
        data.role = role;
      } else if (actionType === 'status') {
        data.setActive = setActive;
      }
      
      logger.info('BulkActionModal: Confirming bulk action', { 
        actionType, 
        userCount: userIds.length,
        data 
      });
      
      await onConfirm(data);
      onClose();
    } catch (error) {
      logger.error('BulkActionModal: Error performing bulk action', { error });
      setError('Failed to perform action. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getActionTitle()}
      size="sm"
    >
      <div className="space-y-4">
        {error && (
          <div className={`px-4 py-3 rounded-md ${theme === 'dark' ? 'bg-red-900 border border-red-700 text-red-200' : 'bg-red-50 border border-red-200 text-red-700'}`}>
            {error}
          </div>
        )}
        
        <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{getActionDescription()}</p>
        
        {actionType === 'role' && (
          <div>
            <label htmlFor="role" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              New Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        )}
        
        {actionType === 'status' && (
          <div>
            <label htmlFor="status" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              New Status
            </label>
            <select
              id="status"
              value={setActive ? 'active' : 'inactive'}
              onChange={(e) => setSetActive(e.target.value === 'active')}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        )}
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleConfirm} 
            loading={loading}
            variant={actionType === 'delete' ? 'danger' : 'primary'}
          >
            {actionType === 'delete' ? 'Delete' : 'Confirm'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default BulkActionModal;
