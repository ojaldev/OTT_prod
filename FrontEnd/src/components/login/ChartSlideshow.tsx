import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Import chart preview images
import genreTrends from '../../ChartImages/genre-trends-over-time-chart.png';
import platformDistribution from '../../ChartImages/platform-distribution-chart (1).png';
import languageStats from '../../ChartImages/language-statistics-chart (1).png';
import platformGrowth from '../../ChartImages/platform-growth-over-time-chart.png';
import dubbingLanguages from '../../ChartImages/dubbing-language-analysis-chart.png';
import yearlyReleases from '../../ChartImages/yearly-content-releases-chart.png';

interface Slide {
  src: string;
  alt: string;
  caption: string;
}

interface ChartSlideshowProps {
  intervalMs?: number;
  className?: string;
  height?: number | string;
}

const ChartSlideshow: React.FC<ChartSlideshowProps> = ({ intervalMs = 3500, className = '', height = 360 }) => {
  const slides: Slide[] = useMemo(() => [
    { src: platformDistribution, alt: 'Platform distribution chart', caption: 'Platform Distribution' },
    { src: genreTrends, alt: 'Genre trends over time chart', caption: 'Genre Trends Over Time' },
    { src: languageStats, alt: 'Language statistics chart', caption: 'Language Statistics' },
    { src: platformGrowth, alt: 'Platform growth over time chart', caption: 'Platform Growth' },
    { src: dubbingLanguages, alt: 'Top dubbed languages chart', caption: 'Top Dubbed Languages' },
    { src: yearlyReleases, alt: 'Yearly content releases chart', caption: 'Yearly Releases' },
  ], []);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<number | null>(null);

  const next = () => setIndex((i) => (i + 1) % slides.length);
  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
  const goTo = (i: number) => setIndex(i % slides.length);

  useEffect(() => {
    if (paused) return;
    timerRef.current && window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, intervalMs);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [intervalMs, slides.length, paused]);

  return (
    <div
      className={`relative overflow-hidden rounded-xl shadow-lg bg-gradient-to-br from-blue-50/40 to-indigo-50/30 dark:from-slate-800 dark:to-slate-900 ${className}`}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Analytics chart previews"
    >
      {/* Slides */}
      <div className="absolute inset-0">
        {slides.map((s, i) => (
          <img
            key={i}
            src={s.src}
            alt={s.alt}
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-700 ease-in-out ${i === index ? 'opacity-100' : 'opacity-0'}`}
            loading={i === 0 ? 'eager' : 'lazy'}
            draggable={false}
          />
        ))}
        {/* Soft vignette overlay for better contrast */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/30 via-transparent to-black/10" />
      </div>

      {/* Caption */}
      <div className="absolute left-4 right-4 bottom-4 flex items-center justify-between">
        <div className="px-3 py-1.5 rounded-md backdrop-blur bg-black/40 text-white text-sm" aria-live="polite">
          {slides[index]?.caption}
        </div>
        {/* Dots */}
        <div className="flex items-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-2.5 rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'w-2.5 bg-white/60 hover:bg-white/80'}`}
              aria-label={`Go to slide ${i + 1}`}
            />)
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2">
        <button
          onClick={prev}
          className="p-2 rounded-full bg-black/35 text-white hover:bg-black/45 focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={next}
          className="p-2 rounded-full bg-black/35 text-white hover:bg-black/45 focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChartSlideshow;
