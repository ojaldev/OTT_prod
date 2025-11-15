import React, { useState, useEffect } from 'react';
import { User, BulkUserOperation } from '../../types/User';
import { userService } from '../../services/user';
import UserTable from './UserTable';
import UserEditModal from './UserEditModal';
import BulkActionModal from './BulkActionModal';
import UserActivities from './UserActivities';
import Button from '../common/Button';
import { UserPlus } from 'lucide-react';
import logger from '../../utils/logger';
import { useTheme } from '../../context/ThemeContext';

const UserManagement: React.FC = () => {
  const { theme } = useTheme();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isActivitiesModalOpen, setIsActivitiesModalOpen] = useState(false);
  const [isBulkActionModalOpen, setIsBulkActionModalOpen] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<'role' | 'status' | 'delete'>('role');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // In a real implementation, this would fetch from an admin stats endpoint
      // For now, we'll use mock data
      setStats({
        totalUsers: 25,
        activeUsers: 22,
        adminUsers: 3
      });
    } catch (error) {
      logger.error('UserManagement: Error loading stats', { error });
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsEditModalOpen(true);
  };

  const handleSaveUser = async (userData: Partial<User> & { password?: string }) => {
    try {
      if (selectedUser) {
        // Update existing user
        logger.info('UserManagement: Updating user', { userId: selectedUser._id });
        // In a real implementation, this would call an update user endpoint
        // For now, we'll just log it
        logger.debug('UserManagement: User updated successfully', { userData });
      } else {
        // Create new user using the register API
        logger.info('UserManagement: Creating new user');
        
        if (!userData.password) {
          throw new Error('Password is required for new user creation');
        }
        
        // Prepare data for registration API
        const registerData = {
          username: userData.username || '',
          email: userData.email || '',
          password: userData.password,
          role: userData.role as 'user' | 'admin' || 'user',
          // Don't include action field as it's causing validation errors
        };
        
        // Call the register API
        await userService.register(registerData);
        logger.debug('UserManagement: User created successfully');
      }
      
      // Refresh stats after user changes
      loadStats();
    } catch (error) {
      logger.error('UserManagement: Error saving user', { error });
      throw error;
    }
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      logger.info('UserManagement: Deleting user', { userId: selectedUser._id });
      await userService.deleteUser(selectedUser._id);
      
      logger.debug('UserManagement: User deleted successfully');
      setIsDeleteConfirmOpen(false);
      
      // Refresh stats after user deletion
      loadStats();
    } catch (error) {
      logger.error('UserManagement: Error deleting user', { error });
      throw error;
    }
  };

  const handleViewActivities = (user: User) => {
    setSelectedUser(user);
    setIsActivitiesModalOpen(true);
  };

  const handleBulkAction = (action: 'role' | 'status' | 'delete', userIds: string[]) => {
    setBulkActionType(action);
    setSelectedUserIds(userIds);
    setIsBulkActionModalOpen(true);
  };

  const handleConfirmBulkAction = async (data: BulkUserOperation) => {
    try {
      switch (bulkActionType) {
        case 'role':
          logger.info('UserManagement: Performing bulk role update', { 
            userCount: data.userIds.length,
            role: data.role
          });
          await userService.bulkUpdateRoles(data);
          break;
        case 'status':
          logger.info('UserManagement: Performing bulk status update', { 
            userCount: data.userIds.length,
            setActive: data.setActive
          });
          await userService.bulkToggleStatus(data);
          break;
        case 'delete':
          logger.info('UserManagement: Performing bulk delete', { 
            userCount: data.userIds.length
          });
          // In a real implementation, this would call a bulk delete endpoint
          // For now, we'll just log it
          logger.debug('UserManagement: Users deleted successfully', { userIds: data.userIds });
          break;
      }
      
      // Refresh stats after bulk actions
      loadStats();
    } catch (error) {
      logger.error('UserManagement: Error performing bulk action', { 
        actionType: bulkActionType,
        error
      });
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>User Management</h2>
          <p className={`mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Manage user accounts and permissions</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button onClick={handleCreateUser} className="flex items-center">
            <UserPlus className="mr-2 h-5 w-5" />
            Add User
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`rounded-lg shadow-sm p-4 border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
          <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Total Users</div>
          <div className={`mt-1 text-3xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.totalUsers}</div>
        </div>
        <div className={`rounded-lg shadow-sm p-4 border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
          <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Active Users</div>
          <div className={`mt-1 text-3xl font-semibold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>{stats.activeUsers}</div>
        </div>
        <div className={`rounded-lg shadow-sm p-4 border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
          <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Admin Users</div>
          <div className={`mt-1 text-3xl font-semibold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>{stats.adminUsers}</div>
        </div>
      </div>
      
      {/* User Table */}
      <UserTable
        onEditUser={handleEditUser}
        onDeleteUser={handleDeleteUser}
        onViewActivities={handleViewActivities}
        onBulkAction={handleBulkAction}
      />
      
      {/* Modals */}
      <UserEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={selectedUser}
        onSave={handleSaveUser}
      />
      
      <UserActivities
        isOpen={isActivitiesModalOpen}
        onClose={() => setIsActivitiesModalOpen(false)}
        user={selectedUser}
      />
      
      <BulkActionModal
        isOpen={isBulkActionModalOpen}
        onClose={() => setIsBulkActionModalOpen(false)}
        actionType={bulkActionType}
        userIds={selectedUserIds}
        onConfirm={handleConfirmBulkAction}
      />
      
      {/* Delete Confirmation Modal */}
      {selectedUser && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isDeleteConfirmOpen ? '' : 'hidden'}`}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the user "{selectedUser.username}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmDeleteUser}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
