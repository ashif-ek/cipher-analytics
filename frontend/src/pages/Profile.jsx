import React, { useState, useEffect } from 'react';
import client from '../api/client';
import Card from '../components/ui/Card';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

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
                username: response.data.username || '',
                email: response.data.email || '',
                profile: response.data.profile || {}
            });
        } catch (err) {
            setError("Failed to load profile context.");
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
        return <div className="py-12 text-center text-xs font-mono text-slate-400">Loading identity context...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="pb-4 border-b border-slate-200/90">
                <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                        IDENTITY::CONTEXT
                    </span>
                    <span className="text-xs font-mono text-slate-400">PRINCIPAL METADATA & REPUTATION</span>
                </div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
                    Identity Context & Credentials
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                    Manage your verified researcher or data owner profile information presented to data stewards during grant requests.
                </p>
            </div>

            {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs font-medium text-rose-700">
                    {error}
                </div>
            )}

            {success && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs font-medium text-emerald-700">
                    Identity metadata saved and synchronized across the enclave cluster.
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="p-6 space-y-6">
                    <div>
                        <h3 className="text-xs font-semibold text-slate-900 mb-1">Core Identity Parameters</h3>
                        <p className="text-[11px] text-slate-400">Authenticated system credentials and institutional identity.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Username / Identifier</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="block w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-mono"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Primary Email Endpoint</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                disabled
                                className="block w-full px-3 py-1.5 border border-slate-200 bg-slate-50 rounded text-xs text-slate-500 font-mono cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-5">
                        <h3 className="text-xs font-semibold text-slate-900 mb-1">Professional Context</h3>
                        <p className="text-[11px] text-slate-400 mb-4">Organizational affiliation visible to dataset owners.</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Organization / Institution</label>
                                <input
                                    type="text"
                                    name="profile.organization"
                                    value={formData.profile?.organization || ''}
                                    onChange={handleChange}
                                    placeholder="e.g. Stanford University / BioTech Labs"
                                    className="block w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Job Title / Research Role</label>
                                <input
                                    type="text"
                                    name="profile.job_title"
                                    value={formData.profile?.job_title || ''}
                                    onChange={handleChange}
                                    placeholder="e.g. Lead Cryptography Researcher"
                                    className="block w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-xs font-medium text-slate-700 mb-1">Research Specialization & Bio</label>
                                <textarea
                                    name="profile.bio"
                                    rows="3"
                                    value={formData.profile?.bio || ''}
                                    onChange={handleChange}
                                    placeholder="Brief description of your research focus, methodology, and security clearance..."
                                    className="block w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 leading-relaxed"
                                ></textarea>
                            </div>
                        </div>
                    </div>
                </Card>

                <div className="flex items-center justify-end space-x-3">
                    <button
                        type="submit"
                        disabled={saving}
                        className={`px-5 py-2 rounded text-xs font-medium text-white shadow-sm transition-colors ${
                            saving 
                                ? 'bg-slate-400 cursor-not-allowed' 
                                : 'bg-slate-900 hover:bg-slate-800'
                        }`}
                    >
                        {saving ? 'Saving Identity...' : 'Save Profile Context'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Profile;
