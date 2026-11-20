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
    return <div className="py-12 text-slate-400 font-mono text-xs text-center">Syncing workspace configuration...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200/90">
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
            SYSTEM::CONFIG
          </span>
          <span className="text-xs font-mono text-slate-400">ORGANIZATIONAL POLICIES & CONTROLS</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
          Workspace Configuration
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Platform-wide security primitives, zero-trust governance parameters, and session management.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-xs font-semibold text-slate-900">Authenticated Identity Context</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Active cryptographic role and principal identifier.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">Display Alias</label>
                <div className="text-xs font-semibold text-slate-900 font-mono">{profile?.username || 'N/A'}</div>
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">Principal Entity ID</label>
                <div className="text-xs font-mono text-slate-600">ID::{profile?.id?.toString().padStart(4, '0')}</div>
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">Assigned Role</label>
                <div className="text-xs font-mono text-sky-600 font-semibold">{profile?.role}</div>
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">Email Endpoint</label>
                <div className="text-xs font-mono text-slate-600">{profile?.email}</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-xs font-semibold text-slate-900">Security & Authentication Primitives</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Hardened platform defense mechanisms currently active.</p>
            </div>
            <div className="space-y-4 divide-y divide-slate-100">
              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="block text-xs font-semibold text-slate-900">TOTP Secondary Authentication</span>
                  <span className="block text-[11px] text-slate-500 mt-0.5">Enforces 6-digit OTP verification upon authentication.</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                  ENFORCED
                </span>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div>
                  <span className="block text-xs font-semibold text-slate-900">Distributed IP Throttling</span>
                  <span className="block text-[11px] text-slate-500 mt-0.5">Strict rate limiters prevent credential stuffing and brute-force probing.</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-sky-50 text-sky-700 rounded border border-sky-200">
                  REDIS-BACKED
                </span>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div>
                  <span className="block text-xs font-semibold text-slate-900">Cross-Device Token Invalidation</span>
                  <span className="block text-[11px] text-slate-500 mt-0.5">Blacklists all outstanding JWT refresh tokens upon lockout or logout.</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                  ENABLED
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Info Rail */}
        <div className="space-y-6">
          <Card className="p-5 border-slate-200 bg-slate-50/60">
            <h4 className="text-xs font-semibold text-slate-900 mb-2">Cryptographic Key Management</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              CKKS evaluation keys and Galois keys are maintained in the encrypted vault. Polynomial parameters are sealed at N=8192 with scale 2^40.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-200/80 text-[10px] font-mono text-slate-400">
              STATUS: SEAL_CONTEXT_VALIDATED
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
