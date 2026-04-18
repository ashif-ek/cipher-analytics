import React, { useState, useEffect } from 'react';
import client from '../api/client';
import Card from '../components/ui/Card';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState('info');

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        profile: {
            bio: '',
            organization: '',
            job_title: '',
            location: '',
            phone_number: '',
            website: '',
            specialization: ''
        }
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await client.get('accounts/me/');
            setUser(response.data);
            setFormData({
                username: response.data.username,
                email: response.data.email,
                profile: response.data.profile || {}
            });
        } catch (err) {
            setError("Failed to load profile data.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('profile.')) {
            const profileField = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                profile: {
                    ...prev.profile,
                    [profileField]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSuccess(false);
        setError(null);
        try {
            const response = await client.put(`accounts/users/${user.id}/`, formData);
            setUser(response.data);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Profile Header */}
            <div className="relative group">
                <div className="h-48 w-full bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 rounded-[4px] shadow-lg overflow-hidden relative">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent"></div>
                    <div className="absolute top-4 right-4 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-[4px] text-[10px] font-bold text-white uppercase tracking-wider">
                        {user?.role?.replace('_', ' ')}
                    </div>
                </div>
                
                <div className="px-8 -mt-16 relative z-10 flex flex-col sm:flex-row items-end sm:space-x-6">
                    <div className="relative group/avatar">
                        <div className="h-32 w-32 rounded-[4px] border-4 border-[#f8fafc] bg-slate-900 shadow-xl flex items-center justify-center text-4xl font-black text-white overflow-hidden">
                            {user?.profile_picture ? (
                                <img src={user.profile_picture} alt="Profile" className="h-full w-full object-cover" />
                            ) : (
                                user?.username?.charAt(0).toUpperCase()
                            )}
                        </div>
                        <button className="absolute bottom-2 right-2 p-1.5 bg-blue-600 rounded-[4px] text-white shadow-lg opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </button>
                    </div>
                    
                    <div className="flex-1 pb-2 mt-4 sm:mt-0">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{user?.username}</h1>
                        <p className="text-slate-500 font-medium flex items-center mt-1">
                            <svg className="w-4 h-4 mr-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            {user?.email}
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Info */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="p-6">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Credentials</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 mb-1">Entity ID</label>
                                <code className="text-[11px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">ID::{(user?.id || 0).toString().padStart(4, '0')}</code>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 mb-1">Member Since</label>
                                <span className="text-xs font-bold text-slate-700">{new Date(user?.created_at).toLocaleDateString()}</span>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 mb-1">Status</label>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                    <span className="w-1 h-1 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                                    Verified
                                </span>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-slate-900 border-none shadow-blue-500/10 shadow-2xl">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Security Level</h3>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-white">Trust Matrix</span>
                            <span className="text-[10px] font-bold text-blue-400 uppercase">Tier 1</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full w-[85%] bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                        </div>
                        <p className="mt-4 text-[10px] leading-relaxed text-slate-400 font-medium">Your account is secured with end-to-end homomorphic encryption and hardware-level isolation.</p>
                    </Card>
                </div>

                {/* Main Form Fields */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Tabs */}
                    <div className="flex space-x-1 p-1 bg-slate-100 rounded-[4px]">
                        <button 
                            onClick={() => setActiveTab('info')}
                            className={`flex-1 py-2 text-[11px] font-bold rounded-[4px] transition-all ${activeTab === 'info' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Professional Information
                        </button>
                        <button 
                            onClick={() => setActiveTab('special')}
                            className={`flex-1 py-2 text-[11px] font-bold rounded-[4px] transition-all ${activeTab === 'special' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {user?.role === 'RESEARCHER' ? 'Research Interests' : 'Data Specialty'}
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <Card className="p-8">
                            {activeTab === 'info' ? (
                                <div className="space-y-8 animate-in fade-in duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Organization</label>
                                            <input 
                                                type="text" 
                                                name="profile.organization"
                                                value={formData.profile.organization}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-[4px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                                                placeholder="Cipher Labs Int."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Job Title</label>
                                            <input 
                                                type="text" 
                                                name="profile.job_title"
                                                value={formData.profile.job_title}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-[4px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                                                placeholder="Senior Researcher"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</label>
                                            <input 
                                                type="text" 
                                                name="profile.location"
                                                value={formData.profile.location}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-[4px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                                                placeholder="Zurich, Switzerland"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                                            <input 
                                                type="text" 
                                                name="profile.phone_number"
                                                value={formData.profile.phone_number}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-[4px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                                                placeholder="+41 44 123 4567"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Professional Bio</label>
                                        <textarea 
                                            name="profile.bio"
                                            value={formData.profile.bio}
                                            onChange={handleChange}
                                            rows="4"
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-[4px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium resize-none"
                                            placeholder="Write a brief professional summary..."
                                        ></textarea>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                         <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Website / Portfolio</label>
                                            <input 
                                                type="url" 
                                                name="profile.website"
                                                value={formData.profile.website}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-[4px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                                                placeholder="https://research.cipher.io"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8 animate-in fade-in duration-300">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            {user?.role === 'RESEARCHER' ? 'Research Interest & Expertise' : 'Data Domain & Specialty'}
                                        </label>
                                        <textarea 
                                            name="profile.specialization"
                                            value={formData.profile.specialization}
                                            onChange={handleChange}
                                            rows="8"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-[4px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium resize-none"
                                            placeholder={user?.role === 'RESEARCHER' ? 'Describe your research focus, methodology, and preferred data types (e.g., medical imaging, genomic sequences)...' : 'Describe your data assets, collection methods, and quality standards...'}
                                        ></textarea>
                                    </div>
                                </div>
                            )}

                            <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between">
                                <div className="flex items-center">
                                    {success && (
                                        <span className="text-[11px] font-bold text-emerald-600 flex items-center animate-in slide-in-from-left-4">
                                            <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                            Configuration updated successfully
                                        </span>
                                    )}
                                    {error && (
                                        <span className="text-[11px] font-bold text-red-600 flex items-center animate-in slide-in-from-left-4">
                                            <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                            {error}
                                        </span>
                                    )}
                                </div>
                                <div className="flex space-x-4">
                                    <button 
                                        type="button" 
                                        onClick={fetchProfile}
                                        className="px-6 py-2 text-[11px] font-black text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest"
                                    >
                                        Revert
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={saving}
                                        className={`px-8 py-2.5 bg-blue-600 text-white text-[11px] font-black rounded-[4px] uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:shadow-blue-500/40 transition-all flex items-center ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {saving ? (
                                            <>
                                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                                Persisting...
                                            </>
                                        ) : 'Synchronize Profile'}
                                    </button>
                                </div>
                            </div>
                        </Card>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
