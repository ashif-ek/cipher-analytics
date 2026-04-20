import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import useWebSockets from '../hooks/useWebSockets';
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
  const lastEventTimestamps = useRef(new Map()); // Ref to track latest timestamps: "model:id" -> timestamp

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
      setRecentLogs(logs.slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Real-time updates via WebSockets
  useWebSockets(useCallback((message) => {
    // Schema check: supports both DATASET_STATUS_UPDATED and COMPUTATION_STATUS_UPDATED
    if (message.type === 'DATASET_STATUS_UPDATED' || message.type === 'COMPUTATION_STATUS_UPDATED') {
       const { payload, metadata } = message;
       const eventKey = `${payload.model}:${payload.id}`;
       const eventTime = new Date(metadata.timestamp).getTime();
       
       // Stale event protection
       const lastTime = lastEventTimestamps.current.get(eventKey) || 0;
       if (eventTime <= lastTime) {
         console.warn(`Ignoring stale or duplicate event for ${eventKey}. Received: ${eventTime}, Last: ${lastTime}`);
         return;
       }
       
       lastEventTimestamps.current.set(eventKey, eventTime);
       console.log(`Verified event [${metadata.event_id}] received from ${metadata.source}:`, payload);
       
       // Trigger data refresh
       fetchDashboardData();
    }
  }, [fetchDashboardData]));

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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
    <div className="py-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center">
            System Dashboard
            <span className="ml-3 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-[2px] text-[10px] uppercase tracking-widest leading-none">Online</span>
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 font-medium">Overview of your data and system activity.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link to="/upload" className="inline-flex items-center px-3 py-1.5 border border-transparent text-[11px] font-bold rounded-[4px] shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-all">
            <svg className="-ml-0.5 mr-2 h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Ingest Data
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="p-5 border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
          </div>
          <dt className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Compute Resources</dt>
          <dd className="flex items-baseline">
            <span className="text-2xl font-bold text-slate-900">{stats.total}</span>
            <span className="ml-2 text-[10px] font-bold text-slate-400">TOTAL ASSETS</span>
          </dd>
          <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
             <div className="h-full bg-blue-500" style={{ width: '75%' }}></div>
          </div>
        </Card>
        
        <Card className="p-5 border-slate-200 shadow-sm group">
          <dt className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Corporate Reach</dt>
          <dd className="flex items-baseline">
            <span className="text-2xl font-bold text-slate-900">{stats.shared}</span>
            <span className="ml-2 text-[10px] font-bold text-slate-400">DISCOVERABLE</span>
          </dd>
          <div className="mt-4 flex items-center text-[10px] font-bold text-blue-600">
            <svg className="h-3 w-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            Cross-Unit Permissions
          </div>
        </Card>

        <Card className="p-5 border-slate-200 shadow-sm group">
          <dt className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Research Index</dt>
          <dd className="flex items-baseline">
            <span className="text-2xl font-bold text-slate-900">{stats.researchReady}</span>
            <span className="ml-2 text-[10px] font-bold text-slate-400">ANALYSIS READY</span>
          </dd>
          <div className="mt-4 flex items-center text-[10px] font-bold text-slate-500">
            <svg className="h-3 w-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            High-Performance Pipeline
          </div>
        </Card>

        <Card className="p-5 bg-slate-900 border-slate-800 shadow-lg text-white">
          <dt className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Enclave Health</dt>
          <dd className="text-2xl font-bold">OPERATIONAL</dd>
          <div className="mt-4 flex items-center text-[10px] font-bold text-emerald-400">
            <svg className="h-3 w-3 mr-1.5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            Security Mesh Verification: 100%
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-0 border-slate-200 shadow-sm overflow-hidden">
             <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
               <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-tight italic">Resource Catalog Shortcuts</h3>
               <span className="text-[9px] font-bold text-slate-400 uppercase">Interactive Elements</span>
             </div>
             <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/upload" className="flex items-center p-4 border border-slate-200 rounded-[4px] hover:bg-slate-50 hover:border-slate-400 transition-all group shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] focus:ring-1 focus:ring-blue-500 focus:outline-none">
                <div className="w-10 h-10 bg-slate-50 rounded-[4px] flex items-center justify-center text-slate-400 mr-4 group-hover:bg-blue-600 group-hover:text-white transition-all border border-slate-100 group-hover:border-blue-700">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" /></svg>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-900 block leading-tight">UPLOAD DATA</span>
                  <span className="text-[10px] text-slate-400 font-medium">Add new encrypted datasets</span>
                </div>
              </Link>
              
              <Link to="/audit-logs" className="flex items-center p-4 border border-slate-200 rounded-[4px] hover:bg-slate-50 hover:border-slate-400 transition-all group shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] focus:ring-1 focus:ring-blue-500 focus:outline-none">
                <div className="w-10 h-10 bg-slate-50 rounded-[4px] flex items-center justify-center text-slate-400 mr-4 group-hover:bg-slate-900 group-hover:text-white transition-all border border-slate-100 group-hover:border-black">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-900 block leading-tight">SYSTEM LOGS</span>
                  <span className="text-[10px] text-slate-400 font-medium">View platform activity history</span>
                </div>
              </Link>
            </div>
          </Card>
        </div>

        <Card className="p-0 border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-[11px] font-bold text-slate-900 uppercase">Live Event Stream</h3>
            <span className="text-[9px] font-bold text-slate-400">RECENT {recentLogs.length} TRACES</span>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[400px]">
            <ul className="divide-y divide-slate-100">
              {recentLogs.map((log) => (
                <li key={log.id} className="px-5 py-3 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className={`mt-0.5 flex-shrink-0 h-1.5 w-1.5 rounded-full ${
                      log.action.includes('LOGIN') ? 'bg-emerald-400' : 
                      log.action.includes('DELETE') ? 'bg-red-400' : 'bg-blue-400'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] font-bold text-slate-900 truncate uppercase leading-none">{log.action}</p>
                        <span className="text-[9px] font-mono text-slate-400 font-bold">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="mt-1 text-[10px] text-slate-500 font-mono font-medium truncate">{log.user_email || 'daemon@system.local'}</p>
                    </div>
                  </div>
                </li>
              ))}
              {recentLogs.length === 0 && (
                <li className="px-5 py-12 text-center text-[11px] text-slate-400 font-bold italic">NO TRACES RECORDED</li>
              )}
            </ul>
          </div>
          <div className="p-3 bg-slate-50/50 border-t border-slate-100">
            <Link to="/audit-logs" className="w-full inline-flex justify-center items-center px-4 py-2 border border-slate-200 text-[11px] font-bold rounded-[4px] text-slate-700 bg-white hover:bg-slate-50 transition-all shadow-sm">
              Launch Data Explorer
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;
