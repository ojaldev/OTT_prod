import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import ChartCard from '../charts/ChartCard';
import LoadingSpinner from '../common/LoadingSpinner';
import { systemService, HealthResponse } from '../../services/system';
import { useTheme } from '../../context/ThemeContext';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const formatUptime = (seconds: number) => {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts = [] as string[];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
};

interface BackendHealthProps {
  height?: number;
}

const BackendHealth: React.FC<BackendHealthProps> = ({ height = 280 }) => {
  const { theme } = useTheme();
  const [data, setData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        setLoading(true);
        setError(null);
        const resp = await systemService.getHealth();
        setData(resp);
      } catch (e: any) {
        setError(typeof e === 'string' ? e : e?.message || 'Failed to load health');
      } finally {
        setLoading(false);
      }
    };
    fetchHealth();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;
  if (!data) return <div className="text-gray-500 text-center p-4">No data</div>;

  const used = Number(data.memory?.used || 0);
  const total = Number(data.memory?.total || 0);
  const free = Math.max(total - used, 0);

  const chartData = {
    labels: ['Used (GB)', 'Free (GB)'],
    datasets: [
      {
        label: 'Memory',
        data: [used, free],
        backgroundColor: [
          '#EF4444', // red-500
          '#10B981', // emerald-500
        ],
        borderColor: theme === 'dark' ? '#111827' : '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const label = ctx.label || '';
            const value = ctx.parsed || 0;
            return `${label}: ${value.toFixed?.(2) ?? value} GB`;
          },
        },
      },
    },
  };

  const infoRowCls = `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4`;
  const infoBoxCls = `rounded-md p-3 ${theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-gray-50 text-gray-800'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`;

  return (
    <div>
      <ChartCard
        title="Backend Health"
        description="Realtime snapshot of backend health. Memory usage shown as used vs free."
        chartData={chartData}
        chartOptions={options}
        height={height}
        allowedChartTypes={["doughnut", "pie"]}
        defaultChartType="doughnut"
        className="p-6 border-emerald-500 dark:border-emerald-700"
      />

      {/* Health details */}
      <div className={infoRowCls}>
        <div className={infoBoxCls}>
          <div className="text-xs opacity-70">Status</div>
          <div className={`font-semibold mt-1 ${data.status === 'OK' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{data.status}</div>
        </div>
        <div className={infoBoxCls}>
          <div className="text-xs opacity-70">Uptime</div>
          <div className="font-semibold mt-1">{formatUptime(data.uptime)}</div>
        </div>
        <div className={infoBoxCls}>
          <div className="text-xs opacity-70">Environment</div>
          <div className="font-semibold mt-1">{data.environment}</div>
        </div>
        <div className={infoBoxCls}>
          <div className="text-xs opacity-70">Version</div>
          <div className="font-semibold mt-1">{data.version}</div>
        </div>
        <div className={infoBoxCls}>
          <div className="text-xs opacity-70">Database</div>
          <div className="font-semibold mt-1">{data.database}</div>
        </div>
        <div className={infoBoxCls}>
          <div className="text-xs opacity-70">Timestamp</div>
          <div className="font-semibold mt-1">{new Date(data.timestamp).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
};

export default BackendHealth;
