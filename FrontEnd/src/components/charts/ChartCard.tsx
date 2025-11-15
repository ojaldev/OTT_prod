import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  PieChart, 
  LineChart, 
  Download, 
  Settings, 
  Info, 
  Maximize2, 
  X
} from 'lucide-react';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';
import ChartConfigPanel, { ChartConfig } from './ChartConfigPanel';
import logger from '../../utils/logger';

export type ChartType = 'bar' | 'line' | 'pie' | 'doughnut';

interface ChartCardProps {
  title: string;
  description?: string;
  chartData: any;
  chartOptions?: any;
  height?: number;
  allowedChartTypes?: ChartType[];
  defaultChartType?: ChartType;
  onConfigChange?: (config: any) => void;
  className?: string;
  // Controls how legend items are generated for bar/line charts
  // 'xAxis' => legend items are x-axis categories (e.g., years)
  // 'dataset' => legend items are datasets (e.g., genres)
  legendMode?: 'xAxis' | 'dataset';
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  description,
  chartData,
  chartOptions = {},
  height = 300,
  allowedChartTypes = ['bar', 'line', 'pie', 'doughnut'],
  defaultChartType = 'bar',
  onConfigChange,
  className = '',
  legendMode = 'xAxis',
}) => {
  const { theme } = useTheme();
  const [chartType, setChartType] = useState<ChartType>(defaultChartType);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  
  // Log component initialization
  useEffect(() => {
    logger.debug(`ChartCard: ${title} initialized`, {
      chartType: defaultChartType,
      hasData: !!chartData
    });
    
    return () => {
      logger.debug(`ChartCard: ${title} unmounted`);
    };
  }, [title, defaultChartType, chartData]);
  

  const chartTypeIcons = {
    bar: <BarChart3 className="w-4 h-4" />,
    line: <LineChart className="w-4 h-4" />,
    pie: <PieChart className="w-4 h-4" />,
    doughnut: <PieChart className="w-4 h-4" />
  };

  const handleDownload = () => {
    logger.info(`ChartCard: Downloading ${title} chart`);
    const canvas = document.getElementById(`chart-${title.replace(/\s+/g, '-').toLowerCase()}`) as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement('a');
      const filename = `${title.replace(/\s+/g, '-').toLowerCase()}-chart.png`;
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
      logger.debug(`ChartCard: Downloaded ${title} chart as ${filename}`);
    } else {
      logger.warn(`ChartCard: Failed to download ${title} chart - canvas not found`);
    }
  };
  
  const handleConfigChange = (config: ChartConfig) => {
    logger.info(`ChartCard: ${title} configuration changed`, { config });
    
    if ('chartType' in config) {
      setChartType(config.chartType);
      logger.debug(`ChartCard: ${title} chart type changed to ${config.chartType}`);
    }
    
    // Apply configuration changes that affect chart options
    if (onConfigChange) {
      const updatedConfig = {
        ...config,
        // Only pass implementable configurations
        chartType: config.chartType,
        showLegend: config.showLegend,
        legendPosition: config.legendPosition,
        enableAnimation: config.enableAnimation,
        colorScheme: config.colorScheme
      };
      onConfigChange(updatedConfig);
    }
  };

  const toggleFullscreen = () => {
    const newState = !isFullscreen;
    setIsFullscreen(newState);
    logger.debug(`ChartCard: ${title} ${newState ? 'entered' : 'exited'} fullscreen mode`);
  };

  const renderChart = () => {
    logger.debug(`ChartCard: Rendering ${title} as ${chartType} chart`);
    const baseOptions = {
      ...chartOptions,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        ...chartOptions.plugins,
        tooltip: {
          ...chartOptions.plugins?.tooltip,
          backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          titleColor: theme === 'dark' ? '#fff' : '#000',
          bodyColor: theme === 'dark' ? '#fff' : '#000',
          borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
          borderWidth: 1,
          padding: 12,
          boxPadding: 6,
          usePointStyle: true,
          boxWidth: 8,
          boxHeight: 8,
          cornerRadius: 4,
        },
        legend: {
          ...chartOptions.plugins?.legend,
          ...((chartType === 'bar' || chartType === 'line') && legendMode === 'xAxis' ? {
            // Custom click: toggle visibility of x-axis category across all datasets
            onClick: (_e: any, legendItem: any, legend: any) => {
              const chart = legend.chart as any;
              const key = String(legendItem.text);

              // Initialize hidden set and original data snapshot
              chart.$hiddenXKeys = chart.$hiddenXKeys || new Set<string>();
              const hiddenSet: Set<string> = chart.$hiddenXKeys;
              if (hiddenSet.has(key)) hiddenSet.delete(key); else hiddenSet.add(key);

              if (!chart.$originalData) {
                chart.$originalData = (chart.data.datasets || []).map((ds: any) =>
                  Array.isArray(ds.data)
                    ? ds.data.map((d: any) => (d && typeof d === 'object' ? { ...d } : d))
                    : ds.data
                );
              }

              const original = chart.$originalData as any[];
              const datasets = chart.data.datasets || [];
              const labels: any[] = Array.isArray(chart.data.labels) ? chart.data.labels : [];

              datasets.forEach((ds: any, di: number) => {
                const orig = original[di] || ds.data;
                if (labels.length && Array.isArray(orig)) {
                  // Category scale: use indices
                  ds.data = orig.map((v: any, i: number) => (hiddenSet.has(String(labels[i])) ? NaN : v));
                } else if (Array.isArray(orig)) {
                  // Linear x with objects {x,y}
                  ds.data = orig.map((pt: any) => {
                    if (pt && typeof pt === 'object' && 'x' in pt) {
                      return String(pt.x) === key ? { ...pt, y: NaN } : pt;
                    }
                    return pt;
                  });
                }
              });

              chart.update();
            }
          } : {}),
          labels: {
            ...chartOptions.plugins?.legend?.labels,
            color: theme === 'dark' ? '#fff' : '#000',
            usePointStyle: true,
            padding: 20,
            // For line and bar charts, generate legend items from x-axis labels
            ...((chartType === 'bar' || chartType === 'line') && legendMode === 'xAxis' ? {
              generateLabels: (chart: any) => {
                try {
                  const data = chart.data || {};
                  let labels: any[] = Array.isArray(data.labels) && data.labels.length ? data.labels : [];

                  // If labels are not provided (e.g., linear x scale), derive from dataset x values
                  if ((!labels || labels.length === 0) && data.datasets?.length) {
                    const xSet = new Set<any>();
                    data.datasets.forEach((ds: any) => {
                      (ds.data || []).forEach((pt: any) => {
                        if (pt && typeof pt === 'object' && 'x' in pt) {
                          xSet.add(pt.x);
                        }
                      });
                    });
                    labels = Array.from(xSet);
                    // Sort numerically if all values are numeric
                    if (labels.every((v: any) => !isNaN(parseFloat(v)))) {
                      labels = labels.map((v: any) => +v).sort((a: number, b: number) => a - b);
                    }
                  }

                  // Build a simple, readable color palette for legend items
                  const palette = [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                    '#9966FF', '#FF9F40', '#C9CBCF', '#8BC34A',
                    '#E91E63', '#00BCD4', '#9C27B0', '#F44336'
                  ];

                  const hiddenSet: Set<string> = chart.$hiddenXKeys || new Set<string>();
                  return (labels || []).map((label: any, i: number) => {
                    return {
                      text: String(label),
                      fillStyle: palette[i % palette.length],
                      strokeStyle: palette[i % palette.length],
                      lineWidth: 2,
                      hidden: hiddenSet.has(String(label)),
                      datasetIndex: 0,
                    };
                  });
                } catch (e) {
                  return [];
                }
              }
            } : {})
          },
        },
      },
      scales: chartType === 'bar' || chartType === 'line' ? {
        ...chartOptions.scales,
        x: {
          ...chartOptions.scales?.x,
          grid: {
            ...chartOptions.scales?.x?.grid,
            color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          },
          ticks: {
            ...chartOptions.scales?.x?.ticks,
            color: theme === 'dark' ? '#fff' : '#000',
          },
        },
        y: {
          ...chartOptions.scales?.y,
          grid: {
            ...chartOptions.scales?.y?.grid,
            color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          },
          ticks: {
            ...chartOptions.scales?.y?.ticks,
            color: theme === 'dark' ? '#fff' : '#000',
          },
        },
      } : undefined,
    };

    const chartProps = {
      data: chartData,
      options: baseOptions,
      id: `chart-${title.replace(/\s+/g, '-').toLowerCase()}`,
    };

    switch (chartType) {
      case 'bar':
        return <Bar {...chartProps} />;
      case 'line':
        return <Line {...chartProps} />;
      case 'pie':
        return <Pie {...chartProps} />;
      case 'doughnut':
        return <Doughnut {...chartProps} />;
      default:
        return <Bar {...chartProps} />;
    }
  };

  const cardClasses = `
    ${isFullscreen ? 'fixed inset-0 z-50 flex flex-col p-6' : 'rounded-lg shadow-md p-4'}
    ${theme === 'dark' ? 'bg-gray-900 text-white border border-gray-700' : 'bg-white text-gray-900 border border-gray-200'}
    ${className}
  `;

  const overlayClasses = `
    fixed inset-0 bg-black bg-opacity-50 z-40
    ${isFullscreen ? 'block' : 'hidden'}
  `;

  return (
    <>
      <div className={cardClasses} data-chart-card="true" data-chart-title={title}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="flex space-x-1">
            {allowedChartTypes.length > 1 && allowedChartTypes.map((type) => (
              <button
                key={type}
                onClick={() => setChartType(type)}
                className={`p-1.5 rounded ${chartType === type ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                title={`Switch to ${type} chart`}
              >
                {chartTypeIcons[type]}
              </button>
            ))}
            <button 
              onClick={handleDownload} 
              className="p-1.5 rounded text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Download chart"
            >
              <Download className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setShowConfigPanel(true)}
              className="p-1.5 rounded text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Configure chart"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setShowInfo(!showInfo)} 
              className={`p-1.5 rounded ${showInfo ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              title="Show information"
            >
              <Info className="w-4 h-4" />
            </button>
            <button 
              onClick={toggleFullscreen} 
              className="p-1.5 rounded text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              title={isFullscreen ? 'Exit fullscreen' : 'View fullscreen'}
            >
              {isFullscreen ? <X className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {showInfo && description && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
            <div className="flex justify-between items-start">
              <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
              <button 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                onClick={() => setShowInfo(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div 
          className="flex-1" 
          style={{ height: isFullscreen ? 'calc(100% - 100px)' : `${height}px` }}
        >
          {renderChart()}
        </div>
      </div>
      <div className={overlayClasses} onClick={toggleFullscreen} />
      
      {/* Chart Configuration Panel */}
      <ChartConfigPanel
        isOpen={showConfigPanel}
        onClose={() => setShowConfigPanel(false)}
        onApply={handleConfigChange}
        initialConfig={{
          chartType,
          showLegend: chartOptions?.plugins?.legend?.display !== false,
          legendPosition: chartOptions?.plugins?.legend?.position || 'bottom',
          enableAnimation: chartOptions?.animation !== false,
          colorScheme: 'default'
        }}
        availableChartTypes={allowedChartTypes}
      />
      
    </>
  );
};

export default ChartCard;
