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
    <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
      <div>
        <h4 className="font-bold text-slate-900 mb-1">Project Overview</h4>
        <p>Cipher Analytics is a production-grade, Zero-Trust platform designed for secure data processing using Fully Homomorphic Encryption (FHE). Our system ensures that sensitive datasets remain encrypted throughout their entire lifecycle—from ingestion to computation.</p>
      </div>
      <div>
        <h4 className="font-bold text-slate-900 mb-1">Data Guidelines</h4>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong>Safe Ingestion:</strong> We auto-detect delimiters (comma, semicolon, tab) and encodings (UTF-8, Latin-1).</li>
          <li><strong>Profiling:</strong> Datasets are validated for null ratios and feature variance to ensure mathematical integrity.</li>
          <li><strong>Encryption:</strong> All numeric data is transformed into CKKS ciphertexts using slot-aware chunking for high performance.</li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold text-slate-900 mb-1">Security Protocols</h4>
        <p>Every analytical operation (Mean, Correlation, Anomalies) is performed in the encrypted domain. No researcher ever sees your raw data.</p>
      </div>
    </div>
  );

  return (
    <header className="bg-white border-b border-slate-200 h-14 flex items-center justify-between px-6 shrink-0 sticky top-0 z-30 shadow-[0_1px_2px_0_rgba(0,0,0,0.03)]">
      <div className="flex items-center space-x-3 overflow-hidden">
        {breadcrumbs.map((bc, idx) => (
          <React.Fragment key={bc.name}>
            {idx > 0 && <span className="text-slate-300 text-[10px] font-bold">/</span>}
            <a 
              href={bc.path} 
              className={`text-[10px] font-bold tracking-tight whitespace-nowrap transition-colors ${
                idx === breadcrumbs.length - 1 
                  ? 'text-slate-900 pointer-events-none' 
                  : 'text-slate-400 hover:text-slate-900'
              }`}
            >
              {bc.name}
            </a>
          </React.Fragment>
        ))}
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Support/Help */}
        <button 
          onClick={() => setIsHelpOpen(true)}
          className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded transition-all" 
          title="Project Help & Guidelines"
        >
          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </button>

        <Modal 
          isOpen={isHelpOpen}
          onClose={() => setIsHelpOpen(false)}
          onConfirm={() => setIsHelpOpen(false)}
          title="Cipher Analytics System Guide"
          message={helpContent}
          confirmText="Got it"
          size="lg"
        />

        {/* Notifications */}
        <Link to="/access-control" className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded transition-all relative" title="Alerts">
          <svg className="h-4.5 w-4.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1 right-1 block h-1.5 w-1.5 rounded-full bg-blue-600 ring-2 ring-white"></span>
        </Link>

        <div className="h-6 w-px bg-slate-200 mx-1"></div>

        {/* User Profile Dropdown */}
        <div className="flex items-center">
          <UserProfile onLogout={handleLogout} />
        </div>
      </div>
    </header>
  );
};

export default Header;
