import React, { useState, useEffect } from 'react';
import { User, UserActivity, UserActivityFilters } from '../../types/User';
import { userService } from '../../services/user';
import Modal from '../common/Modal';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import logger from '../../utils/logger';
import { useTheme } from '../../context/ThemeContext';

interface UserActivitiesProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

const UserActivities: React.FC<UserActivitiesProps> = ({ isOpen, onClose, user }) => {
  const { theme } = useTheme();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UserActivityFilters>({
    page: 1,
    limit: 10,
    sort: 'createdAt',
    order: 'desc'
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalActivities, setTotalActivities] = useState(0);

  useEffect(() => {
    if (isOpen && user) {
      loadActivities();
    }
  }, [isOpen, user, filters]);

  const loadActivities = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      logger.info('UserActivities: Loading activities', { userId: user._id, filters });
      const response = await userService.getUserActivities(user._id, filters);
      
      // Check if response.data exists and has the expected structure
      if (response && response.data) {
        // Handle the API response structure with docs array
        const activitiesData = response.data.docs || response.data.activities || [];
        const totalPagesData = response.data.totalPages || 1;
        const totalData = response.data.totalDocs || response.data.total || activitiesData.length;
        
        setActivities(activitiesData);
        setTotalPages(totalPagesData);
        setTotalActivities(totalData);
        
        logger.debug('UserActivities: Activities loaded successfully', { 
          count: activitiesData.length,
          total: totalData
        });
      } else {
        // Handle empty or unexpected response
        setActivities([]);
        setTotalPages(1);
        setTotalActivities(0);
        logger.warn('UserActivities: Received empty or unexpected response structure');
      }
    } catch (error) {
      logger.error('UserActivities: Error loading activities', { error });
      setError('Failed to load user activities. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setFilters({ ...filters, page: newPage });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters({ 
      ...filters, 
      [name]: value,
      page: 1 // Reset to first page when filter changes
    });
  };

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getActionColor = (action: string) => {
    if (theme === 'dark') {
      switch (action.toLowerCase()) {
        case 'login':
          return 'bg-green-900 text-green-200';
        case 'logout':
          return 'bg-blue-900 text-blue-200';
        case 'register':
          return 'bg-purple-900 text-purple-200';
        case 'password_change':
          return 'bg-yellow-900 text-yellow-200';
        case 'role_change':
          return 'bg-indigo-900 text-indigo-200';
        case 'status_change':
          return 'bg-orange-900 text-orange-200';
        default:
          return 'bg-gray-700 text-gray-200';
      }
    } else {
      switch (action.toLowerCase()) {
        case 'login':
          return 'bg-green-100 text-green-800';
        case 'logout':
          return 'bg-blue-100 text-blue-800';
        case 'register':
          return 'bg-purple-100 text-purple-800';
        case 'password_change':
          return 'bg-yellow-100 text-yellow-800';
        case 'role_change':
          return 'bg-indigo-100 text-indigo-800';
        case 'status_change':
          return 'bg-orange-100 text-orange-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={user ? `Activity History: ${user.username}` : 'User Activities'}
      size="lg"
    >
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex space-x-4">
          <div className="flex-1">
            <label htmlFor="action" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Action Type
            </label>
            <select
              id="action"
              name="action"
              value={filters.action || ''}
              onChange={handleFilterChange}
              className={`w-full px-3 py-3 text-base border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
            >
              <option value="">All Actions</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="register">Register</option>
              <option value="password_change">Password Change</option>
              <option value="role_change">Role Change</option>
              <option value="status_change">Status Change</option>
            </select>
          </div>
          
          <div className="flex-1">
            <label htmlFor="order" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Sort Order
            </label>
            <select
              id="order"
              name="order"
              value={filters.order}
              onChange={handleFilterChange}
              className={`w-full px-3 py-3 text-base border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
        
        {/* Activities List */}
        <div className={`rounded-lg border overflow-hidden ${theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="text-center p-8 text-red-500">{error}</div>
          ) : activities.length === 0 ? (
            <div className={`text-center p-8 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>No activities found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-gray-600' : 'divide-gray-200'}`}>
                <thead className={theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}>
                  <tr>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                      Action
                    </th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                      Details
                    </th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                      IP Address
                    </th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                      Date & Time
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme === 'dark' ? 'bg-gray-700 divide-gray-600' : 'bg-white divide-gray-200'}`}>
                  {activities.map(activity => (
                    <tr key={activity._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionColor(activity.action)}`}>
                          {activity.action}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>{typeof activity.details === 'object' ? JSON.stringify(activity.details) : activity.details}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{activity.details?.ip || 'Unknown'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{formatDate(activity.createdAt)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {!loading && activities.length > 0 && (
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Showing <span className="font-medium">{((filters.page || 1) - 1) * (filters.limit || 10) + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min((filters.page || 1) * (filters.limit || 10), totalActivities)}
                </span>{' '}
                of <span className="font-medium">{totalActivities}</span> activities
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange((filters.page || 1) - 1)}
                  disabled={(filters.page || 1) === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600' : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'}`}
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show pages around current page
                  let pageNum;
                  const currentPage = filters.page || 1;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        (filters.page || 1) === pageNum
                          ? theme === 'dark' 
                            ? 'z-10 bg-blue-900 border-blue-700 text-blue-200'
                            : 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange((filters.page || 1) + 1)}
                  disabled={(filters.page || 1) === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600' : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'}`}
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        )}
        
        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default UserActivities;
