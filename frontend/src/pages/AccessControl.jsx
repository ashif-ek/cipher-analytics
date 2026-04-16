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

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
        <div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Entity Access Governance</h1>
          <p className="mt-1 text-sm text-slate-500 font-medium">Manage incoming research requests and cryptographic grant lifecycles.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Requests</span>
            <div className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-full">
              {requests.filter(r => r.status === 'PENDING').length}
            </div>
          </div>
          <h3 className="text-lg font-bold text-slate-900">Pending Approvals</h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">Researchers awaiting verification to compute on your data assets.</p>
        </Card>
        
        <Card className="p-6 border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trust Index</span>
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          </div>
          <h3 className="text-lg font-bold text-slate-900">Verified Entities</h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">Total unique researchers currently holding active FHE evaluation grants.</p>
        </Card>

        <Card className="p-6 border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Audit State</span>
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
          </div>
          <h3 className="text-lg font-bold text-slate-900">Policy Compliance</h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">All active grants strictly adhere to your organization's zero-trust baseline.</p>
        </Card>
      </div>

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Inbound Request Queue</h3>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Real-time Synchronization</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/30">
              <tr>
                <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Researcher</th>
                <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Dataset</th>
                <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rationale</th>
                <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-xs text-slate-400 font-bold uppercase tracking-wider">Fetching Registry...</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-xs text-slate-400 font-bold uppercase tracking-wider">No active requests found</td></tr>
              ) : (
                requests.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs font-bold text-slate-900 uppercase tracking-tight">{req.researcher_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs font-medium text-slate-600 uppercase tracking-tight">{req.dataset_details?.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[10px] text-slate-500 font-medium line-clamp-1 max-w-xs">{req.reason}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {req.status === 'PENDING' && (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleAction(req.id, 'approve')}
                            className="px-3 py-1 bg-slate-900 text-white text-[9px] font-bold uppercase tracking-wider rounded-md hover:bg-black transition-all"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleAction(req.id, 'reject')}
                            className="px-3 py-1 border border-slate-200 text-slate-600 text-[9px] font-bold uppercase tracking-wider rounded-md hover:bg-slate-50 transition-all"
                          >
                            Reject
                          </button>
                        </div>
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

