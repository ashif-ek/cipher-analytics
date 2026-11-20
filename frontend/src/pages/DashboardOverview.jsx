import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import useWebSockets from '../hooks/useWebSockets';
import Card from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    total: 0,
    private: 0,
    shared: 0,
    researchReady: 0,
    liveSessions: 0
  });
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const lastEventTimestamps = useRef(new Map());

  const fetchDashboardData = useCallback(async () => {
    try {
      const [datasetsRes, logsRes] = await Promise.all([
        client.get('datasets/'),
        client.get('analytics/audit-logs/')
      ]);
      
      const datasets = datasetsRes.data;
      const logs = logsRes.data;
      
      let priv = 0, shared = 0, research = 0;
      datasets.forEach(ds => {
        if (ds.visibility === 'PRIVATE') priv++;
        if (ds.visibility === 'DISCOVERABLE') {
          shared++;
          research++;
        }
      });

      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const activeUsers = new Set(
        logs.filter(log => new Date(log.timestamp) > fiveMinutesAgo)
            .map(log => log.user)
      ).size || 1;

      setStats({
        total: datasets.length,
        private: priv,
        shared: shared,
        researchReady: research,
        liveSessions: activeUsers
      });
      setRecentLogs(logs.slice(0, 6));
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useWebSockets(useCallback((message) => {
    if (message.type === 'DATASET_STATUS_UPDATED' || message.type === 'COMPUTATION_STATUS_UPDATED') {
       const { payload, metadata } = message;
       const eventKey = `${payload.model}:${payload.id}`;
       const eventTime = new Date(metadata.timestamp).getTime();
       
       const lastTime = lastEventTimestamps.current.get(eventKey) || 0;
       if (eventTime <= lastTime) return;
       
       lastEventTimestamps.current.set(eventKey, eventTime);
       fetchDashboardData();
    }
  }, [fetchDashboardData]));

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="space-y-6">
      {/* Platform Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200/90 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
              CLUSTER::READY
            </span>
            <span className="text-xs font-mono text-slate-400">CKKS-RLWE-8192</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            Zero-Trust Research Console
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Active telemetry for encrypted datasets, FHE execution pipelines, and security audits.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/upload"
            className="inline-flex items-center px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded shadow-sm transition-colors"
          >
            <svg className="w-3.5 h-3.5 mr-1.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Ingest Dataset
          </Link>
          <Link
            to="/datasets"
            className="inline-flex items-center px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded shadow-sm transition-colors"
          >
            Data Catalog
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider">Total Datasets</span>
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {loading ? '—' : stats.total}
            </span>
            <span className="text-[11px] font-mono text-slate-400">cataloged</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 border-t border-slate-100 pt-2 flex items-center justify-between">
            <span>Encrypted Blobs</span>
            <span className="font-mono text-slate-600">{stats.total} bin</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider">Research Discoverable</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-emerald-600">
              {loading ? '—' : stats.shared}
            </span>
            <span className="text-[11px] font-mono text-slate-400">governed</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 border-t border-slate-100 pt-2 flex items-center justify-between">
            <span>Granular Grants</span>
            <span className="font-mono text-slate-600">STRICT / AGG</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider">Private Vaults</span>
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-purple-600">
              {loading ? '—' : stats.private}
            </span>
            <span className="text-[11px] font-mono text-slate-400">isolated</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 border-t border-slate-100 pt-2 flex items-center justify-between">
            <span>Owner Access Only</span>
            <span className="font-mono text-slate-600">Strict AES/SEAL</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider">Enclave Sessions</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {loading ? '—' : stats.liveSessions}
            </span>
            <span className="text-[11px] font-mono text-slate-400">verified</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 border-t border-slate-100 pt-2 flex items-center justify-between">
            <span>Redis Pub/Sub</span>
            <span className="font-mono text-emerald-600">SYNCED</span>
          </div>
        </Card>
      </div>

      {/* Main Content Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Architectural Security Matrix */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-slate-900">Cryptographic Subsystem Status</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Parameters governing the homomorphic computation engine.</p>
              </div>
              <span className="text-[10px] font-mono text-slate-500 px-2 py-0.5 rounded bg-white border border-slate-200">
                SEAL 4.0 / TenSEAL
              </span>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 rounded border border-slate-200 bg-slate-50/50 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">Scheme & Security Level</span>
                <div className="text-xs font-semibold text-slate-800">CKKS (Heuristic 128-bit Classical)</div>
                <div className="text-[11px] text-slate-500">Ring Learning With Errors (RLWE) mathematical hardness guarantee.</div>
              </div>

              <div className="p-3 rounded border border-slate-200 bg-slate-50/50 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">Batching & Vectorization</span>
                <div className="text-xs font-semibold text-slate-800">SIMD Packing: 4,096 Slots</div>
                <div className="text-[11px] text-slate-500">Polynomial degree N=8192 allows simultaneous 4K floating-point evaluations.</div>
              </div>

              <div className="p-3 rounded border border-slate-200 bg-slate-50/50 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">Task Queues (Celery/Redis)</span>
                <div className="text-xs font-semibold text-slate-800 font-mono">queue_fhe • queue_ml • default</div>
                <div className="text-[11px] text-slate-500">Dedicated CPU worker binding protects latency-sensitive API traffic.</div>
              </div>

              <div className="p-3 rounded border border-slate-200 bg-slate-50/50 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">Privacy Defense Layer</span>
                <div className="text-xs font-semibold text-slate-800">k-Anonymity Guard (n ≥ 5)</div>
                <div className="text-[11px] text-slate-500">Cardinality threshold & query fingerprinting prevents inference reconstruction.</div>
              </div>
            </div>
          </Card>

          {/* Quick Actions Guide */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              to="/upload" 
              className="p-4 rounded-md border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-[0_1px_2px_0_rgba(15,23,42,0.04)] group"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 rounded bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-slate-900 group-hover:text-sky-600 transition-colors">
                  Ingest New Dataset →
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Upload CSV files up to 15MB. Triggers profiling, adaptive imputation, and chunked CKKS binary serialization.
              </p>
            </Link>

            <Link 
              to="/access-control" 
              className="p-4 rounded-md border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-[0_1px_2px_0_rgba(15,23,42,0.04)] group"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 rounded bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-slate-900 group-hover:text-purple-600 transition-colors">
                  Review Access Grants →
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Inspect outbound and inbound research requests, grant time-bounded evaluation permissions, or revoke access.
              </p>
            </Link>
          </div>
        </div>

        {/* Right Column: Immutable Activity Feed */}
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-slate-900">Recent Audit Events</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Immutable write-only log records</p>
              </div>
              <Link to="/audit-logs" className="text-[11px] font-medium text-sky-600 hover:text-sky-700">
                View All
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="p-6 text-center text-xs font-mono text-slate-400">
                  Loading telemetry...
                </div>
              ) : recentLogs.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No recent audit events captured.
                </div>
              ) : (
                recentLogs.map((log) => (
                  <div key={log.id} className="p-3.5 hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono font-semibold text-slate-800">
                        {log.action}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                      <span className="truncate max-w-[150px] font-mono">
                        {log.user_email || 'System Worker'}
                      </span>
                      <span className="font-mono text-[9px] text-slate-400">
                        {log.ip_address || '127.0.0.1'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
