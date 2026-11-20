import React from 'react';
import { Link } from 'react-router-dom';
import UserProfile from './UserProfile';
import Modal from './ui/Modal';

const Header = ({ breadcrumbs = [] }) => {
  const [isHelpOpen, setIsHelpOpen] = React.useState(false);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  };

  const helpContent = (
    <div className="space-y-4 text-xs text-slate-600 leading-relaxed font-sans">
      <div>
        <h4 className="font-semibold text-slate-900 mb-1">Architecture & FHE Pipeline</h4>
        <p>Cipher Analytics executes statistical queries and ML workloads over encrypted vectors using the Cheon-Kim-Kim-Song (CKKS) scheme. Plaintext data is never loaded into computation memory during arithmetic evaluations.</p>
      </div>
      <div className="p-3 bg-slate-50 border border-slate-200 rounded font-mono text-[11px] space-y-1 text-slate-700">
        <div>• Polynomial Modulus Degree: 8192</div>
        <div>• Modulus Bit Sizes: [60, 40, 40, 60]</div>
        <div>• SIMD Slots: 4096 (Vector batching)</div>
        <div>• Scaling Factor: 2^40</div>
      </div>
      <div>
        <h4 className="font-semibold text-slate-900 mb-1">Zero-Trust Access Governance</h4>
        <ul className="list-disc pl-4 space-y-1 text-slate-600">
          <li><strong>STRICT:</strong> Explicit time-bounded Research Grant required.</li>
          <li><strong>WHITELIST:</strong> Access restricted to explicit team members.</li>
          <li><strong>AGGREGATED:</strong> Privacy-preserving aggregations protected by k-anonymity (n ≥ 5) and cardinality traps.</li>
        </ul>
      </div>
    </div>
  );

  return (
    <header className="bg-white border-b border-slate-200/90 h-13 flex items-center justify-between px-6 shrink-0 sticky top-0 z-30 shadow-[0_1px_2px_0_rgba(15,23,42,0.03)]">
      {/* Breadcrumbs Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center space-x-2 overflow-hidden">
        <span className="text-[11px] font-mono font-bold text-slate-400">CIPHER</span>
        {breadcrumbs.map((bc, idx) => (
          <React.Fragment key={bc.name}>
            <span className="text-slate-300 text-xs select-none">/</span>
            <Link 
              to={bc.path} 
              className={`text-xs font-medium tracking-tight whitespace-nowrap transition-colors ${
                idx === breadcrumbs.length - 1 
                  ? 'text-slate-900 font-semibold pointer-events-none' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {bc.name}
            </Link>
          </React.Fragment>
        ))}
      </nav>
      
      {/* System Telemetry & User Controls */}
      <div className="flex items-center space-x-3.5">
        {/* Real-time Enclave Status Pill */}
        <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-100/80 border border-slate-200 text-[10px] font-mono text-slate-600">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>ENCLAVE: ACTIVE</span>
        </div>

        {/* System Documentation / Spec */}
        <button 
          onClick={() => setIsHelpOpen(true)}
          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors" 
          title="FHE Specifications & Help"
          aria-label="FHE Specifications & Help"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        <Modal 
          isOpen={isHelpOpen}
          onClose={() => setIsHelpOpen(false)}
          onConfirm={() => setIsHelpOpen(false)}
          title="Cipher Analytics System & Cryptographic Architecture"
          message={helpContent}
          confirmText="Acknowledge"
          size="lg"
        />

        {/* Audit / Alerts Direct Link */}
        <Link 
          to="/access-control" 
          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors relative" 
          title="Access Governance"
          aria-label="Access Governance"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </Link>

        <div className="h-4 w-px bg-slate-200"></div>

        {/* User Profile Context Menu */}
        <UserProfile onLogout={handleLogout} />
      </div>
    </header>
  );
};

export default Header;
