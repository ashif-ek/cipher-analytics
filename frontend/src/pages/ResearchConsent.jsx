import React from 'react';
import Card from '../components/ui/Card';

const ResearchConsent = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200/90">
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
            POLICY::COMPLIANCE
          </span>
          <span className="text-xs font-mono text-slate-400">INSTITUTIONAL DATA USE GOVERNANCE</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
          Research Authorization & Policy
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Configure the global governance model for data utilization in collaborative research environments. All authorizations are cryptographically enforced.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-start space-x-4">
            <div className="h-9 w-9 rounded bg-purple-50 flex items-center justify-center text-purple-700 border border-purple-200 shrink-0">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Differential Privacy</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Inject statistical noise into query results to prevent individual de-identification while maintaining aggregate utility.
              </p>
              <div className="pt-1">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">ACTIVE PROTECTION</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start space-x-4">
            <div className="h-9 w-9 rounded bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200 shrink-0">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Institutional Review</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Requires explicit manual approval for any cross-domain data aggregation tasks.
              </p>
               <div className="pt-1">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200">OPTIONAL POLICY</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="border-b border-slate-100 pb-3 mb-4">
          <h3 className="text-xs font-semibold text-slate-900">Governance Configuration</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Enclave-level retention and disclosure directives.</p>
        </div>
        <div className="divide-y divide-slate-100">
          <div className="py-3.5 flex items-center justify-between">
            <div>
              <span className="block text-xs font-semibold text-slate-900">Auto-Archive After Research</span>
              <span className="block text-[11px] text-slate-500 mt-0.5">Automatically purge research-granted identifiers post-analysis.</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-sky-50 text-sky-700 rounded border border-sky-200">
              ENFORCED
            </span>
          </div>
          <div className="py-3.5 flex items-center justify-between">
            <div>
              <span className="block text-xs font-semibold text-slate-900">Public Metadata Disclosure</span>
              <span className="block text-[11px] text-slate-500 mt-0.5">Allow researchers to view row counts and high-level column types.</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
              DISCOVERABLE ONLY
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ResearchConsent;
