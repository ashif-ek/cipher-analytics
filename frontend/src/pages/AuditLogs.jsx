import React, { useState, useEffect } from 'react';
import client from '../api/client';
import Card from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await client.get('analytics/audit-logs/');
      setLogs(response.data);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.user_email?.toLowerCase().includes(filter.toLowerCase()) ||
    log.action?.toLowerCase().includes(filter.toLowerCase()) ||
    log.ip_address?.includes(filter) ||
    log.request_id?.toLowerCase().includes(filter.toLowerCase())
  );

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">CRITICAL</span>;
      case 'WARNING':
        return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">WARNING</span>;
      default:
        return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">INFO</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200/90 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              IMMUTABLE_LOG::ACTIVE
            </span>
            <span className="text-xs font-mono text-slate-400">SOC2 / HIPAA TRACEABILITY</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            System Activity & Audit Timeline
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Cryptographically stamped append-only event ledger capturing authentication, computational tasks, and access denials.
          </p>
        </div>

        <button 
          onClick={fetchLogs}
          className="inline-flex items-center px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
        >
          <svg className="w-3.5 h-3.5 mr-1.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Ledger
        </button>
      </div>

      <Card className="overflow-hidden">
        {/* Filter bar */}
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm group">
            <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 group-focus-within:text-slate-600">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Filter by user, action, IP, or Request ID..."
              className="block w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded bg-white text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            {filteredLogs.length} OF {logs.length} EVENTS RECORDED
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 text-slate-500 text-[10px] font-mono uppercase tracking-wider">
              <tr>
                <th className="px-5 py-2.5 text-left font-semibold">Timestamp</th>
                <th className="px-5 py-2.5 text-left font-semibold">Action Event</th>
                <th className="px-5 py-2.5 text-left font-semibold">Severity</th>
                <th className="px-5 py-2.5 text-left font-semibold">Principal Entity</th>
                <th className="px-5 py-2.5 text-left font-semibold">IP Origin</th>
                <th className="px-5 py-2.5 text-right font-semibold">Request Trace ID</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100 text-xs font-mono">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-5 py-8 text-center text-slate-400 text-xs">
                    Loading immutable audit trail...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-8 text-center text-slate-400 text-xs">
                    No matching audit logs located.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-2.5 whitespace-nowrap text-slate-500 text-[11px]">
                      {new Date(log.timestamp).toISOString().replace('T', ' ').slice(0, 19)}
                    </td>
                    <td className="px-5 py-2.5 whitespace-nowrap text-slate-900 font-semibold text-[11px]">
                      {log.action}
                    </td>
                    <td className="px-5 py-2.5 whitespace-nowrap">
                      {getSeverityBadge(log.severity)}
                    </td>
                    <td className="px-5 py-2.5 whitespace-nowrap text-slate-600 text-[11px]">
                      {log.user_email || 'System Kernel'}
                    </td>
                    <td className="px-5 py-2.5 whitespace-nowrap text-slate-500 text-[11px]">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                    <td className="px-5 py-2.5 whitespace-nowrap text-right text-slate-400 text-[10px]" title={log.request_id}>
                      {log.request_id ? `${log.request_id.slice(0, 8)}...` : 'SYS_KERNEL'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AuditLogs;
