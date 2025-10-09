"use client"

import React, { useState, useEffect } from 'react';
import { User, ArrowLeft, Save, X, Info } from 'lucide-react';

const PREFERENCE_OPTIONS = ['Engineering', 'Design', 'Marketing', 'Product', 'Data'];
const MAX_PREFERENCES = 3;

const EditProfilePage = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        preference: []
    });

    const [originalData, setOriginalData] = useState({
        name: '',
        preference: []
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

            const storedPref = localStorage.getItem('prefrence') || '';
            const preferencesArray = storedPref.trim() ? storedPref.split(',').map(p => p.trim()).filter(p => p) : [];

            const data = {
                name: userData.name || '',
                preference: preferencesArray
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

    const handlePreferenceToggle = (preference) => {
        setFormData(prev => {
            const currentPreferences = prev.preference;
            const isSelected = currentPreferences.includes(preference);

            let newPreferences;
            if (isSelected) {
                newPreferences = currentPreferences.filter(p => p !== preference);
            } else {
                if (currentPreferences.length >= MAX_PREFERENCES) {
                    return prev;
                }
                newPreferences = [...currentPreferences, preference];
            }

            return {
                ...prev,
                preference: newPreferences
            };
        });
        setError(null);
        setSuccess(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setError('Name is required');
            return;
        }

        if (formData.preference.length === 0) {
            setError('Please select at least one preference');
            return;
        }

        setSaving(true);
        setError(null);

        const userId = localStorage.getItem("userId");
        const authToken = localStorage.getItem("authToken");

        try {
            const preferencesString = formData.preference.join(',');

            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/${userId}/edit`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    preference: preferencesString
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update profile');
            }

            const result = await response.json();

            localStorage.removeItem("prefrence");
            localStorage.setItem('prefrence', preferencesString);

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
        const nameChanged = formData.name !== originalData.name;
        const preferencesChanged = JSON.stringify([...formData.preference].sort()) !== JSON.stringify([...originalData.preference].sort());
        return nameChanged || preferencesChanged;
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

    const isLimitReached = formData.preference.length >= MAX_PREFERENCES;

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
                            <p className="text-blue-200">Update your name and job preferences</p>
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
                                <X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
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

                        <div className="mb-8">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Job Preferences <span className="text-red-500">*</span>
                            </label>

                            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                    <p className="text-sm text-blue-800 font-medium">
                                        Select up to 3 preferences
                                    </p>
                                </div>
                                <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                                    {formData.preference.length}/{MAX_PREFERENCES}
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 mb-4">
                                Select the areas you're most interested in. This helps us recommend relevant jobs.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {PREFERENCE_OPTIONS.map((preference) => {
                                    const isSelected = formData.preference.includes(preference);
                                    const isDisabled = !isSelected && isLimitReached;
                                    
                                    return (
                                        <button
                                            key={preference}
                                            type="button"
                                            onClick={() => handlePreferenceToggle(preference)}
                                            disabled={saving || isDisabled}
                                            className={`p-4 rounded-lg border-2 transition-all duration-200 text-left font-medium ${
                                                isSelected
                                                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                                                    : isDisabled
                                                    ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                                                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 cursor-pointer'
                                            } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span>{preference}</span>
                                                {isSelected && (
                                                    <div className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center">
                                                        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {formData.preference.length > 0 && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-700 font-medium mb-2">Selected Preferences:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.preference.map((pref) => (
                                            <span
                                                key={pref}
                                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500 text-white"
                                            >
                                                {pref}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={saving || !hasChanges() || formData.preference.length === 0}
                                className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                                    saving || !hasChanges() || formData.preference.length === 0
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'text-white hover:opacity-90 transform hover:scale-105 shadow-md hover:shadow-lg'
                                }`}
                                style={saving || !hasChanges() || formData.preference.length === 0 ? {} : { backgroundColor: '#1c398e' }}
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-5 w-5" />
                                        <span>
                                            {formData.preference.length === 0
                                                ? 'Select Preferences'
                                                : `Save Changes (${formData.preference.length} selected)`}
                                        </span>
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