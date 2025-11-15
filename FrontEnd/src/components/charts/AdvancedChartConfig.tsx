import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  BarChart3, 
  PieChart, 
  LineChart, 
  Sliders,
  RefreshCw
} from 'lucide-react';
import { ChartType } from './ChartCard';
import { useTheme } from '../../context/ThemeContext';
import YearRangeSlider from './YearRangeSlider';

interface AdvancedChartConfigProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (config: AdvancedChartConfig) => void;
  initialConfig?: Partial<AdvancedChartConfig>;
  availableChartTypes: ChartType[];
  dataFields?: string[];
  dimensions?: string[];
  measures?: string[];
  startYear?: number;
  endYear?: number;
}

export interface AdvancedChartConfig {
  chartType: ChartType;
  showLegend: boolean;
  legendPosition: 'top' | 'right' | 'bottom' | 'left';
  enableAnimation: boolean;
  colorScheme: string;
  selectedFields?: string[];
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  xAxis?: string;
  yAxis?: string;
  groupBy?: string;
  yearRange?: [number, number];
  aggregation?: 'sum' | 'average' | 'count' | 'max' | 'min';
  limit?: number;
  includeOthers?: boolean;
}

const defaultConfig: AdvancedChartConfig = {
  chartType: 'bar',
  showLegend: true,
  legendPosition: 'bottom',
  enableAnimation: true,
  colorScheme: 'default',
  limit: 10,
  includeOthers: true,
  aggregation: 'sum'
};

