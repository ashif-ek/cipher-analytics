import React, { useState, useEffect } from 'react';
import client from '../api/client';
import Card from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';
import Toast from '../components/ui/Toast';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await client.get('research/requests/');
      setRequests(res.data);
    } catch (err) {
      console.error('Failed to fetch requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const pendingCount = requests.filter(r => r.status === 'PENDING').length;
  const approvedCount = requests.filter(r => r.status === 'APPROVED').length;
  const rejectedCount = requests.filter(r => r.status === 'REJECTED' || r.status === 'REVOKED').length;

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200/90 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
              GRANTS::OUTBOUND
            </span>
            <span className="text-xs font-mono text-slate-400">RESEARCH BRIEF TRACKER</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            My Research Access Grants
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Monitor the status of your research applications and active cryptographic computation rights.
          </p>
        </div>

        <button
          onClick={fetchRequests}
          className="inline-flex items-center px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded shadow-sm transition-colors"
        >
          <svg className="w-3.5 h-3.5 mr-1.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Tracker
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider">Awaiting Owner Review</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-amber-600">
              {loading ? '—' : pendingCount}
            </span>
            <span className="text-[11px] font-mono text-slate-400">in review</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 border-t border-slate-100 pt-2 flex items-center justify-between">
            <span>Action Required</span>
            <span className="font-mono text-slate-600">Data Owner Sign-off</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider">Granted Compute Rights</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-emerald-600">
              {loading ? '—' : approvedCount}
            </span>
            <span className="text-[11px] font-mono text-slate-400">active grants</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 border-t border-slate-100 pt-2 flex items-center justify-between">
            <span>Privileges</span>
            <span className="font-mono text-emerald-600">FHE / ML UNLOCKED</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider">Declined / Expired</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-700">
              {loading ? '—' : rejectedCount}
            </span>
            <span className="text-[11px] font-mono text-slate-400">closed</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 border-t border-slate-100 pt-2 flex items-center justify-between">
            <span>Audit Status</span>
            <span className="font-mono text-slate-600">Archived</span>
          </div>
        </Card>
      </div>

      {/* Requests Table */}
      <Card className="overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-slate-900">Submitted Access Briefs</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Execution history of your outbound dataset access requests.</p>
          </div>
          <span className="text-[10px] font-mono text-slate-400">{requests.length} records</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 text-slate-500 text-[10px] font-mono uppercase tracking-wider">
              <tr>
                <th className="px-5 py-2.5 text-left font-semibold">Target Dataset</th>
                <th className="px-5 py-2.5 text-left font-semibold">Stated Research Justification</th>
                <th className="px-5 py-2.5 text-left font-semibold">Timestamp</th>
                <th className="px-5 py-2.5 text-right font-semibold">Grant Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-5 py-8 text-center text-slate-400 font-mono text-xs">
                    Loading outbound requests...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-5 py-8 text-center text-slate-400">
                    You have not submitted any access requests yet. Browse the Data Catalog to request compute permissions.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{req.dataset_name || `Dataset #${req.dataset}`}</div>
                      <div className="text-[10px] font-mono text-slate-400">ID::{req.dataset}</div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-slate-600 text-xs max-w-md truncate" title={req.reason}>
                        {req.reason}
                      </div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-[11px] font-mono text-slate-400">
                      {req.created_at ? new Date(req.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-right">
                      <StatusBadge status={req.status} />
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

export default MyRequests;
