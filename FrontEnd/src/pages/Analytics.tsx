import React, { useState } from 'react';
import { RefreshCw, Download, Grid, Layout } from 'lucide-react';
import { Chart as ChartJS } from 'chart.js';
import { toPng } from 'html-to-image';
import PlatformDistribution from '../components/charts/PlatformDistribution';
import GenreTrends from '../components/charts/GenreTrends';
import LanguageStats from '../components/charts/LanguageStats';
import YearlyReleases from '../components/charts/YearlyReleases';
import DubbingAnalysis from '../components/charts/DubbingAnalysis';
import PlatformGrowth from '../components/charts/PlatformGrowth';
import GenrePlatformHeatmap from '../components/charts/GenrePlatformHeatmap';
import LanguagePlatformMatrix from '../components/charts/LanguagePlatformMatrix';
import DurationByFormatGenre from '../components/charts/DurationByFormatGenre';
import TopDubbedLanguages from '../components/charts/TopDubbedLanguages';
import Button from '../components/common/Button';
import { AnalyticsFilters } from '../types/Chart';
import { useTheme } from '../context/ThemeContext';
import AnalyticsFilterPanel from '../components/analytics/AnalyticsFilterPanel';

const Analytics: React.FC = () => {
  const { theme } = useTheme();
  const [filters, setFilters] = useState<AnalyticsFilters>({});
  const [layout, setLayout] = useState<'grid' | 'stacked'>('grid');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  
  const refreshData = () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };
  
  const exportCSV = () => {
    try {
      const canvases = Array.from(document.querySelectorAll('canvas[id^="chart-"]')) as HTMLCanvasElement[];
      let csv = '';
      const sep = ',';

      canvases.forEach((canvas, idx) => {
        const chart = ChartJS.getChart(canvas);
        if (!chart) return;
        const titleSlug = canvas.id.replace(/^chart-/, '');
        const title = titleSlug
          .split('-')
          .map(s => s.charAt(0).toUpperCase() + s.slice(1))
          .join(' ');

        const labels = Array.isArray(chart.data.labels) ? chart.data.labels : [];
        const datasets = chart.data.datasets || [];

        // Section header
        if (idx > 0) csv += '\n';
        csv += `"${title}"\n`;

        // Header row
        const header = ['Label', ...datasets.map((ds: any) => `"${ds.label ?? 'Series'}"`)];
        csv += header.join(sep) + '\n';

        // Rows: assume category scale or aligned arrays
        const rows = labels.map((label: any, i: number) => {
          const vals = datasets.map((ds: any) => {
            const v = Array.isArray(ds.data) ? ds.data[i] : undefined;
            const num = typeof v === 'number' ? v : (v && typeof v === 'object' && 'y' in v ? v.y : '');
            return num === undefined ? '' : String(num);
          });
          return [`"${String(label)}"`, ...vals].join(sep);
        });
        csv += rows.join('\n') + '\n';
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const ts = new Date();
      const tsStr = `${ts.getFullYear()}-${String(ts.getMonth() + 1).padStart(2, '0')}-${String(ts.getDate()).padStart(2, '0')}_${String(ts.getHours()).padStart(2, '0')}${String(ts.getMinutes()).padStart(2, '0')}`;
      a.href = url;
      a.download = `analytics-export-${tsStr}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('CSV export failed', e);
      alert('Failed to export CSV.');
    }
  };

  const exportPDF = async () => {
    try {
      // Prefer explicit chart card containers; fallback to canvases if not found
      let containers = Array.from(document.querySelectorAll('[data-chart-card="true"]')) as HTMLElement[];
      if (!containers.length) {
        const canvases = Array.from(document.querySelectorAll('canvas[id^="chart-"]')) as HTMLCanvasElement[];
        containers = canvases
          .map(cv => (cv.closest('[data-chart-card="true"], .rounded-lg') as HTMLElement) || (cv.parentElement as HTMLElement))
          .filter((el): el is HTMLElement => !!el);
      }
      if (!containers.length) return alert('No charts to export');

      // Capture each chart card as image; temporarily expand any internal scroll areas
      const images: { dataUrl: string; width: number; height: number }[] = [];
      for (const container of containers) {
        const scrollables = Array.from(container.querySelectorAll('[data-scrollable="true"]')) as HTMLElement[];
        const prevStyles = scrollables.map(el => ({ el, maxHeight: el.style.maxHeight, overflow: el.style.overflow }));
        scrollables.forEach(el => {
          el.style.maxHeight = 'none';
          el.style.overflow = 'visible';
        });

        try {
          const dataUrl = await toPng(container, {
            cacheBust: true,
            backgroundColor: document.body.classList.contains('dark') ? '#111827' : '#ffffff',
          });
          const img = new Image();
          await new Promise<void>((resolve) => { img.onload = () => resolve(); img.src = dataUrl; });
          images.push({ dataUrl, width: img.width, height: img.height });
        } finally {
          prevStyles.forEach(({ el, maxHeight, overflow }) => { el.style.maxHeight = maxHeight; el.style.overflow = overflow; });
        }
      }

      // Dynamic import jsPDF to avoid bundling if unused
      let jsPDFMod: any;
      try {
        jsPDFMod = await import('jspdf');
      } catch (e) {
        alert('PDF exporter (jspdf) is not installed. Please install it first.');
        return;
      }
      const { jsPDF } = jsPDFMod;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10; // mm
      let y = margin;

      for (let i = 0; i < images.length; i++) {
        const { dataUrl, width, height } = images[i];
        const scaledWidth = pageWidth - margin * 2;
        const scale = scaledWidth / width;
        const scaledHeight = height * scale;

        if (y + scaledHeight > pageHeight - margin) {
          pdf.addPage();
          y = margin;
        }
        pdf.addImage(dataUrl, 'PNG', margin, y, scaledWidth, scaledHeight);
        y += scaledHeight + 6; // spacing
      }

      const ts = new Date();
      const tsStr = `${ts.getFullYear()}-${String(ts.getMonth() + 1).padStart(2, '0')}-${String(ts.getDate()).padStart(2, '0')}_${String(ts.getHours()).padStart(2, '0')}${String(ts.getMinutes()).padStart(2, '0')}`;
      pdf.save(`analytics-export-${tsStr}.pdf`);
    } catch (e) {
      console.error('PDF export failed', e);
      alert('Failed to export PDF.');
    }
  };

  

  // Apply theme-based styling
  const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${cardBg} rounded-lg shadow-md p-6 border border-purple-500 dark:border-purple-700`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className={`text-3xl font-bold ${textColor} flex items-center`}>
              <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">Analytics Dashboard</span>
            </h1>
            <p className={`${textSecondary} mt-2`}>Detailed insights and trends analysis</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={refreshData}
              className="flex items-center space-x-1 border-purple-500 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            
            <div className="bg-gray-100 dark:bg-gray-700 rounded-md p-1 flex">
              <button
                className={`p-1 rounded ${layout === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-600 dark:text-gray-300'}`}
                onClick={() => setLayout('grid')}
                aria-label="Grid layout"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                className={`p-1 rounded ${layout === 'stacked' ? 'bg-purple-600 text-white' : 'text-gray-600 dark:text-gray-300'}`}
                onClick={() => setLayout('stacked')}
                aria-label="Stacked layout"
              >
                <Layout className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Filter Panel */}
      <AnalyticsFilterPanel
        filters={filters}
        onFiltersChange={setFilters}
        availableFilters={{
          platform: true,
          type: true,
          genre: true,
          language: true,
          year: true,
          yearRange: true,
          dateRange: true,
          ageRating: true,
          source: true,
          duration: true,
          popularity: true,
          dubbing: true,
          seasons: true,
          sorting: true,
          pagination: true,
          grouping: true,
        }}
      />

      {/* Charts Grid */}
      <div className={layout === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-6'}>
        <PlatformDistribution filters={filters} height={layout === 'grid' ? 400 : 500} />
        <LanguageStats filters={filters} height={layout === 'grid' ? 400 : 500} />
        <TopDubbedLanguages filters={filters} height={layout === 'grid' ? 400 : 500} />
        <YearlyReleases filters={filters} height={layout === 'grid' ? 400 : 500} />
        <PlatformGrowth filters={filters} height={layout === 'grid' ? 400 : 500} />
        <DubbingAnalysis filters={filters} height={layout === 'grid' ? 400 : 500} />
        <div className={layout === 'grid' ? 'lg:col-span-2' : ''}>
          <GenrePlatformHeatmap filters={filters} height={layout === 'grid' ? 480 : 600} />
        </div>
        <div className={layout === 'grid' ? 'lg:col-span-2' : ''}>
          <LanguagePlatformMatrix filters={filters} height={layout === 'grid' ? 480 : 600} />
        </div>
        <div className={layout === 'grid' ? 'lg:col-span-2' : ''}>
          <DurationByFormatGenre filters={filters} height={layout === 'grid' ? 480 : 600} />
        </div>
        <div className={layout === 'grid' ? 'lg:col-span-2' : ''}>
          <GenreTrends filters={filters} height={layout === 'grid' ? 400 : 500} />
        </div>
      </div>
      
      {/* Export Panel */}
      <div className={`${cardBg} rounded-lg shadow-md p-4 border border-purple-500 dark:border-purple-700 flex justify-between items-center`}>
        <div className={textColor}>
          <h3 className="font-medium">Export Analytics Data</h3>
          <p className={`text-sm ${textSecondary}`}>Download the current analytics data in various formats</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={exportCSV}
            className="flex items-center space-x-1 border-purple-500 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
          >
            <Download className="w-4 h-4" />
            <span>CSV</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={exportPDF}
            className="flex items-center space-x-1 border-purple-500 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
          >
            <Download className="w-4 h-4" />
            <span>PDF</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
