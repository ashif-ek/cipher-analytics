import React, { useState, useEffect } from 'react';
import client from '../api/client';
import Card from '../components/ui/Card';

const Settings = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await client.get('accounts/me/');
        setProfile(response.data);
      } catch (err) {
        console.error("Failed to fetch settings profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return <div className="animate-pulse py-12 text-slate-400 font-bold text-center">Syncing Configuration...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center">
          <svg className="w-8 h-8 mr-4 text-slate-400 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          Workspace Configuration
        </h1>
        <p className="mt-1 text-sm text-slate-500 font-medium ml-12">Manage platform-wide security primitives and organizational compute policies.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-8 border-slate-200">
            <h3 className="text-xs font-bold text-slate-900 mb-8 pb-4 border-b border-slate-100">Profile Architecture</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-2">Display Alias</label>
                <div className="text-sm font-bold text-slate-900">{profile?.username || 'N/A'}</div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-2">Authenticated Entity</label>
                <div className="text-sm font-mono text-slate-500">ID::{profile?.id?.toString().padStart(4, '0')}</div>
              </div>
            </div>
          </Card>

          <Card className="p-8 border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-900 mb-8 pb-4 border-b border-slate-100">Security Primitives</h3>
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                 <div>
                   <span className="block text-sm font-bold text-slate-900">Multi-Factor Authentication</span>
                   <span className="block text-xs text-slate-500 mt-1 font-medium">Verify login attempts via TOTP secondary layer.</span>
                 </div>
                 <span className="text-[10px] font-bold px-2 py-1 bg-emerald-50 text-emerald-600 rounded border border-emerald-100 leading-none">Healthy</span>
               </div>
               <div className="flex items-center justify-between">
                 <div>
                   <span className="block text-sm font-bold text-slate-900">Real-time Session Monitoring</span>
                   <span className="block text-xs text-slate-500 mt-1 font-medium">Active telemetry tracking for the current session.</span>
                 </div>
                 <span className="text-[10px] font-bold px-2 py-1 bg-indigo-50 text-indigo-600 rounded border border-indigo-100 leading-none">Active</span>
               </div>
            </div>
          </Card>

          <Card className="p-8 border-dashed border-slate-200 bg-slate-50/20">
             <div className="text-center py-6">
                <span className="text-[10px] font-bold text-slate-400 block mb-2">Encryption Subsystem</span>
                <p className="text-xs text-slate-500 font-medium">Advanced cryptographic key rotation and FHE parameter tuning is managed by the core orchestrator.</p>
             </div>
          </Card>
        </div>

        <div className="col-span-1 space-y-6">
          <Card className="p-6 border-slate-200 bg-slate-900 text-white">
            <h3 className="text-[10px] font-bold text-slate-400 mb-6">Compute Infrastructure</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center text-xs">
                 <span className="text-slate-400">Node Status</span>
                 <span className="font-bold flex items-center text-emerald-400">
                   <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
                   Operational
                 </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                 <span className="text-slate-400">Uptime</span>
                 <span className="font-mono text-emerald-100">Live</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-4 border-t border-slate-800">
                 <span className="text-slate-400">Environment</span>
                 <span className="font-mono text-[10px]">Production</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
