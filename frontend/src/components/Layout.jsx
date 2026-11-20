import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const location = useLocation();
  
  const getBreadcrumbs = () => {
    const path = location.pathname;
    const breadcrumbs = [{ name: 'CONSOLE', path: '/' }];
    
    if (path.startsWith('/datasets/') && path !== '/datasets') {
      breadcrumbs.push({ name: 'CATALOG', path: '/datasets' });
      breadcrumbs.push({ name: 'ARTIFACT_INSPECTOR', path: path });
    } else if (path.startsWith('/datasets')) {
      breadcrumbs.push({ name: 'CATALOG', path: '/datasets' });
    } else if (path === '/upload') {
      breadcrumbs.push({ name: 'CATALOG', path: '/datasets' });
      breadcrumbs.push({ name: 'INGEST', path: '/upload' });
    } else if (path === '/access-control') {
      breadcrumbs.push({ name: 'GOVERNANCE', path: '/access-control' });
      breadcrumbs.push({ name: 'ACCESS_GRANTS', path: '/access-control' });
    } else if (path === '/audit-logs') {
      breadcrumbs.push({ name: 'GOVERNANCE', path: '/audit-logs' });
      breadcrumbs.push({ name: 'AUDIT_TIMELINE', path: '/audit-logs' });
    } else if (path === '/research-requests') {
      breadcrumbs.push({ name: 'GOVERNANCE', path: '/research-requests' });
      breadcrumbs.push({ name: 'BRIEFS', path: '/research-requests' });
    } else if (path === '/settings') {
      breadcrumbs.push({ name: 'SYSTEM', path: '/settings' });
    } else if (path === '/profile') {
      breadcrumbs.push({ name: 'IDENTITY', path: '/profile' });
    }
    
    return breadcrumbs;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* Sidebar (Fixed width) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-0 overflow-hidden">
        <Header breadcrumbs={getBreadcrumbs()} />
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-[#f8fafc]">
          <div className="py-6 px-8 max-w-[1500px] mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
