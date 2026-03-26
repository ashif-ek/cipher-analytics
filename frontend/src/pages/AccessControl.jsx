import React from 'react';
import Card from '../components/ui/Card';

const AccessControl = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Entity Access Governance</h1>
          <p className="mt-1 text-sm text-slate-500 font-medium">Manage cross-organizational data sharing policies and cryptographic grants.</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-black transition-all">
          Register New Grant
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Strict Isolation</span>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          </div>
          <h3 className="text-lg font-bold text-slate-900">Private Policy</h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">Default state for all new assets. Data is never resident in shared memory clusters.</p>
        </Card>
        
        <Card className="p-6 border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Collaborative</span>
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          </div>
          <h3 className="text-lg font-bold text-slate-900">Internal Grants</h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">Cryptographic keys shared with verified internal team members for joint analysis.</p>
        </Card>

        <Card className="p-6 border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">FHE Aggregation</span>
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
          </div>
          <h3 className="text-lg font-bold text-slate-900">Research Policy</h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">Enables high-level statistical queries without individual entity exposure.</p>
        </Card>
      </div>

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Active Privilege Matrix</h3>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Status: Monitoring</span>
        </div>
        <div className="p-12 text-center">
          <div className="mx-auto h-12 w-12 text-slate-300 mb-4 opacity-40">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 21a10.003 10.003 0 008.381-4.519l.054.09m-8.435-9.14a1 1 0 112 0v1a1 1 0 11-2 0V7zm1 12.01V12" /></svg>
          </div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">No External Grants Detected</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto font-medium">All platform data currently resides within your private administrative domain.</p>
        </div>
      </Card>
    </div>
  );
};

export default AccessControl;
