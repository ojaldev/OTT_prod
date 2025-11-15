import React, { useEffect, useMemo, useRef, useState } from 'react';
import { analyticsService } from '../../services/analytics';
import { AnalyticsFilters } from '../../types/Chart';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import { useTheme } from '../../context/ThemeContext';
import ChartToolbar from './ChartToolbar';

interface DurationByFormatGenreProps {
  filters?: AnalyticsFilters;
  height?: number;
}

interface DurationItem {
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  count: number;
  format: string;
  genre: string;
}

const DurationByFormatGenre: React.FC<DurationByFormatGenreProps> = ({ filters, height = 420 }) => {
  const { theme } = useTheme();
  const [items, setItems] = useState<DurationItem[]>([]);
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
        const resp = await analyticsService.getDurationByFormatGenre(filters);
        const raw: any = (resp as any)?.data ?? resp;
        const arr: DurationItem[] = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
        const data = arr || [];

        setItems(data);
      } catch (e: any) {
        setError(e?.message || 'Failed to load duration by format/genre');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [JSON.stringify(filters)]);

  const { genres, formats, avgMatrix, min, max } = useMemo(() => {
    const gSet = new Set<string>();
    const fSet = new Set<string>();
    items.forEach(i => { gSet.add(i.genre); fSet.add(i.format); });

    const formats = Array.from(fSet).sort((a, b) => a.localeCompare(b));
    const genres = Array.from(gSet).sort((a, b) => a.localeCompare(b));

    // Build map for avg duration lookup
    const avgMap = new Map<string, number>();

    items.forEach(i => {
      const key = `${i.genre}__${i.format}`;
      avgMap.set(key, i.avgDuration);
      // We could extend to show ranges or tooltips using min/max in future if needed
    });

    const avgMatrix: (number | null)[][] = genres.map(g => formats.map(f => {
      const key = `${g}__${f}`;
      return avgMap.has(key) ? (avgMap.get(key) as number) : null;
    }));

    const presentVals: number[] = [];
    avgMatrix.forEach(row => row.forEach(v => { if (v !== null) presentVals.push(v); }));
    let min = presentVals.length ? Math.min(...presentVals) : 0;
    let max = presentVals.length ? Math.max(...presentVals) : 0;

    return { genres, formats, avgMatrix, min, max };
  }, [items]);

  const ratio = (v: number | null) => {
    if (v === null) return 0;
    if (max === min) return v > 0 ? 1 : 0;
    return (v - min) / (max - min);
  };

  // Theme-aware amber/orange scale
  const h = 32; // warm orange
  const s = 85;
  const lStart = theme === 'dark' ? 22 : 96;
  const lEnd = theme === 'dark' ? 58 : 42;

  const lightnessForValue = (v: number | null) => {
    const r = ratio(v);
    return Math.round(lStart + (lEnd - lStart) * r);
  };

  const cellBg = (v: number | null) => `hsl(${h} ${s}% ${lightnessForValue(v)}%)`;
  const cellText = (v: number | null) => {
    const l = lightnessForValue(v);
    return l < 45 ? 'text-white' : (theme === 'dark' ? 'text-gray-100' : 'text-gray-900');
  };

  const fmt = (v: number | null) => v === null ? '-' : Number.isFinite(v) ? (v >= 10 ? v.toFixed(1) : v.toFixed(2)) : '-';

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
      link.download = 'duration-by-format-genre.png';
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
        data-chart-title="Duration by Format / Genre"
      >
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className={`text-lg font-semibold ${titleColor}`}>Duration by Format / Genre</h3>
            <p className={`text-sm ${secondary}`}>Average duration across Genres (rows) and Formats (columns)</p>
          </div>
          <ChartToolbar
            onDownload={handleDownload}
            onToggleInfo={() => setShowInfo(v => !v)}
            onToggleFullscreen={() => setIsFullscreen(v => !v)}
            showInfo={showInfo}
            isFullscreen={isFullscreen}
          />
        </div>

        <div
          ref={scrollRef}
          className="overflow-auto"
          data-scrollable="true"
          style={{ maxHeight: `${isFullscreen ? 'calc(100vh - 220px)' : `${height}px`}` }}
        >
          <div className="inline-block min-w-full align-middle">
            <div className="grid" style={{ gridTemplateColumns: `180px repeat(${formats.length}, minmax(120px, 1fr))` }}>
              {/* Corner spacer */}
              <div className="sticky left-0 z-10 bg-transparent" />
              {/* Header: formats */}
              {formats.map((f) => (
                <div key={`fh-${f}`} className="px-2 py-2 text-xs font-medium text-center sticky top-0 bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
                  {f}
                </div>
              ))}
              {/* Rows */}
              {genres.map((g, ri) => (
                <React.Fragment key={`row-${g}`}>
                  <div className="px-2 py-2 text-xs sm:text-sm font-medium sticky left-0 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-10">
                    {g}
                  </div>
                  {formats.map((f, ci) => {
                    const v = avgMatrix[ri][ci];
                    return (
                      <div
                        key={`cell-${g}-${f}`}
                        className={`px-2 py-3 text-center text-sm border border-white/40 dark:border-black/20 ${cellText(v)}`}
                        style={{ backgroundColor: cellBg(v) }}
                        title={`${g} × ${f}: ${v === null ? 'no data' : `avg ${v.toFixed(2)}`}`}
                      >
                        {fmt(v)}
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
          <span className={`text-xs ${secondary}`}>({min.toFixed(2)} - {max.toFixed(2)})</span>
        </div>
      </div>
      {isFullscreen && <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsFullscreen(false)} />}
    </>
  );
};

export default DurationByFormatGenre;
