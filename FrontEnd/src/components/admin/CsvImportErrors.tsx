import React, { useEffect, useMemo, useState } from 'react';
import { contentService } from '../../services/content';
import LoadingSpinner from '../common/LoadingSpinner';
import Button from '../common/Button';
import { useTheme } from '../../context/ThemeContext';
import { AlertTriangle, RefreshCw, FileText, ChevronDown, ChevronRight } from 'lucide-react';

interface ImportSession {
  startedAt: string;
  file: string;
}

interface ImportErrorItem {
  row: number;
  error: string;
  data: Record<string, string>;
  sessionStartedAt: string;
  file: string;
}

interface ErrorsPayload {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  sessions: ImportSession[];
  errors: ImportErrorItem[];
}

const formatPathBase = (full: string) => {
  if (!full) return '';
  const parts = full.split(/[/\\]/g);
  return parts[parts.length - 1] || full;
};

const CsvImportErrors: React.FC = () => {
  const { theme } = useTheme();
  const [page, setPage] = useState(1);
  const [limit] = useState(100);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ErrorsPayload | null>(null);
  const [selectedSessionKey, setSelectedSessionKey] = useState<string>('all');
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const cardCls = `rounded-lg shadow-md p-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`;
  const subCardCls = `rounded-md p-4 ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`;
  const textMuted = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';

  const load = async (p = page) => {
    try {
      setLoading(true);
      setError(null);
      const resp = await contentService.getCsvImportErrors(p, limit);
      setData(resp.data);
    } catch (e: any) {
      setError(typeof e === 'string' ? e : e?.message || 'Failed to load CSV import errors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredErrors = useMemo(() => {
    if (!data) return [] as ImportErrorItem[];
    if (selectedSessionKey === 'all') return data.errors || [];
    const [startedAt, file] = selectedSessionKey.split('|');
    return (data.errors || []).filter(e => e.sessionStartedAt === startedAt && e.file === file);
  }, [data, selectedSessionKey]);

  const toggleRow = (key: string) => setExpandedRows(s => ({ ...s, [key]: !s[key] }));

  const sessionOptions = useMemo(() => {
    const opts = (data?.sessions || []).map(s => ({
      key: `${s.startedAt}|${s.file}`,
      label: `${new Date(s.startedAt).toLocaleString()} — ${formatPathBase(s.file)}`,
    }));
    return [{ key: 'all', label: 'All sessions' }, ...opts];
  }, [data]);

  const totalPages = data?.totalPages || 1;

  return (
    <div className={cardCls} data-chart-card="true" data-chart-title="CSV Import Errors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>CSV Import Errors</h2>
          <p className={`text-sm mt-1 ${textMuted}`}>View recent CSV import sessions and row-level validation errors.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => load(page)}>
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
        </div>
      </div>

      {loading && <LoadingSpinner />}
      {error && !loading && (
        <div className="text-red-600 dark:text-red-400 p-3 border border-red-300 dark:border-red-700 rounded-md">
          {error}
        </div>
      )}

      {!loading && !error && data && (
        <div className="space-y-6">
          {/* Sessions */}
          <div className={subCardCls}>
            <div className="flex items-center mb-3">
              <FileText className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`} />
              <h3 className={`ml-2 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Recent Import Sessions</h3>
            </div>
            {data.sessions?.length ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {data.sessions.map((s, idx) => (
                  <li key={`${s.startedAt}-${idx}`} className="py-2 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{new Date(s.startedAt).toLocaleString()}</div>
                      <div className={`text-xs ${textMuted}`}>{s.file}</div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className={`text-sm ${textMuted}`}>No sessions found.</div>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <label className="text-sm font-medium">Filter by session</label>
            <select
              value={selectedSessionKey}
              onChange={(e) => setSelectedSessionKey(e.target.value)}
              className={`text-sm rounded-md border px-2 py-1 ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
            >
              {sessionOptions.map(opt => (
                <option key={opt.key} value={opt.key}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Errors */}
          <div className={subCardCls} data-scrollable="true" style={{ maxHeight: '420px', overflow: 'auto' }}>
            <div className="flex items-center mb-3">
              <AlertTriangle className={`w-5 h-5 ${theme === 'dark' ? 'text-amber-300' : 'text-amber-600'}`} />
              <h3 className={`ml-2 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Errors ({filteredErrors.length})</h3>
            </div>

            {!filteredErrors.length ? (
              <div className={`text-sm ${textMuted}`}>No errors to display.</div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredErrors.map((e, i) => {
                  const key = `${e.sessionStartedAt}|${e.file}|${e.row}|${i}`;
                  const expanded = !!expandedRows[key];
                  return (
                    <li key={key} className="py-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-sm font-medium">Row {e.row}: {e.error}</div>
                          <div className={`text-xs ${textMuted}`}>{new Date(e.sessionStartedAt).toLocaleString()} • {formatPathBase(e.file)}</div>
                        </div>
                        <button
                          onClick={() => toggleRow(key)}
                          className={`inline-flex items-center text-sm ${theme === 'dark' ? 'text-blue-300 hover:text-blue-200' : 'text-blue-700 hover:text-blue-800'}`}
                        >
                          {expanded ? <ChevronDown className="w-4 h-4 mr-1" /> : <ChevronRight className="w-4 h-4 mr-1" />} Details
                        </button>
                      </div>
                      {expanded && (
                        <div className={`mt-2 text-xs ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} rounded-md p-2 overflow-auto`}>
                          <table className="min-w-full text-xs">
                            <thead>
                              <tr className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                                <th className="text-left pr-2 py-1">Field</th>
                                <th className="text-left py-1">Value</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(e.data || {}).map(([k, v]) => (
                                <tr key={k} className={theme === 'dark' ? 'border-t border-gray-800' : 'border-t border-gray-100'}>
                                  <td className="pr-2 py-1 align-top font-medium">{k}</td>
                                  <td className="py-1 whitespace-pre-wrap break-words">{String(v)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className={`text-sm ${textMuted}`}>Page {data.page} of {totalPages}</div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => { const p = Math.max(1, page - 1); setPage(p); load(p); }}
                disabled={data.page <= 1}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                onClick={() => { const p = Math.min(totalPages, page + 1); setPage(p); load(p); }}
                disabled={data.page >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CsvImportErrors;
