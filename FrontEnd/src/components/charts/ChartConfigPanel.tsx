import React, { useState } from 'react';
import { X, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { ChartType } from './ChartCard';
import { useTheme } from '../../context/ThemeContext';

interface ChartConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (config: ChartConfig) => void;
  initialConfig?: Partial<ChartConfig>;
  availableChartTypes: ChartType[];
}

export interface ChartConfig {
  chartType: ChartType;
  showLegend: boolean;
  legendPosition: 'top' | 'right' | 'bottom' | 'left';
  enableAnimation: boolean;
  colorScheme: string;
}

const defaultConfig: ChartConfig = {
  chartType: 'bar',
  showLegend: true,
  legendPosition: 'bottom',
  enableAnimation: true,
  colorScheme: 'default',
};

const colorSchemes = [
  { id: 'default', name: 'Default', colors: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'] },
  { id: 'pastel', name: 'Pastel', colors: ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF'] },
  { id: 'vibrant', name: 'Vibrant', colors: ['#FF1744', '#2979FF', '#FFEA00', '#00E676', '#D500F9'] },
  { id: 'monochrome', name: 'Monochrome', colors: ['#000000', '#333333', '#666666', '#999999', '#CCCCCC'] },
];

const ChartConfigPanel: React.FC<ChartConfigPanelProps> = ({
  isOpen,
  onClose,
  onApply,
  initialConfig = {},
  availableChartTypes,
}) => {
  const { theme } = useTheme();
  const [config, setConfig] = useState<ChartConfig>({
    ...defaultConfig,
    chartType: availableChartTypes[0] || defaultConfig.chartType,
    ...initialConfig,
  });
  const [activeSection, setActiveSection] = useState<string | null>('general');

  const handleChange = <K extends keyof ChartConfig>(key: K, value: ChartConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApply(config);
    onClose();
  };

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  if (!isOpen) return null;

  const bgColor = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`${bgColor} ${textColor} rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-4 border-b ${borderColor}">
          <h3 className="text-lg font-semibold">Chart Configuration</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* General Settings */}
          <div className={`border ${borderColor} rounded-md overflow-hidden`}>
            <button
              className={`w-full flex items-center justify-between p-3 text-left ${
                activeSection === 'general' ? 'bg-blue-50 dark:bg-blue-900' : ''
              }`}
              onClick={() => toggleSection('general')}
            >
              <span className="font-medium">General Settings</span>
              {activeSection === 'general' ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
            
            {activeSection === 'general' && (
              <div className="p-3 space-y-3 border-t ${borderColor}">
                <div>
                  <label className="block text-sm font-medium mb-1">Chart Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableChartTypes.map((type) => (
                      <button
                        key={type}
                        className={`py-2 px-3 rounded-md text-sm ${
                          config.chartType === type
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                        onClick={() => handleChange('chartType', type)}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.showLegend}
                      onChange={(e) => handleChange('showLegend', e.target.checked)}
                      className="rounded text-blue-500 focus:ring-blue-500"
                    />
                    <span>Show Legend</span>
                  </label>
                </div>

                {config.showLegend && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Legend Position</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['top', 'right', 'bottom', 'left'] as const).map((position) => (
                        <button
                          key={position}
                          className={`py-2 px-3 rounded-md text-sm ${
                            config.legendPosition === position
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                          onClick={() => handleChange('legendPosition', position)}
                        >
                          {position.charAt(0).toUpperCase() + position.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.enableAnimation}
                      onChange={(e) => handleChange('enableAnimation', e.target.checked)}
                      className="rounded text-blue-500 focus:ring-blue-500"
                    />
                    <span>Enable Animation</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Color Scheme */}
          <div className={`border ${borderColor} rounded-md overflow-hidden`}>
            <button
              className={`w-full flex items-center justify-between p-3 text-left ${
                activeSection === 'colors' ? 'bg-blue-50 dark:bg-blue-900' : ''
              }`}
              onClick={() => toggleSection('colors')}
            >
              <span className="font-medium">Color Scheme</span>
              {activeSection === 'colors' ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
            
            {activeSection === 'colors' && (
              <div className="p-3 space-y-3 border-t ${borderColor}">
                <div className="grid grid-cols-1 gap-2">
                  {colorSchemes.map((scheme) => (
                    <button
                      key={scheme.id}
                      className={`flex items-center p-2 rounded-md ${
                        config.colorScheme === scheme.id
                          ? 'bg-blue-100 dark:bg-blue-800'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => handleChange('colorScheme', scheme.id)}
                    >
                      <div className="flex-1">{scheme.name}</div>
                      <div className="flex space-x-1">
                        {scheme.colors.map((color, i) => (
                          <div
                            key={i}
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      {config.colorScheme === scheme.id && (
                        <Check className="w-4 h-4 ml-2 text-blue-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        <div className="flex justify-end p-4 border-t ${borderColor} space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChartConfigPanel;
