import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { BarChart3, TrendingUp, Film, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import Header from '../common/Header';
import LoadingSpinner from '../common/LoadingSpinner';

const DashboardLayout: React.FC = () => {
  const { state: authState } = useAuth();
  const { state: dataState } = useData();
  // We import useTheme but don't need to use theme directly since we're using Tailwind dark mode classes
  useTheme(); // Keep the hook to ensure context subscription
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:inset-0`}>
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-center h-16 bg-blue-600 dark:bg-blue-800 text-white">
              <h1 className="text-xl font-bold">OTT Dashboard</h1>
            </div>
            
            <nav className="flex-1 px-4 py-6 space-y-2 dark:text-gray-200">
              <SidebarNavLink to="/dashboard" icon={BarChart3} text="Overview" />
              <SidebarNavLink to="/dashboard/analytics" icon={TrendingUp} text="Analytics" />
              <SidebarNavLink to="/dashboard/content" icon={Film} text="Content" />
              {authState.user?.role === 'admin' && (
                <SidebarNavLink to="/admin" icon={Settings} text="Admin Panel" />
              )}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          <main className="p-6 dark:text-gray-200">
            {dataState.loading && <LoadingSpinner />}
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

interface SidebarNavLinkProps {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}

const SidebarNavLink: React.FC<SidebarNavLinkProps> = ({ to, icon: Icon, text }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center px-4 py-2 rounded-lg transition-colors ${
          isActive
            ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 border-r-2 border-blue-600 dark:border-blue-400'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`
      }
    >
      <Icon className="w-5 h-5 mr-3" />
      {text}
    </NavLink>
  );
};

export default DashboardLayout;
