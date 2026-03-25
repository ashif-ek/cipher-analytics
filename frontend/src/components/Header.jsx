import React from 'react';
import UserProfile from './UserProfile';

const Header = ({ title = 'Dashboard' }) => {
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  };

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shrink-0 sticky top-0 z-30">
      <div className="flex items-center">
        <h2 className="text-xl font-semibold text-slate-900 tracking-tight">{title}</h2>
      </div>
      
      <div className="flex items-center space-x-6">
        {/* Search Bar Placeholder */}
        <div className="relative hidden lg:block">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
             <svg className="h-3.5 w-3.5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-72 pl-10 pr-4 py-1.5 border border-slate-200 rounded-md leading-5 bg-slate-50/50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-xs transition-all font-medium"
            placeholder="Search assets by ID or Name..."
          />
        </div>
        
        {/* Notifications */}
        <button className="text-slate-400 hover:text-slate-500 relative focus:outline-none">
          <span className="sr-only">View notifications</span>
          <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>

        {/* User Profile Dropdown */}
        <div className="pl-4 border-l border-slate-200">
          <UserProfile onLogout={handleLogout} />
        </div>
      </div>
    </header>
  );
};

export default Header;
