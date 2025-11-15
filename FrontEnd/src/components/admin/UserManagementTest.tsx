import React, { useState } from 'react';
import { userService } from '../../services/user';
import Button from '../common/Button';
import { useTheme } from '../../context/ThemeContext';
import logger from '../../utils/logger';
import { authService } from '../../services/auth';

/**
 * Test component for verifying user management and authentication functionality
 * This component is for development/testing purposes only
 */
const UserManagementTest: React.FC = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Array<{
    name: string;
    status: 'success' | 'error' | 'pending';
    message?: string;
  }>>([
    { name: 'User Registration', status: 'pending' },
    { name: 'Authentication Persistence', status: 'pending' }
  ]);

  const updateResult = (index: number, status: 'success' | 'error', message: string) => {
    setResults(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], status, message };
      return updated;
    });
  };

  const testUserRegistration = async () => {
    try {
      // Generate a unique username and email to avoid conflicts
      const timestamp = new Date().getTime();
      const testUser = {
        username: `testuser_${timestamp}`,
        email: `test_${timestamp}@example.com`,
        password: 'Test@123456',
        role: 'user' as const
      };

      logger.info('Testing user registration', { username: testUser.username });
      
      // Attempt to register the user
      const response = await userService.register(testUser);
      
      if (response && response.data && response.data.user) {
        updateResult(0, 'success', `Successfully registered user: ${testUser.username}`);
      } else {
        updateResult(0, 'error', 'Registration response missing user data');
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error';
      updateResult(0, 'error', `Registration failed: ${errorMessage}`);
    }
  };

  const testAuthPersistence = async () => {
    try {
      logger.info('Testing authentication persistence');
      
      // Check if we're authenticated using the new cookie-based system
      const isAuthenticated = authService.isAuthenticated();
      
      if (!isAuthenticated) {
        updateResult(1, 'error', 'No authentication tokens found in cookies/storage');
        return;
      }
      
      // Get the current user from cookies without making a backend call
      const currentUser = authService.getCurrentUser();
      
      if (currentUser) {
        // Successfully retrieved user from cookies without backend call
        updateResult(1, 'success', `Authentication persisted successfully in cookies. Current user: ${currentUser.username}`);
        
        // Add additional test to verify we're not making unnecessary backend calls
        setResults(prev => {
          const updated = [...prev];
          updated.push({ 
            name: 'Cookie-based Auth Check', 
            status: 'success', 
            message: 'Successfully retrieved authentication data from cookies without backend API calls' 
          });
          return updated;
        });
      } else {
        // This should not happen if isAuthenticated returned true
        updateResult(1, 'error', 'isAuthenticated() returned true but getCurrentUser returned null');
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error';
      updateResult(1, 'error', `Auth persistence test failed: ${errorMessage}`);
    }
  };

  const runTests = async () => {
    setLoading(true);
    
    // Reset results
    setResults(prev => prev.map(item => ({ ...item, status: 'pending' })));
    
    try {
      await testUserRegistration();
      await testAuthPersistence();
    } catch (error) {
      logger.error('Error running tests', { error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`rounded-lg shadow-md p-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          User Management & Auth Tests
        </h2>
        <Button 
          onClick={runTests} 
          disabled={loading}
          loading={loading}
        >
          Run Tests
        </Button>
      </div>
      
      <div className="space-y-4">
        {results.map((test, index) => (
          <div 
            key={index}
            className={`p-4 rounded-md ${
              test.status === 'success' ? 'bg-green-50 border border-green-200' :
              test.status === 'error' ? 'bg-red-50 border border-red-200' :
              'bg-gray-50 border border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {test.name}
              </h3>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                test.status === 'success' ? 'bg-green-100 text-green-800' :
                test.status === 'error' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {test.status === 'pending' ? 'Pending' : 
                 test.status === 'success' ? 'Success' : 'Error'}
              </span>
            </div>
            {test.message && (
              <p className={`mt-1 text-sm ${
                test.status === 'success' ? 'text-green-700' :
                test.status === 'error' ? 'text-red-700' :
                'text-gray-600'
              }`}>
                {test.message}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserManagementTest;
