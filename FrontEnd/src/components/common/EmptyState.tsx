import React from 'react';
import { BarChart3 } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No data for the selected filters',
  description = 'Try broadening your date range, removing some filters, or selecting additional platforms/genres/languages.',
  className = '',
  children
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center rounded-lg border p-6 md:p-8 bg-white/70 dark:bg-gray-900/60 border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
        <BarChart3 className="w-6 h-6 text-gray-400" />
      </div>
      <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 max-w-md">{description}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};

export default EmptyState;
