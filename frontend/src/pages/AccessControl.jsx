import React, { useState, useEffect } from 'react';
import client from '../api/client';
import Card from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';
import Toast from '../components/ui/Toast';

const AccessControl = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await client.get('research/owner-requests/');
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

  const handleAction = async (id, action) => {
    try {
      await client.post(`research/owner-requests/${id}/${action}/`);
      setToast(`Request ${action}ed successfully.`);
      fetchRequests();
    } catch (err) {
      alert(`Action failed: ${err.message}`);
    }
  };

  const pendingCount = requests.filter(r => r.status === 'PENDING').length;
  const approvedCount = requests.filter(r => r.status === 'APPROVED').length;
  const rejectedCount = requests.filter(r => r.status === 'REJECTED' || r.status === 'REVOKED').length;

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200/90 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
              POLICY::ZERO-TRUST
            </span>
            <span className="text-xs font-mono text-slate-400">INBOUND RESEARCH GRANTS</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            Access Governance & Enclave Grants
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Review inbound applications from verified researchers and grant time-bounded evaluation rights.
          </p>
        </div>

        <button
          onClick={fetchRequests}
          className="inline-flex items-center px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded shadow-sm transition-colors"
        >
          <svg className="w-3.5 h-3.5 mr-1.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Grants
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider">Pending Decisions</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-amber-600">
              {loading ? '—' : pendingCount}
            </span>
            <span className="text-[11px] font-mono text-slate-400">awaiting review</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 border-t border-slate-100 pt-2 flex items-center justify-between">
            <span>Escalation SLA</span>
            <span className="font-mono text-slate-600">Manual Approval</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider">Active Grants</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-emerald-600">
              {loading ? '—' : approvedCount}
            </span>
            <span className="text-[11px] font-mono text-slate-400">authorized</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 border-t border-slate-100 pt-2 flex items-center justify-between">
            <span>Grant Duration</span>
            <span className="font-mono text-slate-600">Time-Bounded (30d)</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider">Closed / Revoked</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-700">
              {loading ? '—' : rejectedCount}
            </span>
            <span className="text-[11px] font-mono text-slate-400">archived</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 border-t border-slate-100 pt-2 flex items-center justify-between">
            <span>Audit Trail</span>
            <span className="font-mono text-slate-600">Immutable</span>
          </div>
        </Card>
      </div>

      {/* Requests Table */}
      <Card className="overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-slate-900">Inbound Grant Applications</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Researchers requesting compute access to your encrypted datasets.</p>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            {requests.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 text-slate-500 text-[10px] font-mono uppercase tracking-wider">
              <tr>
                <th className="px-5 py-2.5 text-left font-semibold">Researcher Entity</th>
                <th className="px-5 py-2.5 text-left font-semibold">Target Dataset</th>
                <th className="px-5 py-2.5 text-left font-semibold">Research Justification</th>
                <th className="px-5 py-2.5 text-left font-semibold">Status</th>
                <th className="px-5 py-2.5 text-right font-semibold">Governance Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-5 py-8 text-center text-slate-400 font-mono text-xs">
                    Loading grant applications...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-8 text-center text-slate-400">
                    No access requests currently pending for your datasets.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="font-medium text-slate-900">{req.researcher_email || req.researcher}</div>
                      <div className="text-[10px] font-mono text-slate-400">REQ::{req.id.slice(0, 8)}</div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="font-medium text-slate-900">{req.dataset_name || `Dataset #${req.dataset}`}</div>
                      <div className="text-[10px] font-mono text-slate-400">ID::{req.dataset}</div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-slate-600 text-xs max-w-sm truncate" title={req.reason}>
                        {req.reason}
                      </div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-right">
                      {req.status === 'PENDING' ? (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleAction(req.id, 'approve')}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded text-xs font-medium transition-colors"
                          >
                            Authorize
                          </button>
                          <button
                            onClick={() => handleAction(req.id, 'reject')}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-xs font-medium transition-colors"
                          >
                            Decline
                          </button>
                        </div>
                      ) : req.status === 'APPROVED' ? (
                        <button
                          onClick={() => handleAction(req.id, 'reject')}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded text-xs font-medium transition-colors border border-slate-200"
                        >
                          Revoke Grant
                        </button>
                      ) : (
                        <span className="text-[11px] font-mono text-slate-400">Decision Finalized</span>
                      )}
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

export default AccessControl;
