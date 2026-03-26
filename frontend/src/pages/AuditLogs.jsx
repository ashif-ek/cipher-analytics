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
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2 uppercase">Audit Infrastructure</h1>
          <p className="text-slate-500 font-medium">Immutable telemetry and comprehensive system activity trailing.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchLogs}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center shadow-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Logs
          </button>
        </div>
      </div>

      <Card className="overflow-hidden border-slate-200 shadow-xl">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by user, action, or IP..."
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:placeholder-slate-300 focus:ring-1 focus:ring-slate-300 focus:border-slate-300 sm:text-sm transition-all"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest gap-4">
            <span>Showing {filteredLogs.length} events</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-left">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Timestamp</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">User</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Action</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Severity</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">IP Address</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Request ID</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="6" className="px-6 py-4 h-12 bg-slate-50/50"></td>
                  </tr>
                ))
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-medium">No audit entries found matching your search.</td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-500 font-mono">
                      {format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center mr-3 border border-slate-200">
                          <span className="text-[10px] font-black text-slate-600">{(log.user_email || 'SYS')[0].toUpperCase()}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-900">{log.user_email || 'System'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-black text-slate-700 tracking-tight">{log.action.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-[10px] font-black uppercase rounded border ${getSeverityColor(log.severity)}`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-mono">
                      {log.ip_address || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[10px] text-slate-400 font-mono truncate max-w-[100px]" title={log.request_id}>
                      {log.request_id ? log.request_id.split('-')[0] : 'Internal'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl">
          <span className="block text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">Integrity Verification</span>
          <p className="text-sm text-slate-300 leading-relaxed font-medium">
            All logs are immutable (write-once) and captured via a dual-layer sync/async pipeline to ensure no telemetry is lost.
          </p>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-lg">
          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Retention Policy</span>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            System activity data is retained for 365 days in accordance with the security compliance protocol.
          </p>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-lg">
          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Anomaly Detection</span>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            Background workers analyze these trails for brute-force attempts and suspicious IP velocity in real-time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
