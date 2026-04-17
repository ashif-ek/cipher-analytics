import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import DatasetTable from "../components/DatasetTable";
import Card from "../components/ui/Card";
import Toast from "../components/ui/Toast";
import StatusBadge from "../components/ui/StatusBadge";

export default function ResearcherDashboard() {
  const [datasets, setDatasets] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [datasetsRes, requestsRes] = await Promise.all([
        api.get("research/datasets/"),
        api.get("research/requests/")
      ]);
      
      // Mark datasets with access status
      const augmentedDatasets = datasetsRes.data.map(ds => ({
        ...ds,
        has_access: requestsRes.data.some(r => r.dataset === ds.id && r.status === 'APPROVED'),
        request_pending: requestsRes.data.some(r => r.dataset === ds.id && r.status === 'PENDING')
      }));

      setDatasets(augmentedDatasets);
      setRequests(requestsRes.data);
    } catch (err) {
      setError("Failed to load dashboard data. Ensure you have Researcher access.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRequestAccess = async (datasetId) => {
    try {
      await api.post(`research/requests/`, {
        dataset: datasetId,
        reason: `Standard cryptographic evaluation requested for dataset ID: ${datasetId}`
      });
      setToast("Governance access request submitted.");
      fetchDashboardData();
    } catch (err) {
      alert("Error submitting request: " + (err.response?.data?.detail || err.message));
    }
  };

  if (error) return (
    <div className="p-12 text-center">
      <div className="text-red-500 font-bold mb-2">AUTH_ERROR</div>
      <div className="text-slate-500 text-sm">{error}</div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Researcher Workspace</h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">Securely interact with governed datasets via FHE orchestration.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full border border-emerald-100 flex items-center">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
            Identity: Verified
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 block mb-4">Available Assets</span>
            <h3 className="text-2xl font-bold text-slate-900">{datasets.length}</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">Datasets open for research collaboration.</p>
        </Card>
        <Card className="p-6 border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 block mb-4">Active Grants</span>
            <h3 className="text-2xl font-bold text-emerald-600">{datasets.filter(d => d.has_access).length}</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">Approved cryptographic evaluation contexts.</p>
        </Card>
        <Card className="p-6 border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 block mb-4">Pending Requests</span>
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-amber-500">{datasets.filter(d => d.request_pending).length}</h3>
              <Link 
                to="/research-requests" 
                className="text-[10px] font-bold text-slate-900 hover:underline"
              >
                View History →
              </Link>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Awaiting Data Owner verification.</p>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
            <h2 className="text-xs font-bold text-slate-900">Governed Dataset Registry</h2>
        </div>
        <DatasetTable 
          datasets={datasets} 
          loading={loading} 
          onRefresh={fetchDashboardData}
          onRequestAccess={handleRequestAccess}
          userRole="RESEARCHER"
        />
      </div>
    </div>
  );
}
