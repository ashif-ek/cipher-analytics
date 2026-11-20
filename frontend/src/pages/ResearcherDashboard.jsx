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

  const fetchDashboardData = React.useCallback(async () => {
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
    } catch (_err) {
      setError("Failed to load researcher workspace data. Ensure you have Researcher privileges.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        setLoading(true);
        const [datasetsRes, requestsRes] = await Promise.all([
          api.get("research/datasets/"),
          api.get("research/requests/")
        ]);
        if (!ignore) {
          const augmentedDatasets = datasetsRes.data.map(ds => ({
            ...ds,
            has_access: requestsRes.data.some(r => r.dataset === ds.id && r.status === 'APPROVED'),
            request_pending: requestsRes.data.some(r => r.dataset === ds.id && r.status === 'PENDING')
          }));
          setDatasets(augmentedDatasets);
          setRequests(requestsRes.data);
        }
      } catch (_err) {
        if (!ignore) {
          setError("Failed to load researcher workspace data. Ensure you have Researcher privileges.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const handleRequestAccess = async (dataset) => {
    const datasetId = dataset?.id || dataset;
    try {
      await api.post(`research/requests/`, {
        dataset: datasetId,
        reason: `Cryptographic research evaluation requested for dataset ID: ${datasetId}`
      });
      setToast("Governance access request dispatched successfully.");
      fetchDashboardData();
    } catch (err) {
      alert("Error submitting request: " + (err.response?.data?.detail || err.message));
    }
  };

  if (error) return (
    <div className="p-12 text-center max-w-md mx-auto">
      <div className="text-xs font-mono font-bold text-rose-500 mb-1">AUTH_ACCESS_DENIED</div>
      <div className="text-slate-600 text-xs">{error}</div>
    </div>
  );

  const approvedCount = requests.filter(r => r.status === 'APPROVED').length;
  const pendingCount = requests.filter(r => r.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200/90 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              IDENTITY::VERIFIED
            </span>
            <span className="text-xs font-mono text-slate-400">RESEARCHER CONSOLE</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            Governed Research Enclave
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Discover datasets, submit cryptographic access briefs, and run zero-knowledge evaluations.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/research-requests"
            className="inline-flex items-center px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded shadow-sm transition-colors"
          >
            My Access Requests ({pendingCount} pending)
          </Link>
        </div>
      </div>

      {/* Researcher KPI Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider">Discoverable Assets</span>
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {loading ? '—' : datasets.length}
            </span>
            <span className="text-[11px] font-mono text-slate-400">available</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 border-t border-slate-100 pt-2 flex items-center justify-between">
            <span>Access Mode</span>
            <span className="font-mono text-slate-600">Encrypted Catalog</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider">Granted Access Rights</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-emerald-600">
              {loading ? '—' : approvedCount}
            </span>
            <span className="text-[11px] font-mono text-slate-400">active grants</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 border-t border-slate-100 pt-2 flex items-center justify-between">
            <span>Compute Rights</span>
            <span className="font-mono text-emerald-600">FHE / ML UNLOCKED</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider">Pending Grants</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-amber-600">
              {loading ? '—' : pendingCount}
            </span>
            <span className="text-[11px] font-mono text-slate-400">in review</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 border-t border-slate-100 pt-2 flex items-center justify-between">
            <span>Governance State</span>
            <span className="font-mono text-slate-600">Awaiting Data Owner</span>
          </div>
        </Card>
      </div>

      {/* Discoverable Datasets Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
            Available Discoverable Catalogs
          </h2>
          <span className="text-[11px] text-slate-400 font-mono">
            Direct computation available for authorized assets
          </span>
        </div>

        <DatasetTable
          datasets={datasets}
          loading={loading}
          onRefresh={fetchDashboardData}
          onRequestAccess={handleRequestAccess}
          userRole="RESEARCHER"
          searchQuery=""
          setSearchQuery={() => {}}
          statusFilter="ALL"
          setStatusFilter={() => {}}
          visibilityFilter="ALL"
          setVisibilityFilter={() => {}}
          sortField="created_at"
          setSortField={() => {}}
          sortDirection="desc"
          setSortDirection={() => {}}
        />
      </div>
    </div>
  );
}
