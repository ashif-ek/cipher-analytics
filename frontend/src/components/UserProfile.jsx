import React, { useState, useEffect, useRef } from 'react';
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
    return <div className="text-sm text-gray-400 font-medium">Loading...</div>;
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 focus:outline-none hover:opacity-80 transition-opacity"
      >
        <div className="hidden sm:block text-right">
          <p className="text-sm font-semibold text-gray-900">{profile.username}</p>
          <p className="text-xs text-gray-500 capitalize">{profile.role.replace('_', ' ').toLowerCase()}</p>
        </div>
        {profile.profile_picture ? (
          <img src={profile.profile_picture} alt="Profile" className="h-10 w-10 rounded-full object-cover border border-gray-300 shadow-sm" />
        ) : (
          <div className="h-10 w-10 rounded-full bg-gray-900 flex items-center justify-center text-white text-lg font-bold shadow-sm">
            {profile.username.charAt(0).toUpperCase()}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 bg-white border border-gray-200 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 rounded-sm">
          <div className="p-5 border-b border-gray-100 bg-gray-50">
            <h3 className="text-base font-bold text-gray-900 truncate">{profile.username}</h3>
            <p className="text-xs text-gray-500 truncate mt-1">{profile.email}</p>
            
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs font-semibold px-2.5 py-1 bg-gray-200 text-gray-800 border border-gray-300 uppercase tracking-wide rounded-sm">
                {profile.role === 'DATA_OWNER' ? 'Data Owner' : 'Researcher'}
              </span>
              
              <div className="text-xs text-green-700 font-medium flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                Active
              </div>
            </div>
          </div>
          <div className="p-2">
            <button 
              onClick={onLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium rounded-sm"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
