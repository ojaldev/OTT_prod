import React, { useState, useEffect } from 'react';
import { Users, Upload, BarChart3, Settings, ArrowLeft } from 'lucide-react';
import { contentService } from '../services/content';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import UserManagement from '../components/admin/UserManagement';
import UserManagementTest from '../components/admin/UserManagementTest';
import BackendHealth from '../components/admin/BackendHealth';
import CsvImportErrors from '../components/admin/CsvImportErrors';
import AuthTest from '../components/auth/AuthTest';
import SideNav from '../components/admin/SideNav';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

const AdminPanel: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalContent: 0,
    recentImports: 0
  });

  useEffect(() => {
    // Load admin stats
    loadStats();
  }, []);

  const loadStats = async () => {
    // This would typically fetch from an admin stats endpoint
    setStats({
      totalUsers: 25,
      totalContent: 150,
      recentImports: 3
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setImportFile(file);
    } else {
      alert('Please select a valid CSV file');
    }
  };

  const handleImportCSV = async () => {
    if (!importFile) return;

    try {
      setImportLoading(true);
      const result = await contentService.importCSV(importFile);
      setImportResult(result);
    } catch (error) {
      console.error('Import failed:', error);
      setImportResult({
        success: false,
        message: error instanceof Error ? error.message : 'Import failed'
      });
    } finally {
      setImportLoading(false);
    }
  };

  const closeImportModal = () => {
    setIsImportModalOpen(false);
    setImportFile(null);
    setImportResult(null);
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-200`}>
      {/* Side Navigation */}
      <SideNav activeSection={activeSection} setActiveSection={setActiveSection} />
      
      {/* Main Content */}
      <div className="ml-64 p-6">
        {/* Quick Dashboard Navigation */}
        <div className="mb-4">
          <button 
            onClick={() => navigate('/dashboard')} 
            className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors duration-200 ${theme === 'dark' ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Dashboard
          </button>
        </div>
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Admin Panel</h1>
          <p className={`mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>System administration and management</p>
          <div className={`mt-4 p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-900/20 text-blue-300 border border-blue-800' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
            <p className="text-sm">Welcome to the admin panel. Use the sidebar to navigate between different sections.</p>
          </div>
        </div>
        
        {activeSection === 'dashboard' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard
                title="Total Users"
                value={stats.totalUsers}
                icon={Users}
                color="blue"
                theme={theme}
              />
              <StatCard
                title="Total Content"
                value={stats.totalContent}
                icon={BarChart3}
                color="green"
                theme={theme}
              />
              <StatCard
                title="Recent Imports"
                value={stats.recentImports}
                icon={Upload}
                color="purple"
                theme={theme}
              />
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* CSV Import */}
              <ActionCard
                title="Import Content"
                description="Bulk import content from CSV files"
                icon={Upload}
                action={() => setIsImportModalOpen(true)}
                buttonText="Import CSV"
                theme={theme}
              />

              {/* User Management */}
              <ActionCard
                title="User Management"
                description="Manage user accounts and permissions"
                icon={Users}
                action={() => setActiveSection('users')}
                buttonText="Manage Users"
                theme={theme}
              />

              {/* System Settings */}
              <ActionCard
                title="System Settings"
                description="Configure system preferences and settings"
                icon={Settings}
                action={() => setActiveSection('settings')}
                buttonText="Settings"
                theme={theme}
              />
            </div>
          </>
        )}
        
        {activeSection === 'users' && (
          <UserManagement />
        )}
        
        {activeSection === 'content' && (
          <div className={`rounded-lg shadow-md p-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
            <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Content Management</h2>
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Content management functionality will be implemented soon.</p>
            <Button 
              onClick={() => setIsImportModalOpen(true)}
              className="mt-4"
            >
              Import Content
            </Button>
          </div>
        )}

        {activeSection === 'analytics' && (
          <div className={`rounded-lg shadow-md p-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
            <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Analytics</h2>
            <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Operational analytics for the backend services.</p>
            <div className="grid grid-cols-1 gap-6">
              <BackendHealth height={300} />
              <CsvImportErrors />
            </div>
          </div>
        )}
        
        {activeSection === 'settings' && (
          <div className={`rounded-lg shadow-md p-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
            <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>System Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h3 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Theme Settings</h3>
                <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Customize the appearance of the admin interface</p>
                <Button onClick={toggleTheme}>
                  {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                </Button>
              </div>
              
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h3 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Navigation</h3>
                <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Return to main dashboard</p>
                <Button onClick={() => navigate('/dashboard')} variant="outline">
                  Back to Dashboard
                </Button>
              </div>
            </div>
            
            {/* Authentication Test Component */}
            <div className="mt-6">
              <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Authentication Test</h3>
              <AuthTest />
            </div>
          </div>
        )}
        
        {activeSection === 'test' && (
          <UserManagementTest />
        )}

        {/* CSV Import Modal */}
        <Modal
          isOpen={isImportModalOpen}
          onClose={closeImportModal}
          title="Import Content from CSV"
          size="lg"
        >
          <div className="space-y-6">
            {!importResult ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select CSV File
                  </label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {importFile && (
                    <p className="mt-2 text-sm text-gray-600">
                      Selected: {importFile.name}
                    </p>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">CSV Format Requirements:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Platform, Title, Year are required fields</li>
                    <li>• Primary Language is required</li>
                    <li>• Dubbing languages: use 1 for true, 0 for false</li>
                    <li>• Date format: YYYY-MM-DD</li>
                  </ul>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={closeImportModal}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleImportCSV}
                    disabled={!importFile}
                    loading={importLoading}
                  >
                    Import
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${importResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
                  <h4 className={`font-medium ${importResult.success ? 'text-green-900' : 'text-red-900'}`}>
                    {importResult.success ? 'Import Successful' : 'Import Failed'}
                  </h4>
                  <p className={`text-sm mt-1 ${importResult.success ? 'text-green-700' : 'text-red-700'}`}>
                    {importResult.message}
                  </p>
                </div>

                {importResult.success && importResult.data && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Import Summary:</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Processed:</span>
                        <span className="ml-2 font-medium">{importResult.data.processed}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Duplicates:</span>
                        <span className="ml-2 font-medium">{importResult.data.duplicates}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Errors:</span>
                        <span className="ml-2 font-medium">{importResult.data.errors}</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        onClick={() => { setActiveSection('analytics'); setIsImportModalOpen(false); }}
                      >
                        View CSV Import Errors
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button onClick={closeImportModal}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'purple';
  theme: 'light' | 'dark';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, theme }) => {
  const colorClasses = {
    blue: 'bg-blue-500 text-blue-100',
    green: 'bg-green-500 text-green-100',
    purple: 'bg-purple-500 text-purple-100'
  };

  return (
    <div className={`rounded-lg shadow-md p-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="ml-4">
          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{title}</p>
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{value}</p>
        </div>
      </div>
    </div>
  );
};

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  buttonText: string;
  theme: 'light' | 'dark';
}

const ActionCard: React.FC<ActionCardProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  action, 
  buttonText,
  theme
}) => {
  return (
    <div className={`rounded-lg shadow-md p-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
      <div className="flex items-center mb-4">
        <Icon className={`w-8 h-8 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
        <h3 className={`ml-3 text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
      </div>
      <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{description}</p>
      <Button onClick={action} className="w-full">
        {buttonText}
      </Button>
    </div>
  );
};

export default AdminPanel;
