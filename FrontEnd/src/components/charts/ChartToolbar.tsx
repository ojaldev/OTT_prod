import React from 'react';
import { Download, Info, Maximize2, X } from 'lucide-react';

interface ChartToolbarProps {
  onDownload: () => void;
  onToggleInfo: () => void;
  onToggleFullscreen: () => void;
  showInfo: boolean;
  isFullscreen: boolean;
  className?: string;
}

const ChartToolbar: React.FC<ChartToolbarProps> = ({
  onDownload,
  onToggleInfo,
  onToggleFullscreen,
  showInfo,
  isFullscreen,
  className = ''
}) => {
  return (
    <div className={`flex gap-1 ${className}`} role="toolbar" aria-label="Chart toolbar">
      <button
        onClick={onDownload}
        className="p-1.5 rounded text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
        title="Download chart"
        aria-label="Download chart"
      >
        <Download className="w-4 h-4" />
      </button>
      <button
        onClick={onToggleInfo}
        className={`p-1.5 rounded ${showInfo ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        title={showInfo ? 'Hide information' : 'Show information'}
        aria-pressed={showInfo}
        aria-label={showInfo ? 'Hide information' : 'Show information'}
      >
        <Info className="w-4 h-4" />
      </button>
      <button
        onClick={onToggleFullscreen}
        className="p-1.5 rounded text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
        title={isFullscreen ? 'Exit fullscreen' : 'View fullscreen'}
        aria-label={isFullscreen ? 'Exit fullscreen' : 'View fullscreen'}
        aria-pressed={isFullscreen}
      >
        {isFullscreen ? <X className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
      </button>
    </div>
  );
};

export default ChartToolbar;
