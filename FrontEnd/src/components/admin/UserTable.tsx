import React, { useState, useEffect } from 'react';
import { User, UserFilters } from '../../types/User';
import { userService } from '../../services/user';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import { ChevronLeft, ChevronRight, Edit, Trash, UserCheck, UserX } from 'lucide-react';
import logger from '../../utils/logger';
import { useTheme } from '../../context/ThemeContext';

interface UserTableProps {
  onEditUser: (user: User) => void;
  onDeleteUser: (user: User) => void;
  onViewActivities: (user: User) => void;
  onBulkAction: (action: 'role' | 'status' | 'delete', userIds: string[]) => void;
}

const UserTable: React.FC<UserTableProps> = ({ 
  onEditUser, 
  onDeleteUser, 
  onViewActivities,
  onBulkAction
}) => {
  const { theme } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    limit: 10,
    sort: 'createdAt',
    order: 'desc'
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      logger.info('UserTable: Loading users with filters', { filters });
      const response = await userService.getUsers(filters);
      
      // Check if response.data exists and has the expected structure
      if (response && response.data) {
        // Handle the API response structure with docs array
        const userData = response.data.docs || response.data.users || response.data;
        const totalPagesData = response.data.totalPages || 1;
        const totalData = response.data.totalDocs || response.data.total || (Array.isArray(userData) ? userData.length : 0);
        
        // Ensure userData is an array
        const usersArray = Array.isArray(userData) ? userData : [];
        
        setUsers(usersArray);
        setTotalPages(totalPagesData);
        setTotalUsers(totalData);
        
        logger.debug('UserTable: Users loaded successfully', { 
          count: usersArray.length,
          total: totalData
        });
      } else {
        // Handle empty or unexpected response
        setUsers([]);
        setTotalPages(1);
        setTotalUsers(0);
        logger.warn('UserTable: Received empty or unexpected response structure');
      }
    } catch (error) {
      logger.error('UserTable: Error loading users', { error });
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setFilters({ ...filters, page: newPage });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFilters({ 
        ...filters, 
        [name]: checkbox.checked,
        page: 1 // Reset to first page when filter changes
      });
      return;
    }
    
    setFilters({ 
      ...filters, 
      [name]: value,
      page: 1 // Reset to first page when filter changes
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  // Role changes are handled through the onBulkAction prop

  const handleStatusToggle = async (userId: string) => {
    try {
      logger.info('UserTable: Toggling user status', { userId });
      const response = await userService.toggleUserStatus(userId);
      
      // Update the user in the local state
      setUsers(users.map(user => 
        user._id === userId ? response.data : user
      ));
      
      logger.debug('UserTable: User status toggled successfully');
    } catch (error) {
      logger.error('UserTable: Error toggling user status', { userId, error });
      setError('Failed to toggle user status. Please try again.');
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUsers(users.map(user => user._id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  return (
    <div className={`rounded-lg shadow overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
      {/* Filters */}
      <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="search" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Search
            </label>
            <input
              type="text"
              id="search"
              name="search"
              value={filters.search || ''}
              onChange={handleFilterChange}
              placeholder="Username or email"
              className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-base py-2 px-3 rounded-md ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
            />
          </div>
          
          <div>
            <label htmlFor="role" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Role
            </label>
            <select
              id="role"
              name="role"
              value={filters.role || ''}
              onChange={handleFilterChange}
              className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-base py-2 px-3 rounded-md ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
            >
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="isActive" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Status
            </label>
            <select
              id="isActive"
              name="isActive"
              value={filters.isActive === undefined ? '' : String(filters.isActive)}
              onChange={handleFilterChange}
              className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-base py-2 px-3 rounded-md ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <Button type="submit" className="w-full">
              Apply Filters
            </Button>
          </div>
        </form>
      </div>
      
      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className={`p-3 border-b flex items-center justify-between ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
          <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {selectedUsers.length} users selected
          </span>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onBulkAction('role', selectedUsers)}
            >
              Change Role
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onBulkAction('status', selectedUsers)}
            >
              Toggle Status
            </Button>
            <Button 
              variant="danger" 
              size="sm"
              onClick={() => onBulkAction('delete', selectedUsers)}
            >
              Delete
            </Button>
          </div>
        </div>
      )}
      
      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="text-center p-8 text-red-500">{error}</div>
        ) : users.length === 0 ? (
          <div className={`text-center p-8 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>No users found</div>
        ) : (
          <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-gray-600' : 'divide-gray-200'}`}>
            <thead className={theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}>
              <tr>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={handleSelectAll}
                    className={`h-4 w-4 rounded focus:ring-blue-500 ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-blue-400' : 'border-gray-300 text-blue-600'}`}
                  />
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                  User
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                  Role
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                  Status
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                  Last Login
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                  Created
                </th>
                <th scope="col" className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${theme === 'dark' ? 'bg-gray-700 divide-gray-600' : 'bg-white divide-gray-200'}`}>
              {users.map(user => (
                <tr key={user._id} className={user.isActive 
                  ? theme === 'dark' ? 'bg-gray-700' : '' 
                  : theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
                }>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => handleSelectUser(user._id)}
                      className={`h-4 w-4 rounded focus:ring-blue-500 ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-blue-400' : 'border-gray-300 text-blue-600'}`}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                        <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{user.username?.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="ml-4">
                        <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{user.username}</div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${theme === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive 
                      ? theme === 'dark' ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                      : theme === 'dark' ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => onViewActivities(user)}
                        className={`text-gray-600 ${theme === 'dark' ? 'hover:text-gray-300' : 'hover:text-gray-900'}`}
                        title="View Activities"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12zm-1-5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm0-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleStatusToggle(user._id)}
                        className={`${user.isActive ? 'text-red-600' : 'text-green-600'} ${theme === 'dark' ? 'hover:text-red-300' : 'hover:text-green-900'}`}
                        title={user.isActive ? 'Deactivate User' : 'Activate User'}
                      >
                        {user.isActive ? <UserX className="h-5 w-5" /> : <UserCheck className="h-5 w-5" />}
                      </button>
                      <button
                        onClick={() => onEditUser(user)}
                        className={`text-blue-600 ${theme === 'dark' ? 'hover:text-blue-300' : 'hover:text-blue-900'}`}
                        title="Edit User"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => onDeleteUser(user)}
                        className={`text-red-600 ${theme === 'dark' ? 'hover:text-red-300' : 'hover:text-red-900'}`}
                        title="Delete User"
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Pagination */}
      <div className={`px-4 py-3 flex items-center justify-between border-t sm:px-6 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Showing <span className="font-medium">{((filters.page || 1) - 1) * (filters.limit || 10) + 1}</span> to <span className="font-medium">{Math.min((filters.page || 1) * (filters.limit || 10), totalUsers)}</span> of{' '}
              <span className="font-medium">{totalUsers}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => handlePageChange((filters.page || 1) - 1)}
                disabled={(filters.page || 1) === 1}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'dark' 
                  ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'}`}
              >
                <span className="sr-only">Previous</span>
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              
              {/* Page numbers would go here */}
              <span className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${theme === 'dark' 
                ? 'border-gray-600 bg-gray-700 text-gray-300' 
                : 'border-gray-300 bg-white text-gray-700'}`}>
                Page {filters.page || 1} of {totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange((filters.page || 1) + 1)}
                disabled={(filters.page || 1) === totalPages}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'dark' 
                  ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'}`}
              >
                <span className="sr-only">Next</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTable;
