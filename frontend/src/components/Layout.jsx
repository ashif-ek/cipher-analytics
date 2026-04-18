import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const location = useLocation();
  
  const getBreadcrumbs = () => {
    const path = location.pathname;
    const breadcrumbs = [{ name: 'MAIN', path: '/' }];
    
    if (path.startsWith('/datasets')) {
      breadcrumbs.push({ name: 'DATA', path: '/datasets' });
      breadcrumbs.push({ name: 'DATASETS', path: '/datasets' });
    } else if (path === '/upload') {
      breadcrumbs.push({ name: 'DATA', path: '/datasets' });
      breadcrumbs.push({ name: 'UPLOAD', path: '/upload' });
    } else if (path === '/access-control') {
      breadcrumbs.push({ name: 'GOVERNANCE', path: '/access-control' });
      breadcrumbs.push({ name: 'ACCESS', path: '/access-control' });
    } else if (path === '/audit-logs') {
      breadcrumbs.push({ name: 'GOVERNANCE', path: '/audit-logs' });
      breadcrumbs.push({ name: 'LOGS', path: '/audit-logs' });
    } else if (path === '/settings') {
      breadcrumbs.push({ name: 'SETTINGS', path: '/settings' });
    } else if (path === '/profile') {
      breadcrumbs.push({ name: 'PROFILE', path: '/profile' });
    }

    
    return breadcrumbs;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white font-sans text-slate-900">
      {/* Sidebar (Fixed width) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-0 overflow-hidden">
        <Header breadcrumbs={getBreadcrumbs()} />
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-[#f8fafc]">
          <div className="py-6 px-8 max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
