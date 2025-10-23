"use client"

import React, { useState, useEffect } from 'react';
import { User, ArrowLeft, Save } from 'lucide-react';

const EditProfilePage = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: ''
    });

    const [originalData, setOriginalData] = useState({
        name: ''
    });

    useEffect(() => {
        const userId = localStorage.getItem("userId");
        const authToken = localStorage.getItem("authToken");

        if (!userId || !authToken) {
            window.location.href = '/auth/login';
            return;
        }

        fetchUserData(userId, authToken);
    }, []);

    const fetchUserData = async (userId, authToken) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }

            const userData = await response.json();

            const data = {
                name: userData.name || ''
            };

            setFormData(data);
            setOriginalData(data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching user data:', err);
            setError('Failed to load user data');
            setLoading(false);
        }
    };

    const handleNameChange = (e) => {
        setFormData(prev => ({
            ...prev,
            name: e.target.value
        }));
        setError(null);
        setSuccess(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setError('Name is required');
            return;
        }

        setSaving(true);
        setError(null);

        const userId = localStorage.getItem("userId");
        const authToken = localStorage.getItem("authToken");

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/${userId}/edit`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name.trim()
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update profile');
            }

            const result = await response.json();

            setSuccess(true);
            setOriginalData(formData);
            window.scrollTo({ top: 0, left: 0, behavior: "smooth" });

            setTimeout(() => {
                window.location.href = '/user';
            }, 1500);

        } catch (err) {
            console.error('Error updating profile:', err);
            setError(err.message || 'Failed to update profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        window.location.href = '/user';
    };

    const hasChanges = () => {
        return formData.name !== originalData.name;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-blue-600 font-medium">Loading Profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#dbeafe' }}>
            <header className="shadow-lg" style={{ backgroundColor: '#1c398e' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handleCancel}
                            className="p-3 hover:bg-blue-500 rounded-xl transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-white" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
                            <p className="text-blue-200">Update your name</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="px-8 py-6" style={{ backgroundColor: '#1c398e' }}>
                        <div className="flex items-center space-x-3">
                            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                                <User className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Profile Information</h2>
                                <p className="text-blue-100 text-sm">Keep your information up to date</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        {success && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
                                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                                <p className="text-green-800 font-medium">Profile updated successfully! Redirecting...</p>
                            </div>
                        )}

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                                <div className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5">✕</div>
                                <p className="text-red-800">{error}</p>
                            </div>
                        )}

                        <div className="mb-8">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={handleNameChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#1c398e] transition-all"
                                placeholder="Enter your full name"
                                disabled={saving}
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={saving || !hasChanges()}
                                className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                                    saving || !hasChanges()
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'text-white hover:opacity-90 transform hover:scale-105 shadow-md hover:shadow-lg'
                                }`}
                                style={saving || !hasChanges() ? {} : { backgroundColor: '#1c398e' }}
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-5 w-5" />
                                        <span>Save Changes</span>
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={saving}
                                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                        </div>

                        {!hasChanges() && (
                            <p className="text-sm text-gray-500 text-center mt-4">
                                No changes detected
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditProfilePage;