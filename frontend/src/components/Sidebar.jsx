import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  let role = 'DATA_OWNER';
  try {
    const token = localStorage.getItem('access_token');
    if (token) role = jwtDecode(token).role;
  } catch (e) {}

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login', { replace: true });
  };

  const categories = [
    {
      name: 'PLATFORM',
      items: [
        { name: 'Research Console', path: '/', icon: 'home', roles: ['DATA_OWNER', 'RESEARCHER'] },
        { name: 'Analytical Briefs', path: '/research-requests', icon: 'clipboard-list', roles: ['RESEARCHER'] },
        { name: 'Identity & Credentials', path: '/profile', icon: 'user', roles: ['DATA_OWNER', 'RESEARCHER'] },
      ]
    },
    {
      name: 'ASSETS & STORAGE',
      items: [
        { name: 'Data Catalog', path: '/datasets', icon: 'database', roles: ['DATA_OWNER'] },
        { name: 'Ingest Dataset', path: '/upload', icon: 'upload', roles: ['DATA_OWNER'] },
      ]
    },
    {
      name: 'ZERO-TRUST GOVERNANCE',
      items: [
        { name: 'Access Grants', path: '/access-control', icon: 'shield', roles: ['DATA_OWNER', 'ADMIN'] },
        { name: 'Audit Timeline', path: '/audit-logs', icon: 'clipboard-list', roles: ['DATA_OWNER', 'ADMIN'] },
      ]
    },
    {
      name: 'SYSTEM',
      items: [
        { name: 'Workspace Configuration', path: '/settings', icon: 'cog', roles: ['DATA_OWNER', 'RESEARCHER', 'ADMIN'] },
      ]
    }
  ];

  const getIcon = (name) => {
    switch (name) {
      case 'home':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />;
      case 'user':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />;
      case 'database':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />;
      case 'upload':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />;
      case 'shield':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />;
      case 'clipboard-list':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />;
      case 'cog':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />;
      default:
        return null;
    }
  };

  return (
    <aside className="w-[230px] bg-[#0b0f19] h-full flex flex-col text-slate-300 shrink-0 select-none border-r border-slate-850">
      {/* Brand Header */}
      <div className="h-13 flex items-center justify-between px-4 border-b border-slate-800/80 bg-[#0f172a]/60 shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="w-6 h-6 bg-sky-600 rounded flex items-center justify-center shadow-sm">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold tracking-tight text-white font-mono leading-none">CIPHER</span>
            <span className="text-[9px] font-mono tracking-wider text-slate-400 uppercase mt-0.5">ANALYTICS v2.0</span>
          </div>
        </div>
        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
          FHE
        </span>
      </div>
      
      {/* Navigation Sections */}
      <div className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
        <div className="space-y-5">
          {categories.map((cat) => {
            const visibleItems = cat.items.filter(i => i.roles.includes(role));
            if (visibleItems.length === 0) return null;
            
            return (
              <div key={cat.name} className="px-3">
                <h3 className="px-2 text-[9px] font-mono font-semibold text-slate-400 mb-1.5 tracking-wider uppercase">
                  {cat.name}
                </h3>
                <nav className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <NavLink
                        key={item.name}
                        to={item.path}
                        className={`flex items-center px-2.5 py-1.5 text-xs font-medium rounded transition-colors group relative ${
                          isActive 
                            ? 'bg-slate-800/90 text-sky-400 border border-slate-700/60' 
                            : 'text-slate-400 hover:bg-slate-850/60 hover:text-slate-200'
                        }`}
                      >
                        <svg 
                          className={`w-3.5 h-3.5 mr-2.5 shrink-0 transition-colors ${isActive ? 'text-sky-400' : 'text-slate-400 group-hover:text-slate-300'}`} 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          {getIcon(item.icon)}
                        </svg>
                        <span className="truncate">{item.name}</span>
                        {isActive && (
                          <span className="ml-auto w-1.5 h-1.5 bg-sky-400 rounded-full shadow-[0_0_6px_rgba(56,189,248,0.6)]"></span>
                        )}
                      </NavLink>
                    );
                  })}
                </nav>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer / Terminate */}
      <div className="p-3 bg-[#0f172a]/40 border-t border-slate-800/80">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 rounded transition-colors group"
        >
          <svg 
            className="w-3.5 h-3.5 mr-2.5 shrink-0 text-slate-400 group-hover:text-rose-400 transition-colors" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="truncate">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