const colorSchemes = [
  { id: 'default', name: 'Default', colors: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'] },
  { id: 'purple', name: 'Purple Theme', colors: ['#9333EA', '#A855F7', '#C084FC', '#D8B4FE', '#F3E8FF'] },
  { id: 'vibrant', name: 'Vibrant', colors: ['#FF1744', '#2979FF', '#FFEA00', '#00E676', '#D500F9'] },
  { id: 'dark', name: 'Dark Mode', colors: ['#8B5CF6', '#6366F1', '#3B82F6', '#0EA5E9', '#06B6D4'] },
];

const AdvancedChartConfig: React.FC<AdvancedChartConfigProps> = ({
  isOpen,
  onClose,
  onApply,
  initialConfig = {},
  availableChartTypes,
  dataFields = [],
  dimensions = [],
  measures = [],
  startYear = 2000,
  endYear = new Date().getFullYear()
}) => {
  const { theme } = useTheme();
  const [config, setConfig] = useState<AdvancedChartConfig>({
    ...defaultConfig,
    chartType: availableChartTypes[0] || defaultConfig.chartType,
    yearRange: [startYear, endYear],
    ...initialConfig,
  });
  const [activeSection, setActiveSection] = useState<string | null>('general');
  const [previewMode, setPreviewMode] = useState<boolean>(false);

  useEffect(() => {
    if (!config.xAxis && dimensions.length > 0) {
      setConfig(prev => ({ ...prev, xAxis: dimensions[0] }));
    }
    if (!config.yAxis && measures.length > 0) {
      setConfig(prev => ({ ...prev, yAxis: measures[0] }));
    }
  }, [dimensions, measures]);

  const handleChange = <K extends keyof AdvancedChartConfig>(key: K, value: AdvancedChartConfig[K]) => {
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
  const inputBg = theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50';
  const inputBorder = theme === 'dark' ? 'border-gray-600' : 'border-gray-300';
  const activeSectionBg = theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-50';

  const chartTypeIcons = {
    bar: <BarChart3 className="w-4 h-4" />,
    line: <LineChart className="w-4 h-4" />,
    pie: <PieChart className="w-4 h-4" />,
    doughnut: <PieChart className="w-4 h-4" />
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`${bgColor} ${textColor} rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col`}>
        <div className="flex items-center justify-between p-4 border-b border-purple-500">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold">Chart Configuration</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`px-3 py-1 text-sm rounded-md ${previewMode ? 'bg-purple-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              Preview
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Configuration Panel */}
          <div className="w-2/3 p-4 overflow-y-auto space-y-4">
            {/* Chart Type */}
            <div className={`border ${borderColor} rounded-md overflow-hidden`}>
              <button
                className={`w-full flex items-center justify-between p-3 text-left ${
                  activeSection === 'general' ? activeSectionBg : ''
                }`}
                onClick={() => toggleSection('general')}
              >
                <span className="font-medium">Chart Type</span>
                {activeSection === 'general' ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
              
              {activeSection === 'general' && (
                <div className="p-3 space-y-3 border-t ${borderColor}">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {availableChartTypes.map((type) => (
                      <button
                        key={type}
                        className={`py-2 px-3 rounded-md text-sm flex items-center justify-center space-x-2 ${
                          config.chartType === type
                            ? 'bg-purple-500 text-white'
                            : `${inputBg} hover:bg-gray-200 dark:hover:bg-gray-600`
                        }`}
                        onClick={() => handleChange('chartType', type)}
                      >
                        {chartTypeIcons[type]}
                        <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-4 mt-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="showLegend"
                        checked={config.showLegend}
                        onChange={(e) => handleChange('showLegend', e.target.checked)}
                        className="rounded text-purple-500 focus:ring-purple-500"
                      />
                      <label htmlFor="showLegend">Show Legend</label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="enableAnimation"
                        checked={config.enableAnimation}
                        onChange={(e) => handleChange('enableAnimation', e.target.checked)}
                        className="rounded text-purple-500 focus:ring-purple-500"
                      />
                      <label htmlFor="enableAnimation">Enable Animation</label>
                    </div>
                  </div>

                  {config.showLegend && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Legend Position</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {(['top', 'right', 'bottom', 'left'] as const).map((position) => (
                          <button
                            key={position}
                            className={`py-2 px-3 rounded-md text-sm ${
                              config.legendPosition === position
                                ? 'bg-purple-500 text-white'
                                : `${inputBg} hover:bg-gray-200 dark:hover:bg-gray-600`
                            }`}
                            onClick={() => handleChange('legendPosition', position)}
                          >
                            {position.charAt(0).toUpperCase() + position.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Data Dimensions */}
            <div className={`border ${borderColor} rounded-md overflow-hidden`}>
              <button
                className={`w-full flex items-center justify-between p-3 text-left ${
                  activeSection === 'dimensions' ? activeSectionBg : ''
                }`}
                onClick={() => toggleSection('dimensions')}
              >
                <span className="font-medium">Data Dimensions</span>
                {activeSection === 'dimensions' ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
              
              {activeSection === 'dimensions' && (
                <div className="p-3 space-y-4 border-t ${borderColor}">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* X-Axis Selection */}
                    <div>
                      <label className="block text-sm font-medium mb-1">X-Axis (Category)</label>
                      <select
                        value={config.xAxis || ''}
                        onChange={(e) => handleChange('xAxis', e.target.value)}
                        className={`w-full rounded-md border ${inputBorder} ${inputBg} px-3 py-2`}
                      >
                        <option value="">Select X-Axis</option>
                        {dimensions.map((dim) => (
                          <option key={dim} value={dim}>{dim}</option>
                        ))}
                      </select>
                    </div>

                    {/* Y-Axis Selection */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Y-Axis (Value)</label>
                      <select
                        value={config.yAxis || ''}
                        onChange={(e) => handleChange('yAxis', e.target.value)}
                        className={`w-full rounded-md border ${inputBorder} ${inputBg} px-3 py-2`}
                      >
                        <option value="">Select Y-Axis</option>
                        {measures.map((measure) => (
                          <option key={measure} value={measure}>{measure}</option>
                        ))}
                      </select>
                    </div>

                    {/* Group By */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Group By (Optional)</label>
                      <select
                        value={config.groupBy || ''}
                        onChange={(e) => handleChange('groupBy', e.target.value || undefined)}
                        className={`w-full rounded-md border ${inputBorder} ${inputBg} px-3 py-2`}
                      >
                        <option value="">No Grouping</option>
                        {dimensions.filter(d => d !== config.xAxis).map((dim) => (
                          <option key={dim} value={dim}>{dim}</option>
                        ))}
                      </select>
                    </div>

                    {/* Aggregation Method */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Aggregation Method</label>
                      <select
                        value={config.aggregation || 'sum'}
                        onChange={(e) => handleChange('aggregation', e.target.value as any)}
                        className={`w-full rounded-md border ${inputBorder} ${inputBg} px-3 py-2`}
                      >
                        <option value="sum">Sum</option>
                        <option value="average">Average</option>
                        <option value="count">Count</option>
                        <option value="max">Maximum</option>
                        <option value="min">Minimum</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Limit Results</label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="5"
                        max="50"
                        step="5"
                        value={config.limit || 10}
                        onChange={(e) => handleChange('limit', parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <span className="w-12 text-center">{config.limit}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includeOthers"
                      checked={config.includeOthers}
                      onChange={(e) => handleChange('includeOthers', e.target.checked)}
                      className="rounded text-purple-500 focus:ring-purple-500"
                    />
                    <label htmlFor="includeOthers">Include "Others" category for remaining items</label>
                  </div>
                </div>
              )}
            </div>

            {/* Year Range */}
            <div className={`border ${borderColor} rounded-md overflow-hidden`}>
              <button
                className={`w-full flex items-center justify-between p-3 text-left ${
                  activeSection === 'yearRange' ? activeSectionBg : ''
                }`}
                onClick={() => toggleSection('yearRange')}
              >
                <span className="font-medium">Year Range</span>
                {activeSection === 'yearRange' ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
              
              {activeSection === 'yearRange' && (
                <div className="p-3 space-y-3 border-t ${borderColor}">
                  <YearRangeSlider
                    startYear={startYear}
                    endYear={endYear}
                    value={config.yearRange || [startYear, endYear]}
                    onChange={(range) => handleChange('yearRange', range)}
                  />
                </div>
              )}
            </div>

            {/* Color Scheme */}
            <div className={`border ${borderColor} rounded-md overflow-hidden`}>
              <button
                className={`w-full flex items-center justify-between p-3 text-left ${
                  activeSection === 'colors' ? activeSectionBg : ''
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
                            ? 'bg-purple-100 dark:bg-purple-800/30'
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
                          <Check className="w-4 h-4 ml-2 text-purple-500" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Data Selection */}
            {dataFields.length > 0 && (
              <div className={`border ${borderColor} rounded-md overflow-hidden`}>
                <button
                  className={`w-full flex items-center justify-between p-3 text-left ${
                    activeSection === 'data' ? activeSectionBg : ''
                  }`}
                  onClick={() => toggleSection('data')}
                >
                  <span className="font-medium">Data Selection</span>
                  {activeSection === 'data' ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
                
                {activeSection === 'data' && (
                  <div className="p-3 space-y-3 border-t ${borderColor}">
                    <div>
                      <label className="block text-sm font-medium mb-1">Select Fields</label>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {dataFields.map((field) => (
                          <label key={field} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={config.selectedFields?.includes(field) ?? true}
                              onChange={(e) => {
                                const currentFields = config.selectedFields || [...dataFields];
                                const newFields = e.target.checked
                                  ? [...currentFields, field]
                                  : currentFields.filter((f) => f !== field);
                                handleChange('selectedFields', newFields);
                              }}
                              className="rounded text-purple-500 focus:ring-purple-500"
                            />
                            <span>{field}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Sort By</label>
                      <select
                        value={config.sortBy || ''}
                        onChange={(e) => handleChange('sortBy', e.target.value || undefined)}
                        className={`w-full rounded-md border ${inputBorder} ${inputBg} px-3 py-2`}
                      >
                        <option value="">No sorting</option>
                        {dataFields.map((field) => (
                          <option key={field} value={field}>
                            {field}
                          </option>
                        ))}
                      </select>
                    </div>

                    {config.sortBy && (
                      <div>
                        <label className="block text-sm font-medium mb-1">Sort Direction</label>
                        <div className="flex space-x-2">
                          <button
                            className={`flex-1 py-2 px-3 rounded-md text-sm ${
                              config.sortDirection !== 'desc'
                                ? 'bg-purple-500 text-white'
                                : `${inputBg} hover:bg-gray-200 dark:hover:bg-gray-600`
                            }`}
                            onClick={() => handleChange('sortDirection', 'asc')}
                          >
                            Ascending
                          </button>
                          <button
                            className={`flex-1 py-2 px-3 rounded-md text-sm ${
                              config.sortDirection === 'desc'
                                ? 'bg-purple-500 text-white'
                                : `${inputBg} hover:bg-gray-200 dark:hover:bg-gray-600`
                            }`}
                            onClick={() => handleChange('sortDirection', 'desc')}
                          >
                            Descending
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Preview Panel */}
          {previewMode && (
            <div className="w-1/3 border-l border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Preview</h3>
                <button 
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 h-64 flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <p>Chart preview will appear here</p>
                  <p className="text-sm mt-2">Apply changes to see preview</p>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="font-medium mb-2">Configuration Summary</h4>
                <div className="space-y-1 text-sm">
                  <div><span className="font-medium">Chart Type:</span> {config.chartType}</div>
                  {config.xAxis && <div><span className="font-medium">X-Axis:</span> {config.xAxis}</div>}
                  {config.yAxis && <div><span className="font-medium">Y-Axis:</span> {config.yAxis}</div>}
                  {config.groupBy && <div><span className="font-medium">Group By:</span> {config.groupBy}</div>}
                  {config.yearRange && (
                    <div><span className="font-medium">Year Range:</span> {config.yearRange[0]} - {config.yearRange[1]}</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end p-4 border-t border-purple-500 space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
          >
            Apply Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedChartConfig;
