import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const location = useLocation();
  
  const getHeaderTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'System Overview';
    if (path.startsWith('/datasets')) return 'Dataset Registry';
    if (path === '/upload') return 'Data Ingestion';
    return 'Cipher Platform';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      {/* Sidebar (Fixed width) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-0 overflow-hidden">
        <Header title={getHeaderTitle()} />
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-8 px-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
