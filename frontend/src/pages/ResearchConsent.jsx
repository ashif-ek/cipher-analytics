import React from 'react';
import Card from '../components/ui/Card';

const ResearchConsent = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Research Authorization & Policy</h1>
        <p className="text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
          Configure the global governance model for data utilization in collaborative research environments. 
          All authorizations are cryptographically enforced.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        <Card className="p-8 border-slate-200 hover:border-slate-300 transition-colors">
          <div className="flex items-start space-x-6">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shrink-0">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Differential Privacy</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Inject statistical noise into query results to prevent individual de-identification while maintaining aggregate utility.
              </p>
              <div className="pt-2">
                <span className="text-[10px] font-bold px-2 py-1 bg-emerald-50 text-emerald-600 rounded border border-emerald-100 uppercase tracking-widest">Active Protection</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-8 border-slate-200 hover:border-slate-300 transition-colors">
          <div className="flex items-start space-x-6">
            <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-100 shrink-0">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Institutional Review</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Requires explicit manual approval for any cross-domain data aggregation tasks.
              </p>
               <div className="pt-2">
                <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded border border-slate-200 uppercase tracking-widest">Optional Policy</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="border-slate-200 overflow-hidden mt-12">
        <div className="p-8 space-y-6">
           <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] mb-4">Governance Configuration</h3>
           <div className="divide-y divide-slate-100">
             <div className="py-4 flex items-center justify-between">
               <div>
                 <span className="block text-sm font-bold text-slate-900 tracking-tight">Auto-Archive After Research</span>
                 <span className="block text-xs text-slate-500 mt-1 font-medium">Automatically purge research-granted identifiers post-analysis.</span>
               </div>
               <div className="w-12 h-6 bg-slate-900 rounded-full relative p-1 cursor-pointer">
                 <div className="absolute right-1 top-1 bottom-1 w-4 bg-white rounded-full"></div>
               </div>
             </div>
             <div className="py-4 flex items-center justify-between">
               <div>
                 <span className="block text-sm font-bold text-slate-900 tracking-tight">Public Metadata Disclosure</span>
                 <span className="block text-xs text-slate-500 mt-1 font-medium">Allow researchers to view row counts and high-level column types.</span>
               </div>
               <div className="w-12 h-6 bg-slate-200 rounded-full relative p-1 cursor-pointer shadow-inner">
                 <div className="absolute left-1 top-1 bottom-1 w-4 bg-white rounded-full shadow-sm"></div>
               </div>
             </div>
           </div>
        </div>
      </Card>
    </div>
  );
};

export default ResearchConsent;
