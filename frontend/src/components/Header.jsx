import React from 'react';
import UserProfile from './UserProfile';

const Header = ({ breadcrumbs = [] }) => {
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  };

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
        {/* Global Search */}
        <div className="relative hidden md:block group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
             <svg className="h-3.5 w-3.5 text-slate-400 group-focus-within:text-slate-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-64 pl-9 pr-4 py-1.5 border border-slate-200 rounded-[4px] bg-slate-50/50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-slate-400 focus:border-slate-400 text-[11px] transition-all font-medium"
            placeholder="Search resources, services, and docs..."
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-[10px] text-slate-300 border border-slate-200 px-1 rounded bg-white">/</span>
          </div>
        </div>
        
        {/* Support/Help */}
        <button className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded transition-all transition-colors" title="Support">
          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </button>

        {/* Notifications */}
        <button className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded transition-all relative" title="Alerts">
          <svg className="h-4.5 w-4.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1 right-1 block h-1.5 w-1.5 rounded-full bg-blue-600 ring-2 ring-white"></span>
        </button>

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
