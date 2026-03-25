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
    recentActivity: 12
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await client.get('datasets/');
        const datasets = response.data;
        
        let priv = 0, shared = 0, research = 0;
        datasets.forEach(ds => {
          if (ds.access_level === 'PRIVATE') priv++;
          if (ds.access_level !== 'PRIVATE') shared++;
          if (ds.is_shared_for_research) research++;
        });

        setStats({
          total: datasets.length,
          private: priv,
          shared: shared,
          researchReady: research,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
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
          <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Defense Status</dt>
          <dd className="text-lg font-bold text-slate-900">Active Protection</dd>
          <div className="mt-4 flex items-center text-xs text-emerald-600 font-semibold uppercase tracking-tight">
            <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            FHE Engine Online
          </div>
        </Card>
      </div>

      <div className="max-w-4xl">
        <Card className="p-8">
          <h3 className="text-lg font-medium text-slate-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Link to="/upload" className="flex flex-col items-center justify-center p-6 border border-slate-200 rounded-2xl hover:bg-indigo-50 hover:border-indigo-200 transition-all group">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-sm">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" /></svg>
              </div>
              <span className="text-sm font-semibold text-slate-900">Upload Dataset</span>
              <span className="text-xs text-slate-500 mt-1 text-center">Ingest new CSV files</span>
            </Link>
            
            <Link to="/datasets" className="flex flex-col items-center justify-center p-6 border border-slate-200 rounded-2xl hover:bg-blue-50 hover:border-blue-200 transition-all group">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
              </div>
              <span className="text-sm font-semibold text-slate-900">Manage Data</span>
              <span className="text-xs text-slate-500 mt-1 text-center">View and analyze assets</span>
            </Link>

            <div className="flex flex-col items-center justify-center p-6 border border-slate-100 rounded-2xl bg-slate-50/50 opacity-60 cursor-not-allowed">
              <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center text-slate-400 mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <span className="text-sm font-semibold text-slate-400">Security Audit</span>
              <span className="text-xs text-slate-400 mt-1 text-center">Coming soon</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;
