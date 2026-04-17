import React, { useState, useEffect } from 'react';
import client from '../api/client';
import Card from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';
import { format } from 'date-fns';

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
    log.action.toLowerCase().includes(filter.toLowerCase()) ||
    log.ip_address?.includes(filter)
  );

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-700 border-red-200';
      case 'WARNING': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="py-2">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">System Logs</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Immutable record of all platform activity.</p>
        </div>
        <button 
          onClick={fetchLogs}
          className="px-3 py-1.5 bg-white border border-slate-300 rounded-[4px] text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center shadow-sm"
        >
          <svg className="w-3.5 h-3.5 mr-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Logs
        </button>
      </div>

      <Card className="overflow-hidden border-slate-200 shadow-sm rounded-[4px]">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="relative flex-1 max-w-sm group">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 group-focus-within:text-slate-600">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by user, action, or IP..."
              className="block w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-[4px] bg-white placeholder-slate-400 focus:outline-none focus:border-slate-400 text-[11px] transition-all"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <div className="text-[10px] font-bold text-slate-400">
            {filteredLogs.length} EVENTS CAPTURED
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 border-collapse">
            <thead className="bg-[#f2f3f3]/50">
              <tr>
                <th className="px-5 py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-tight border-r border-slate-100">Timestamp</th>
                <th className="px-5 py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-tight border-r border-slate-100">Identity</th>
                <th className="px-5 py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-tight border-r border-slate-100">Event Action</th>
                <th className="px-5 py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-tight border-r border-slate-100">Severity</th>
                <th className="px-5 py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-tight border-r border-slate-100">Origin IP</th>
                <th className="px-5 py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-tight">Trace ID</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100 font-mono text-[11px]">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="6" className="px-5 py-3 h-10 bg-slate-50/30 border-r border-slate-50 last:border-0"></td>
                  </tr>
                ))
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-slate-400 font-bold">NO TELEMETRY RECORDED</td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-2 whitespace-nowrap text-slate-500 border-r border-slate-50">
                      {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                    </td>
                    <td className="px-5 py-2 whitespace-nowrap border-r border-slate-50">
                      <div className="flex items-center">
                        <span className="text-slate-900 font-bold">{log.user_email || 'SYSTEM_DAEMON'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-2 whitespace-nowrap border-r border-slate-50">
                      <span className="text-slate-900 font-bold uppercase">{log.action}</span>
                    </td>
                    <td className="px-5 py-2 whitespace-nowrap border-r border-slate-50">
                      <StatusBadge status={log.severity} />
                    </td>
                    <td className="px-5 py-2 whitespace-nowrap text-slate-600 border-r border-slate-50">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                    <td className="px-5 py-2 whitespace-nowrap text-slate-400">
                      {log.request_id ? log.request_id.substring(0, 13) : 'INT_AUTH'}...
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900 rounded-[4px] border border-slate-800 shadow-sm">
          <span className="block text-[10px] font-bold text-blue-400 mb-2 uppercase tracking-widest">Integrity Protocol</span>
          <p className="text-[11px] text-slate-400 leading-normal font-medium">
            All logs are immutable (write-once) and captured via a dual-layer sync/async pipeline.
          </p>
        </div>
        <div className="p-4 bg-white rounded-[4px] border border-slate-200 shadow-sm">
          <span className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Retention Metrics</span>
          <p className="text-[11px] text-slate-600 leading-normal font-medium">
            System activity data is retained for 365 days in accordance with the GRC security protocol.
          </p>
        </div>
        <div className="p-4 bg-white rounded-[4px] border border-slate-200 shadow-sm">
          <span className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Security Analytics</span>
          <p className="text-[11px] text-slate-600 leading-normal font-medium">
            Background workers analyze trails for suspicious entropy and brute-force velocity.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
