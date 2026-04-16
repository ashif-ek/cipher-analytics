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

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Access Requests</h1>
          <p className="mt-1 text-sm text-slate-500 font-medium">Track your outbound applications for governed dataset access.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-slate-400">Pending</span>
            <div className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-full">
              {requests.filter(r => r.status === 'PENDING').length}
            </div>
          </div>
          <h3 className="text-lg font-bold text-slate-900">Awaiting Approval</h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">Requests currently being reviewed by Data Owners.</p>
        </Card>
        
        <Card className="p-6 border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-slate-400">Approved</span>
            <div className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full">
              {requests.filter(r => r.status === 'APPROVED').length}
            </div>
          </div>
          <h3 className="text-lg font-bold text-slate-900">Granted Access</h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">Datasets where you have active cryptographic compute rights.</p>
        </Card>

        <Card className="p-6 border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-slate-400">Rejected</span>
            <div className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded-full">
              {requests.filter(r => r.status === 'REJECTED').length}
            </div>
          </div>
          <h3 className="text-lg font-bold text-slate-900">Closed Requests</h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">Applications that were declined by the data host.</p>
        </Card>
      </div>

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900">Outbound Request History</h3>
          <span className="text-[10px] font-mono text-slate-400">Verified Log</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/30">
              <tr>
                <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-400">Data Asset</th>
                <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-400">Submitted</th>
                <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-400">Rationale</th>
                <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white">
              {loading ? (
                <tr><td colSpan="4" className="px-6 py-12 text-center text-xs text-slate-400 font-bold">Establishing secure link...</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-12 text-center text-xs text-slate-400 font-bold">No outbound requests found</td></tr>
              ) : (
                requests.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs font-bold text-slate-900">{req.dataset_details?.name || 'Unknown Asset'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-[10px] font-bold text-slate-500">
                        {new Date(req.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[10px] text-slate-500 font-medium line-clamp-1 max-w-xs">{req.reason}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
