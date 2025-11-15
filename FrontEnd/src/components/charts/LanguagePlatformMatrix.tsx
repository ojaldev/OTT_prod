import React, { useEffect, useMemo, useRef, useState } from 'react';
import { analyticsService } from '../../services/analytics';
import { AnalyticsFilters } from '../../types/Chart';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import { useTheme } from '../../context/ThemeContext';
import ChartToolbar from './ChartToolbar';

interface LanguagePlatformMatrixProps {
  filters?: AnalyticsFilters;
  height?: number;
}

interface MatrixItem {
  count: number;
  language: string;
  platform: string;
}

const LanguagePlatformMatrix: React.FC<LanguagePlatformMatrixProps> = ({ filters, height = 400 }) => {
  const { theme } = useTheme();
  const [items, setItems] = useState<MatrixItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        // Pass filters directly to API for server-side filtering
        const response = await analyticsService.getLanguagePlatformMatrix(filters);
        const raw: any = (response as any)?.data ?? response;
        const arr: MatrixItem[] = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
        const data = arr || [];

        setItems(data);
      } catch (e: any) {
        setError(e?.message || 'Failed to load language-platform matrix');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [JSON.stringify(filters)]);

  const { languages, platforms, matrix, min, max } = useMemo(() => {
    const lSet = new Set<string>();
    const pSet = new Set<string>();
    items.forEach(i => { lSet.add(i.language); pSet.add(i.platform); });

    const platforms = Array.from(pSet).sort((a, b) => a.localeCompare(b));

    // Sort languages by total count desc
    const totals = new Map<string, number>();
    items.forEach(i => totals.set(i.language, (totals.get(i.language) || 0) + i.count));
    const languages = Array.from(lSet).sort((a, b) => (totals.get(b) || 0) - (totals.get(a) || 0));

    const map = new Map<string, number>();
    items.forEach(i => map.set(`${i.language}__${i.platform}`, i.count));

    const matrix: number[][] = languages.map(lang => platforms.map(p => map.get(`${lang}__${p}`) || 0));

    let min = Infinity, max = -Infinity;
    matrix.forEach(row => row.forEach(v => { min = Math.min(min, v); max = Math.max(max, v); }));
    if (!isFinite(min)) min = 0;
    if (!isFinite(max)) max = 0;

    return { languages, platforms, matrix, min, max };
  }, [items]);

  const ratio = (v: number) => {
    if (max === min) return v > 0 ? 1 : 0;
    return (v - min) / (max - min);
  };

  // Theme-aware teal scale for good contrast in both modes
  const h = 190; // teal hue
  const s = 70;  // saturation
  const lStart = theme === 'dark' ? 20 : 96; // lightness for low values
  const lEnd = theme === 'dark' ? 54 : 42;   // lightness for high values

  const lightnessForValue = (v: number) => {
    const r = ratio(v);
    return Math.round(lStart + (lEnd - lStart) * r);
  };

  const cellBg = (v: number) => `hsl(${h} ${s}% ${lightnessForValue(v)}%)`;

  const cellText = (v: number) => {
    const l = lightnessForValue(v);
    return l < 45 ? 'text-white' : (theme === 'dark' ? 'text-gray-100' : 'text-gray-900');
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;
  if (!items || items.length === 0) return (
    <EmptyState
      title="No data for the selected filters"
      description="Try broadening your date range, removing some filters, or selecting additional platforms/genres/languages."
    />
  );

  const cardBg = theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200';
  const titleColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const secondary = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';

  const handleDownload = async () => {
    const el = cardRef.current;
    if (!el) return;
    const scroller = scrollRef.current;
    const prevMaxHeight = scroller?.style.maxHeight;
    const prevOverflow = scroller?.style.overflow;
    if (scroller) {
      scroller.style.maxHeight = 'none';
      scroller.style.overflow = 'visible';
    }
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(el, { cacheBust: true, backgroundColor: theme === 'dark' ? '#111827' : '#ffffff' });
      const link = document.createElement('a');
      link.download = 'language-platform-matrix.png';
      link.href = dataUrl;
      link.click();
    } catch {
      // ignore
    } finally {
      if (scroller) {
        scroller.style.maxHeight = prevMaxHeight || '';
        scroller.style.overflow = prevOverflow || '';
      }
    }
  };

  return (
    <>
      <div
        ref={cardRef}
        className={`${isFullscreen ? 'fixed inset-0 z-50 p-6' : 'rounded-lg p-4'} shadow-md border ${cardBg}`}
        data-chart-card="true"
        data-chart-title="Language-Platform Matrix"
      >
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className={`text-lg font-semibold ${titleColor}`}>Language-Platform Matrix</h3>
            <p className={`text-sm ${secondary}`}>Counts of content across Languages (rows) and Platforms (columns)</p>
          </div>
          <ChartToolbar
            onDownload={handleDownload}
            onToggleInfo={() => setShowInfo(v => !v)}
            onToggleFullscreen={() => setIsFullscreen(v => !v)}
            showInfo={showInfo}
            isFullscreen={isFullscreen}
          />
        </div>

        {showInfo && (
          <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
            <div className="flex justify-between items-start">
              <p className={`text-sm ${secondary}`}>Matrix of content counts per language and platform. Darker cells indicate higher counts.</p>
              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" onClick={() => setShowInfo(false)} aria-label="Close info">✕</button>
            </div>
          </div>
        )}

        <div
          ref={scrollRef}
          className="overflow-auto"
          data-scrollable="true"
          style={{ maxHeight: `${isFullscreen ? 'calc(100vh - 220px)' : `${height}px`}` }}
        >
          <div className="inline-block min-w-full align-middle">
            {/* Header row: empty corner + platform headers */}
            <div className="grid" style={{ gridTemplateColumns: `180px repeat(${platforms.length}, minmax(100px, 1fr))` }}>
              <div className="sticky left-0 z-10 bg-transparent" />
              {platforms.map((p) => (
                <div key={`ph-${p}`} className="px-2 py-2 text-xs font-medium text-center sticky top-0 bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
                  {p}
                </div>
              ))}
              {/* Body rows */}
              {languages.map((lang, ri) => (
                <React.Fragment key={`row-${lang}`}>
                  <div className="px-2 py-2 text-xs sm:text-sm font-medium sticky left-0 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-10">
                    {lang}
                  </div>
                  {platforms.map((p, ci) => {
                    const v = matrix[ri][ci];
                    return (
                      <div
                        key={`cell-${lang}-${p}`}
                        className={`px-2 py-3 text-center text-sm border border-white/40 dark:border-black/20 ${cellText(v)}`}
                        style={{ backgroundColor: cellBg(v) }}
                        title={`${lang} × ${p}: ${v}`}
                      >
                        {v}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 flex items-center gap-3">
          <span className={`text-xs ${secondary}`}>Low</span>
          <div
            className="flex-1 h-2 rounded"
            style={{ background: `linear-gradient(90deg, hsl(${h} ${s}% ${lStart}%), hsl(${h} ${s}% ${lEnd}%))` }}
          />
          <span className={`text-xs ${secondary}`}>High</span>
          <span className={`text-xs ${secondary}`}>({min} - {max})</span>
        </div>
      </div>
      {isFullscreen && <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsFullscreen(false)} />}
    </>
  );
};

export default LanguagePlatformMatrix;
