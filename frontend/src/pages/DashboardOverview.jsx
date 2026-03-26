import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import Card from '../components/ui/Card';

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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [datasetsRes, logsRes] = await Promise.all([
          client.get('datasets/'),
          client.get('analytics/audit-logs/')
        ]);
        
        const datasets = datasetsRes.data;
        const logs = logsRes.data;
        
        let priv = 0, shared = 0, research = 0;
        datasets.forEach(ds => {
          if (ds.access_level === 'PRIVATE') priv++;
          if (ds.access_level !== 'PRIVATE') shared++;
          if (ds.is_shared_for_research) research++;
        });

        // Mock live sessions based on recent logs in this MVP
        // In production, we'd have a specific endpoint for this
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const activeUsers = new Set(
          logs.filter(log => new Date(log.timestamp) > fiveMinutesAgo)
              .map(log => log.user)
        ).size || 1; // Default to 1 (current user)

        setStats({
          total: datasets.length,
          private: priv,
          shared: shared,
          researchReady: research,
          liveSessions: activeUsers
        });
        setRecentLogs(logs.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>)}
        </div>
        <div className="h-64 bg-slate-200 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Overview</h1>
          <p className="mt-1 text-sm text-slate-500">Monitor your encrypted datasets and platform health.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link to="/upload" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            New Dataset
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 border-slate-200">
          <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Total Datasets</dt>
          <dd className="text-3xl font-bold text-slate-900">{stats.total}</dd>
          <div className="mt-4 flex items-center text-xs text-slate-400 font-medium">
            <svg className="h-4 w-4 mr-1.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            Live Registry
          </div>
        </Card>
        
        <Card className="p-6 border-slate-200">
          <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Internal Share</dt>
          <dd className="text-3xl font-bold text-slate-900">{stats.shared} <span className="text-sm font-normal text-slate-400">/ {stats.total}</span></dd>
          <div className="mt-4 flex items-center text-xs text-slate-400 font-medium">
            <svg className="h-4 w-4 mr-1.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            Cross-Unit Access
          </div>
        </Card>

        <Card className="p-6 border-slate-200">
          <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Research Data</dt>
          <dd className="text-3xl font-bold text-slate-900">{stats.researchReady}</dd>
          <div className="mt-4 flex items-center text-xs text-slate-400 font-medium">
            <svg className="h-4 w-4 mr-1.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            Analysis Capability
          </div>
        </Card>

        <Card className="p-6 border-slate-200">
          <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Live Infrastructure</dt>
          <dd className="text-3xl font-bold text-slate-900">{stats.liveSessions} <span className="text-sm font-normal text-slate-400">Active</span></dd>
          <div className="mt-4 flex items-center text-xs text-emerald-600 font-semibold uppercase tracking-tight">
            <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            FHE Engine Online
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6 uppercase tracking-tight">System Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Link to="/upload" className="flex flex-col items-center justify-center p-6 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all group">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 mb-3 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" /></svg>
                </div>
                <span className="text-sm font-bold text-slate-900">Upload Dataset</span>
                <span className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest">Ingest CSV</span>
              </Link>
              
              <Link to="/audit-logs" className="flex flex-col items-center justify-center p-6 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all group">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 mb-3 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <span className="text-sm font-bold text-slate-900">Security Audit</span>
                <span className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest">View Activity Logs</span>
              </Link>
            </div>
          </Card>
        </div>

        <Card className="p-6 border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-widest">Recent Activity</h3>
          <div className="flow-root">
            <ul className="-mb-8">
              {recentLogs.map((log, idx) => (
                <li key={log.id}>
                  <div className="relative pb-8">
                    {idx !== recentLogs.length - 1 && (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-100" aria-hidden="true"></span>
                    )}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className={`h-8 w-8 rounded-lg flex items-center justify-center ring-4 ring-white ${
                          log.action.includes('LOGIN') ? 'bg-emerald-100 text-emerald-600' : 
                          log.action.includes('DELETE') ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <span className="text-[10px] font-black">{log.action[0]}</span>
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-xs font-bold text-slate-900">{log.action.replace(/_/g, ' ')}</p>
                          <p className="text-[10px] text-slate-500 font-medium truncate">{log.user_email}</p>
                        </div>
                        <div className="text-right text-[10px] whitespace-nowrap text-slate-400 font-bold">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
              {recentLogs.length === 0 && (
                <li className="text-center py-4 text-xs text-slate-400 font-medium italic">No recent activity detected</li>
              )}
            </ul>
          </div>
          <div className="mt-6">
            <Link to="/audit-logs" className="w-full inline-flex justify-center items-center px-4 py-2 border border-slate-200 shadow-sm text-xs font-bold rounded-xl text-slate-700 bg-white hover:bg-slate-50 transition-all uppercase tracking-widest">
              View full audit
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;
