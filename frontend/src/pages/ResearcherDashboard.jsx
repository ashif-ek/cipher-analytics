import React, { useState, useEffect } from "react";
import api from "../api/axios";

export default function ResearcherDashboard() {
  const [datasets, setDatasets] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [datasetsRes, requestsRes] = await Promise.all([
          api.get("/research/datasets/"),
          api.get("/research/requests/")
        ]);
        setDatasets(datasetsRes.data);
        setRequests(requestsRes.data);
      } catch (err) {
        setError("Failed to load dashboard data. Ensure you have Researcher access.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleRequestAccess = async (datasetId) => {
    try {
      await api.post(`/research/requests/`, {
        dataset: datasetId,
        reason: "Academic research purposes"
      });
      alert("Access request submitted successfully!");
      // Refetch requests
      const res = await api.get("/research/requests/");
      setRequests(res.data);
    } catch (err) {
      alert("Error submitting request");
    }
  };

  if (loading) return <div className="p-8 text-neutral-400">Loading Researcher Workspace...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Researcher Workspace</h1>
        <p className="text-neutral-400">Access governed datasets and extract insights securely.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Available Datasets */}
        <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Available Datasets</h2>
          {datasets.length === 0 ? (
            <p className="text-neutral-500 text-sm">No shared datasets available currently.</p>
          ) : (
            <ul className="space-y-4">
              {datasets.map(ds => (
                <li key={ds.id} className="p-4 bg-neutral-950 rounded-lg border border-neutral-800 flex justify-between items-center">
                  <div>
                    <h3 className="text-white font-medium">{ds.name}</h3>
                    <p className="text-xs text-neutral-500">{ds.rows_count} rows • {ds.columns_count} cols</p>
                  </div>
                  <button 
                    onClick={() => handleRequestAccess(ds.id)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors"
                  >
                    Request Access
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* My Access Requests */}
        <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">My Access Requests</h2>
          {requests.length === 0 ? (
            <p className="text-neutral-500 text-sm">No active access requests.</p>
          ) : (
            <ul className="space-y-4">
              {requests.map(req => (
                <li key={req.id} className="p-4 bg-neutral-950 rounded-lg border border-neutral-800">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-white font-medium">{req.dataset_details?.name || 'Dataset'}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      req.status === 'APPROVED' ? 'bg-green-500/10 text-green-500' :
                      req.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  {req.status === 'APPROVED' && (
                    <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                      Open Analytics Engine &rarr;
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
