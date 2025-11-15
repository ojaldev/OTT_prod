import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BarChart2, PieChart, TrendingUp, Grid } from 'lucide-react';
import PreviewChart from './PreviewChart';

interface LivePreviewChartsProps {
  className?: string;
  height?: number;
}

type TabKey = 'monthly-release-trend' | 'platform-distribution' | 'genre-trends' | 'language-platform-matrix';

const TABS: Array<{ key: TabKey; label: string; icon: React.ReactNode; desc: string }> = [
  { key: 'monthly-release-trend', label: 'Releases', icon: <TrendingUp className="w-4 h-4" />, desc: 'Monthly release trend' },
  { key: 'platform-distribution', label: 'Platforms', icon: <PieChart className="w-4 h-4" />, desc: 'Distribution by platform' },
  { key: 'genre-trends', label: 'Genres', icon: <BarChart2 className="w-4 h-4" />, desc: 'Popular genres over time' },
  { key: 'language-platform-matrix', label: 'Languages', icon: <Grid className="w-4 h-4" />, desc: 'Language availability' },
];

const LivePreviewCharts: React.FC<LivePreviewChartsProps> = ({ className = '', height = 260 }) => {
  const [active, setActive] = useState<TabKey>('monthly-release-trend');
  const [showAll, setShowAll] = useState(false);
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Lazy-mount when scrolled into view
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { root: null, threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const tabs = useMemo(() => TABS, []);

  return (
    <div ref={containerRef} className={`rounded-xl border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur p-4 ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => { setActive(t.key); setShowAll(false); }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors border ${active === t.key && !showAll ? 'bg-blue-600 text-white border-blue-600' : 'bg-transparent text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              aria-pressed={active === t.key && !showAll}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowAll((v) => !v)}
          className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${showAll ? 'bg-indigo-600 text-white border-indigo-600' : 'text-indigo-600 border-indigo-300 hover:bg-indigo-50 dark:text-indigo-400 dark:border-indigo-700 dark:hover:bg-indigo-900/30'}`}
          aria-pressed={showAll}
        >
          {showAll ? 'Single view' : 'View all'}
        </button>
      </div>

      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
        {showAll ? 'Quick glance at multiple insights' : tabs.find(t => t.key === active)?.desc}
      </p>

      {!inView ? (
        <div style={{ height }} className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
          Loading preview…
        </div>
      ) : showAll ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg p-2 bg-gray-50 dark:bg-gray-800/50">
            <PreviewChart chartType="monthly-release-trend" title="Content Release Trends" height={height} />
          </div>
          <div className="rounded-lg p-2 bg-gray-50 dark:bg-gray-800/50">
            <PreviewChart chartType="platform-distribution" title="Platform Distribution" height={height} />
          </div>
          <div className="rounded-lg p-2 bg-gray-50 dark:bg-gray-800/50">
            <PreviewChart chartType="genre-trends" title="Popular Genre Trends" height={height} />
          </div>
          <div className="rounded-lg p-2 bg-gray-50 dark:bg-gray-800/50">
            <PreviewChart chartType="language-platform-matrix" title="Language Availability" height={height} />
          </div>
        </div>
      ) : (
        <div className="rounded-lg p-2 bg-gray-50 dark:bg-gray-800/50">
          {active === 'monthly-release-trend' && (
            <PreviewChart chartType="monthly-release-trend" title="Content Release Trends" height={height} />
          )}
          {active === 'platform-distribution' && (
            <PreviewChart chartType="platform-distribution" title="Platform Distribution" height={height} />
          )}
          {active === 'genre-trends' && (
            <PreviewChart chartType="genre-trends" title="Popular Genre Trends" height={height} />
          )}
          {active === 'language-platform-matrix' && (
            <PreviewChart chartType="language-platform-matrix" title="Language Availability" height={height} />
          )}
        </div>
      )}
    </div>
  );
};

export default LivePreviewCharts;
