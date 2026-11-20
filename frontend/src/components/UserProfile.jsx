import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';

const UserProfile = ({ onLogout }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await client.get('accounts/me/');
        setProfile(response.data);
      } catch (error) {
        console.error("Failed to fetch user profile", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return <div className="text-xs text-slate-400 font-mono">auth::syncing...</div>;
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2.5 focus:outline-none p-1 rounded hover:bg-slate-100 transition-colors"
      >
        <div className="hidden sm:flex flex-col text-right">
          <span className="text-xs font-semibold text-slate-800 leading-none">{profile.username}</span>
          <span className="text-[10px] font-mono text-slate-500 mt-0.5">
            {profile.role === 'DATA_OWNER' ? 'DATA_OWNER' : profile.role}
          </span>
        </div>
        {profile.profile_picture ? (
          <img src={profile.profile_picture} alt="Profile" className="h-7 w-7 rounded object-cover border border-slate-300" />
        ) : (
          <div className="h-7 w-7 rounded bg-slate-800 flex items-center justify-center text-white text-xs font-bold font-mono">
            {profile.username.charAt(0).toUpperCase()}
          </div>
        )}
        <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 shadow-xl z-50 rounded-md py-1 animate-in fade-in duration-100">
          <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/50">
            <div className="text-xs font-semibold text-slate-900 truncate">{profile.username}</div>
            <div className="text-[11px] font-mono text-slate-500 truncate mt-0.5">{profile.email}</div>
            
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[9px] font-mono uppercase font-semibold px-1.5 py-0.5 bg-slate-200/80 text-slate-700 rounded">
                {profile.role}
              </span>
              <div className="text-[10px] font-mono text-emerald-600 flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                ACTIVE
              </div>
            </div>
          </div>

          <div className="py-1">
            <Link 
              to="/profile" 
              onClick={() => setIsOpen(false)}
              className="flex items-center px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <svg className="w-3.5 h-3.5 mr-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Identity Context & Keys
            </Link>

            <Link 
              to="/settings" 
              onClick={() => setIsOpen(false)}
              className="flex items-center px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <svg className="w-3.5 h-3.5 mr-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
              Workspace Configuration
            </Link>
          </div>

          <div className="border-t border-slate-100 pt-1 mt-1">
            <button
              onClick={() => {
                setIsOpen(false);
                if (onLogout) onLogout();
              }}
              className="w-full flex items-center px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <svg className="w-3.5 h-3.5 mr-2.5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Terminate Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
