import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStoredToken, getStoredRefreshToken } from '../../utils/storage';

/**
 * Test component to verify persistent authentication and token refresh functionality
 */
const AuthTest: React.FC = () => {
  const { state } = useAuth();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  useEffect(() => {
    // Get the current tokens from storage
    const storedToken = getStoredToken();
    const storedRefreshToken = getStoredRefreshToken();
    
    setAccessToken(storedToken);
    setRefreshToken(storedRefreshToken);
  }, [state.isAuthenticated]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Authentication Test</h2>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Auth State</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="font-medium">Authenticated:</div>
          <div>{state.isAuthenticated ? 'Yes' : 'No'}</div>
          
          <div className="font-medium">Loading:</div>
          <div>{state.loading ? 'Yes' : 'No'}</div>
          
          <div className="font-medium">User:</div>
          <div>{state.user ? state.user.email : 'None'}</div>
        </div>
      </div>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Tokens</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="font-medium">Access Token:</div>
          <div className="truncate max-w-md">{accessToken ? `${accessToken.substring(0, 20)}...` : 'None'}</div>
          
          <div className="font-medium">Refresh Token:</div>
          <div className="truncate max-w-md">{refreshToken ? `${refreshToken.substring(0, 20)}...` : 'None'}</div>
        </div>
      </div>
      
      <div className="text-sm text-gray-600 mt-4">
        <p>This component displays the current authentication state and tokens.</p>
        <p>If you refresh the page, you should remain logged in thanks to persistent token storage.</p>
        <p>When the access token expires, it should automatically refresh using the refresh token.</p>
      </div>
    </div>
  );
};

export default AuthTest;
