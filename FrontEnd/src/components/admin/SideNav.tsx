import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Upload, 
  BarChart3, 
  Settings, 
  TestTube, 
  Moon, 
  Sun, 
  Home,
  ArrowLeft,
  LogOut
} from 'lucide-react';

interface SideNavProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const SideNav: React.FC<SideNavProps> = ({ activeSection, setActiveSection }) => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'content', label: 'Content', icon: Upload },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'test', label: 'Test', icon: TestTube },
  ];

  return (
    <div className={`w-64 h-screen fixed left-0 top-0 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} shadow-lg transition-colors duration-200`}>
      <div className="p-4">
        <div className={`flex items-center justify-between mb-8`}>
          <div className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            OTT Admin
          </div>
        </div>
        
        <button
          onClick={() => navigate('/dashboard')}
          className={`flex items-center w-full px-4 py-3 mb-6 rounded-lg transition-colors duration-200 ${theme === 'dark' ? 'bg-blue-900/20 text-blue-300 hover:bg-blue-900/30' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
        >
          <ArrowLeft className="w-5 h-5 mr-3" />
          <span>Back to Dashboard</span>
        </button>
        
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive 
                    ? theme === 'dark'
                      ? 'bg-blue-900 text-blue-100' 
                      : 'bg-blue-100 text-blue-700'
                    : theme === 'dark'
                      ? 'text-gray-300 hover:bg-gray-800' 
                      : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
        <button
          onClick={toggleTheme}
          className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors duration-200 ${
            theme === 'dark'
              ? 'text-gray-300 hover:bg-gray-800' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-5 h-5 mr-3" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-5 h-5 mr-3" />
              <span>Dark Mode</span>
            </>
          )}
        </button>
        
        <button
          onClick={() => navigate('/dashboard')}
          className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors duration-200 ${
            theme === 'dark'
              ? 'text-gray-300 hover:bg-gray-800' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span>Exit Admin</span>
        </button>
      </div>
    </div>
  );
};

export default SideNav;
