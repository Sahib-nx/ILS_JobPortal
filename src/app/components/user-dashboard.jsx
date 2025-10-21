"use client"

import React, { useState, useEffect } from 'react';
import { User, Briefcase, Star, MapPin, Clock, ArrowLeft, Building, Edit, X, Upload } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { UploadResumeDialog } from './upload-resume-dailog';


export const UserDashboard = () => {
    const [userDetails, setUserDetails] = useState(null);
    const [appliedJobs, setAppliedJobs] = useState([]);
    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [allJobs, setAllJobs] = useState([]);
    const [activeTab, setActiveTab] = useState('recommended');
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null);
    const [showPreferenceDialog, setShowPreferenceDialog] = useState(false);
    const [selectedPreferences, setSelectedPreferences] = useState([]);
    const [showUploadResumeDialog, setShowUploadResumeDialog] = useState(false);
    const [uploadedResume, setUploadedResume] = useState(null);

    const availablePreferences = ['Engineering', 'Design', 'Marketing', 'Product', 'Data'];
    const searchParams = useSearchParams();

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab) setActiveTab(tab);
    }, [searchParams]);

    useEffect(() => {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            setAuthError("Unauthorised User!");
            return;
        }

        const existingPreference = localStorage.getItem('prefrence');
        if (!existingPreference) {
            setShowPreferenceDialog(true);
        }

        console.log(userId);
    }, []);

    const getUserPreferences = () => {
        if (typeof window === 'undefined') return [];

        try {
            const prefs = localStorage.getItem('prefrence');
            console.log("Raw preferences from localStorage:", prefs);

            if (prefs) {
                const userPrefs = prefs.includes(',')
                    ? prefs.split(',').map(p => p.trim()).filter(p => p.length > 0)
                    : [prefs.trim()];

                console.log("Processed preferences:", userPrefs);
                return userPrefs.length > 0 ? userPrefs : [];
            }

            return [];
        } catch (error) {
            console.error('Error getting preferences:', error);
            return [];
        }
    };

    const handlePreferenceToggle = (preference) => {
        setSelectedPreferences(prev => {
            if (prev.includes(preference)) {
                return prev.filter(p => p !== preference);
            } else if (prev.length < 3) {
                return [...prev, preference];
            }
            return prev;
        });
    };

    const handleSavePreferences = () => {
        if (selectedPreferences.length === 0) {
            alert('Please select at least one preference');
            return;
        }

        if (selectedPreferences.length > 3) {
            alert('Please select maximum 3 preferences');
            return;
        }

        const preferencesString = selectedPreferences.join(',');
        localStorage.setItem('prefrence', preferencesString);
        setShowPreferenceDialog(false);

        const preferences = selectedPreferences;
        const appliedJobIds = appliedJobs.map(job => job._id || job.id || job.jobId);
        const availableJobs = allJobs.filter(job =>
            !appliedJobIds.includes(job._id || job.id)
        );
        const recommended = getRecommendedJobs(availableJobs, preferences);
        const sortedRecommendedJobs = sortJobsByDate(recommended, 'datePosted');
        setRecommendedJobs(sortedRecommendedJobs);
    };

    const handleRemovePreference = (prefToRemove) => {
        const currentPrefs = getUserPreferences();
        const updatedPrefs = currentPrefs.filter(p => p !== prefToRemove);

        if (updatedPrefs.length === 0) {
            const confirmRemoval = window.confirm('Removing all preferences will require you to set new ones. Continue?');
            if (confirmRemoval) {
                localStorage.removeItem('prefrence');
                setShowPreferenceDialog(true);
            }
        } else {
            localStorage.setItem('prefrence', updatedPrefs.join(','));

            const preferences = updatedPrefs;
            const appliedJobIds = appliedJobs.map(job => job._id || job.id || job.jobId);
            const availableJobs = allJobs.filter(job =>
                !appliedJobIds.includes(job._id || job.id)
            );
            const recommended = getRecommendedJobs(availableJobs, preferences);
            const sortedRecommendedJobs = sortJobsByDate(recommended, 'datePosted');
            setRecommendedJobs(sortedRecommendedJobs);
        }
    };

    const getRecommendedJobs = (jobs, preferences) => {
        console.log('=== RECOMMENDATION DEBUG START ===');
        console.log('Input jobs count:', jobs?.length || 0);
        console.log('User preferences:', preferences);

        if (!jobs || jobs.length === 0) {
            console.log('No jobs to filter');
            return [];
        }

        if (!preferences || preferences.length === 0) {
            console.log('No preferences to filter by');
            return [];
        }

        const filtered = jobs.filter(job => {
            const jobTexts = [
                job.title,
                job.description,
                job.location,
                job.jobType,
                job.postedBy?.name,
                job.category,
                job.skills,
                job.requirements,
                job.tags
            ].filter(text => text)
                .join(' ')
                .toLowerCase();

            console.log(`\nChecking job: "${job.title}"`);
            console.log('Job search text:', jobTexts.substring(0, 100) + '...');

            const matches = preferences.some(pref => {
                const prefLower = pref.toLowerCase();

                if (jobTexts.includes(prefLower)) {
                    console.log(`✅ Direct match found for: ${pref}`);
                    return true;
                }

                const keywordMappings = {
                    'engineering': ['engineer', 'engineering', 'technical', 'software', 'hardware'],
                    'developer': ['developer', 'development', 'coding', 'programming', 'frontend', 'backend', 'fullstack', 'full-stack'],
                    'design': ['design', 'designer', 'ui', 'ux', 'graphic', 'visual', 'creative'],
                    'marketing': ['marketing', 'digital marketing', 'content marketing', 'seo', 'social media'],
                    'product': ['product', 'product manager', 'product owner', 'pm'],
                    'data': ['data', 'analyst', 'data science', 'data scientist', 'analytics', 'business intelligence']
                };

                const keywords = keywordMappings[prefLower] || [prefLower];
                const keywordMatch = keywords.some(keyword => jobTexts.includes(keyword));

                if (keywordMatch) {
                    console.log(`✅ Keyword match found for: ${pref} (matched: ${keywords.find(k => jobTexts.includes(k))})`);
                    return true;
                }

                return false;
            });

            console.log(`Result: ${matches ? 'MATCH' : 'NO MATCH'}`);
            return matches;
        });

        console.log('=== RECOMMENDATION DEBUG END ===');
        console.log(`Filtered ${filtered.length} jobs from ${jobs.length} total jobs`);

        return filtered;
    };

    const safeJsonParse = async (response) => {
        const text = await response.text();
        if (!text) {
            throw new Error('Empty response');
        }
        try {
            return JSON.parse(text);
        } catch (err) {
            console.error('JSON Parse Error - Response text:', text);
            throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
        }
    };

    const sortJobsByDate = (jobs, dateField = 'datePosted') => {
        return [...jobs].sort((a, b) => {
            const dateA = new Date(a[dateField] || a.applicationDetails?.appliedAt || 0);
            const dateB = new Date(b[dateField] || b.applicationDetails?.appliedAt || 0);
            return dateB - dateA;
        });
    };

    const redirectToLogin = () => {
        localStorage.clear();

        if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
        }
    };

    const handleDeleteResume = async () => {
        const confirmDelete = window.confirm('Are you sure you want to delete your resume?');
        if (!confirmDelete) return;

        try {
            const userId = localStorage.getItem("userId");
            const authToken = localStorage.getItem("authToken");

            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/${userId}/resume`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete resume');
            }

            setUploadedResume(null);
            
            setUserDetails(prev => ({
                ...prev,
                resume: null
            }));

            alert('Resume deleted successfully');
        } catch (error) {
            console.error('Error deleting resume:', error);
            alert('Failed to delete resume. Please try again.');
        }
    };

    const handleResumeUploadSuccess = (resumeData) => {
        console.log('Resume upload success, received data:', resumeData);
        setUploadedResume(resumeData);
        setUserDetails(prev => ({
            ...prev,
            resume: resumeData
        }));
        setShowUploadResumeDialog(false);
    };

    useEffect(() => {
        const currentUserId = localStorage.getItem("userId");
        const authToken = localStorage.getItem("authToken");
        console.log("User ID:", currentUserId);

        const fetchData = async () => {
            setLoading(true);

            try {
                const headers = {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                };

                const userResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/${currentUserId}`, {
                    headers: headers
                });

                if (!userResponse.ok) {
                    if (userResponse.status === 401 || userResponse.status === 403) {
                        setAuthError('Session expired or unauthorized');
                        setTimeout(redirectToLogin, 2000);
                        return;
                    }
                    throw new Error(`User API error: ${userResponse.status} ${userResponse.statusText}`);
                }

                const userDetailsData = await safeJsonParse(userResponse);
                setUserDetails(userDetailsData);
                
                if (userDetailsData?.resume) {
                    setUploadedResume(userDetailsData.resume);
                }

                const jobsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/${currentUserId}/applications`, {
                    headers: headers
                });

                if (!jobsResponse.ok) {
                    throw new Error(`Applications API error: ${jobsResponse.status} ${jobsResponse.statusText}`);
                }
                const appliedJobsData = await safeJsonParse(jobsResponse);
                console.log('Raw applied jobs response:', appliedJobsData);

                let appliedJobsArray = [];
                if (Array.isArray(appliedJobsData)) {
                    appliedJobsArray = appliedJobsData;
                } else if (appliedJobsData && appliedJobsData.applications && Array.isArray(appliedJobsData.applications)) {
                    appliedJobsArray = appliedJobsData.applications;
                } else if (appliedJobsData && appliedJobsData.data && Array.isArray(appliedJobsData.data)) {
                    appliedJobsArray = appliedJobsData.data;
                } else if (appliedJobsData && typeof appliedJobsData === 'object') {
                    const possibleArrays = Object.values(appliedJobsData).filter(Array.isArray);
                    if (possibleArrays.length > 0) {
                        appliedJobsArray = possibleArrays[0];
                    }
                }

                console.log('Processed applied jobs array:', appliedJobsArray);

                const sortedAppliedJobs = sortJobsByDate(appliedJobsArray, 'applicationDetails.appliedAt');
                setAppliedJobs(sortedAppliedJobs);

                const allJobsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/job/`, {
                    headers: headers
                });

                if (!allJobsResponse.ok) {
                    throw new Error(`Jobs API error: ${allJobsResponse.status} ${allJobsResponse.statusText}`);
                }
                const allJobsResponseData = await safeJsonParse(allJobsResponse);
                console.log('Raw all jobs response:', allJobsResponseData);

                let allJobsArray = [];
                if (Array.isArray(allJobsResponseData)) {
                    allJobsArray = allJobsResponseData;
                } else if (allJobsResponseData && allJobsResponseData.jobs && Array.isArray(allJobsResponseData.jobs)) {
                    allJobsArray = allJobsResponseData.jobs;
                } else if (allJobsResponseData && allJobsResponseData.data && Array.isArray(allJobsResponseData.data)) {
                    allJobsArray = allJobsResponseData.data;
                } else if (allJobsResponseData && typeof allJobsResponseData === 'object') {
                    const possibleArrays = Object.values(allJobsResponseData).filter(Array.isArray);
                    if (possibleArrays.length > 0) {
                        allJobsArray = possibleArrays[0];
                    }
                }

                console.log('Processed all jobs array:', allJobsArray);
                setAllJobs(allJobsArray);

                const preferences = getUserPreferences();
                console.log('User preferences for recommendation:', preferences);

                const appliedJobIds = appliedJobsArray.map(job => job._id || job.id || job.jobId);
                const availableJobs = allJobsArray.filter(job =>
                    !appliedJobIds.includes(job._id || job.id)
                );

                console.log('Available jobs (not applied):', availableJobs.length);

                const recommended = getRecommendedJobs(availableJobs, preferences);
                console.log('Final recommended jobs:', recommended.length);

                const sortedRecommendedJobs = sortJobsByDate(recommended, 'datePosted');
                setRecommendedJobs(sortedRecommendedJobs);

            } catch (error) {
                console.error('Error fetching data:', error);
                if (error.message.includes('401') || error.message.includes('403')) {
                    setAuthError('Session expired or unauthorized');
                    setTimeout(redirectToLogin, 2000);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return 'Date not available';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const isJobClosed = (job) => {
        return job?.jobStatus?.toLowerCase() === 'closed';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-blue-600 font-medium">Loading User Dashboard...</p>
                </div>
            </div>
        );
    }

    if (authError || (userDetails && userDetails.role !== 'User')) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
                <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md mx-4">
                    <div className="mb-4">
                        <User className="h-12 w-12 text-red-600 mx-auto" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600 mb-4">
                        {authError || 'You need to be logged in as a user to access this dashboard.'}
                    </p>
                    <button
                        onClick={redirectToLogin}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#dbeafe' }}>
            <UploadResumeDialog 
                isOpen={showUploadResumeDialog}
                onClose={() => setShowUploadResumeDialog(false)}
                userId={localStorage.getItem("userId")}
                authToken={localStorage.getItem("authToken")}
                onUploadSuccess={handleResumeUploadSuccess}
            />

            {showPreferenceDialog && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full relative animate-fade-in overflow-hidden">
                        <div className="bg-gradient-to-r from-[#1c398e] to-indigo-900 px-8 py-6">
                            <div className="flex items-center justify-center mb-3">
                                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                    <Star className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-white text-center mb-2">
                                Set Your Job Preferences
                            </h2>
                            <p className="text-blue-100 text-center text-sm">
                                Help us personalize your job recommendations
                            </p>
                        </div>

                        <div className="p-8">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-blue-900">
                                            Select up to 3 preferences
                                        </p>
                                        <p className="text-xs text-blue-700 mt-1">
                                            {selectedPreferences.length}/3 selected
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                {availablePreferences.map((preference) => {
                                    const isSelected = selectedPreferences.includes(preference);
                                    const isDisabled = !isSelected && selectedPreferences.length >= 3;

                                    return (
                                        <button
                                            key={preference}
                                            onClick={() => handlePreferenceToggle(preference)}
                                            disabled={isDisabled}
                                            className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left font-medium ${isSelected
                                                ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm'
                                                : isDisabled
                                                    ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                                    : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50/30'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-base">{preference}</span>
                                                {isSelected && (
                                                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
                                                        <svg className="w-4 h-4 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path d="M5 13l4 4L19 7"></path>
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={handleSavePreferences}
                                disabled={selectedPreferences.length === 0}
                                className={`w-full py-4 font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${selectedPreferences.length === 0
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800'
                                    }`}
                            >
                                {selectedPreferences.length === 0
                                    ? 'Select at least 1 preference'
                                    : `Continue with ${selectedPreferences.length} ${selectedPreferences.length === 1 ? 'preference' : 'preferences'}`
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <header className="shadow-lg" style={{ backgroundColor: '#1c398e' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => window.location.href = "/jobs-landing"}
                                className="p-1 sm:p-3 hover:bg-blue-500 rounded-xl transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white-700" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Welcome back, {userDetails?.name}</h1>
                                <p className="text-blue-200">{userDetails?.role || 'Job Seeker'}</p>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <div className="text-white/90 text-sm">
                                <p className="font-medium">Dashboard</p>
                                <p>Manage your job applications</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                <div className="bg-white rounded-lg shadow-sm p-1 mb-8">
                    <nav className="flex space-x-1">
                        {[
                            { id: 'profile', label: 'Profile', icon: User },
                            { id: 'applications', label: 'My Applications', icon: Briefcase },
                            { id: 'recommended', label: 'Recommended Jobs', icon: Star }
                        ].map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className={`flex items-center space-x-2 px-4 py-3 rounded-md font-medium text-sm transition-all duration-200 flex-1 justify-center ${activeTab === id
                                    ? 'text-white shadow-md'
                                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                                    }`}
                                style={activeTab === id ? { backgroundColor: '#1c398e' } : {}}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="hidden sm:inline">{label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">

                {activeTab === 'profile' && (
                    <div className="animate-fade-in">
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="px-8 py-6" style={{ backgroundColor: '#1c398e' }}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Profile Information</h2>
                                        <p className="text-blue-100 mt-1">Manage your personal details and preferences</p>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={() => setShowUploadResumeDialog(true)}
                                            className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                        >
                                            <Upload className="h-4 w-4" />
                                            <span className="hidden sm:inline">{uploadedResume ? 'Update Resume' : 'Upload Resume'}</span>
                                            <span className="sm:hidden">{uploadedResume ? 'Update' : 'Upload'}</span>
                                        </button>
                                        <button
                                            onClick={() => window.location.href = '/user/edit'}
                                            className="px-4 py-2 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors flex items-center space-x-2 shadow-sm hover:shadow-md"
                                        >
                                            <Edit className="h-4 w-4" />
                                            <span className="hidden sm:inline">Edit Profile</span>
                                            <span className="sm:hidden">Edit</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2 space-y-6">
                                        <div className="flex items-start space-x-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                                            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                                                <User className="h-10 w-10 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-semibold text-gray-900">{userDetails?.name}</h3>
                                                <p className="text-gray-600 mt-1">{userDetails?.role || 'Job Seeker'}</p>
                                                <div className="flex items-center space-x-2 mt-2 text-gray-500">
                                                    <span className="text-sm">{userDetails?.email}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="p-5 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-colors bg-gradient-to-br from-white to-gray-50">
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Email Address
                                                </label>
                                                <p className="text-gray-900 font-medium">{userDetails?.email}</p>
                                            </div>

                                            <div className="p-5 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-colors bg-gradient-to-br from-white to-gray-50">
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Role
                                                </label>
                                                <p className="text-gray-900 font-medium">{userDetails?.role || 'Job Seeker'}</p>
                                            </div>
                                        </div>

                                        {uploadedResume && (
                                            <div className="p-6 border-2 border-blue-200 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-md transition-all">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="p-3 bg-blue-500 rounded-lg">
                                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                                Uploaded Resume
                                                            </label>
                                                            <p className="text-gray-900 font-medium truncate max-w-xs">
                                                                {uploadedResume.originalName || uploadedResume.fileName || 'Resume.pdf'}
                                                            </p>
                                                            {uploadedResume.uploadedAt && (
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    Uploaded on {formatDate(uploadedResume.uploadedAt || new Date().toISOString())}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={handleDeleteResume}
                                                        className="p-2 hover:bg-red-100 rounded-lg transition-colors group"
                                                        title="Delete resume"
                                                    >
                                                        <X className="h-5 w-5 text-red-600 group-hover:text-red-700" />
                                                    </button>
                                                </div>
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {uploadedResume.fileUrl && (
                                                        <a
                                                            href={uploadedResume.fileUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                            <span>View Resume</span>
                                                        </a>
                                                    )}
                                                    {uploadedResume.fileSize && (
                                                        <span className="px-3 py-2 bg-blue-100 text-blue-800 text-sm font-medium rounded-lg">
                                                            {(uploadedResume.fileSize / 1024).toFixed(2)} KB
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-6">
                                        <div className="p-6 border-2 border-gray-200 rounded-xl bg-gradient-to-br from-white to-blue-50 hover:shadow-md transition-shadow">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-lg font-semibold text-gray-900">Job Preferences</h4>
                                                <button
                                                    onClick={() => {
                                                        localStorage.removeItem('prefrence');
                                                        setShowPreferenceDialog(true);
                                                    }}
                                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                            <div className="space-y-3">
                                                {getUserPreferences().length > 0 ? (
                                                    getUserPreferences().map((pref, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 group hover:shadow-sm transition-all"
                                                        >
                                                            <span className="font-medium text-blue-900">{pref}</span>
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full font-medium">Active</span>
                                                                <button
                                                                    onClick={() => handleRemovePreference(pref)}
                                                                    className="p-1 hover:bg-red-100 rounded-full transition-colors opacity-100"
                                                                    title="Remove preference"
                                                                >
                                                                    <X className="h-4 w-4 text-red-600" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-gray-500 text-sm">No preferences set</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className={`p-6 border-2 rounded-xl hover:shadow-md transition-shadow ${uploadedResume ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' : 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200'}`}>
                                            <h4 className={`text-sm font-semibold mb-2 ${uploadedResume ? 'text-green-800' : 'text-yellow-800'}`}>Profile Status</h4>
                                            <div className="flex items-center space-x-2">
                                                <div className={`h-2 w-2 rounded-full animate-pulse ${uploadedResume ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                                <span className={`text-sm font-medium ${uploadedResume ? 'text-green-700' : 'text-yellow-700'}`}>
                                                    {uploadedResume ? 'Profile Complete' : 'Profile Incomplete'}
                                                </span>
                                            </div>
                                            {!uploadedResume && (
                                                <p className="text-xs text-yellow-600 mt-2">
                                                    Upload your resume to complete your profile
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                {activeTab === 'applications' && (
                    <div className="animate-fade-in">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">My Applications</h2>
                                <p className="text-gray-600 mt-1">Track the status of your job applications</p>
                            </div>
                            <div className="text-sm text-gray-500">
                                Total Applications: <span className="font-semibold text-gray-900">{appliedJobs.length}</span>
                            </div>
                        </div>

                        {appliedJobs.length > 0 ? (
                            <div className="grid gap-6">
                                {appliedJobs.map((job, index) => (
                                    <div
                                        key={job._id || job.applicationDetails?.applicationId || index}
                                        className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 w-full overflow-hidden"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-3">
                                                    <h3 className="text-xl font-bold text-gray-900 break-words">
                                                        {job.jobTitle || 'Job Title'}
                                                    </h3>
                                                </div>

                                                <p className="text-gray-600 mb-4 line-clamp-2 break-words overflow-hidden">
                                                    {job.jobDescription || 'No description available'}
                                                </p>

                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                                                    <div className="flex items-center space-x-2 text-gray-600 min-w-0">
                                                        <Building className="h-4 w-4 flex-shrink-0" />
                                                        <span className="text-sm truncate">
                                                            {job.postedBy?.name || 'Company Name'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-2 text-gray-600 min-w-0">
                                                        <MapPin className="h-4 w-4 flex-shrink-0" />
                                                        <span className="text-sm truncate">{job.location || 'Location not specified'}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2 text-gray-600 min-w-0">
                                                        <Clock className="h-4 w-4 flex-shrink-0" />
                                                        <span className="text-sm truncate">
                                                            Applied {formatDate(job.applicationDetails?.appliedAt || job.datePosted)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {job.jobType && (
                                                    <div className="flex items-center space-x-2">
                                                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                                            {job.jobType}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                                <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Applications Yet</h3>
                                <p className="text-gray-500 mb-6">Start exploring opportunities and apply to jobs that match your interests!</p>
                                <button
                                    onClick={() => setActiveTab('recommended')}
                                    className="px-6 py-3 text-white font-medium rounded-lg hover:opacity-90 transition-colors"
                                    style={{ backgroundColor: '#1c398e' }}
                                >
                                    Browse Recommended Jobs
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'recommended' && (
                    <div className="animate-fade-in">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Recommended Jobs</h2>
                                <p className="text-gray-600 mt-1">Jobs curated based on your preferences and profile</p>
                            </div>
                            <div className="text-sm text-gray-500">
                                Found: <span className="font-semibold text-gray-900">{recommendedJobs.length}</span> matches
                            </div>
                        </div>

                        {recommendedJobs.length > 0 ? (
                            <div className="grid gap-6">
                                {recommendedJobs.map((job, index) => (
                                    <div
                                        key={job._id || index}
                                        className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 ${isJobClosed(job) ? 'opacity-50 grayscale' : ''}`}
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-3">
                                                    <h3 className="text-xl font-bold text-gray-900">
                                                        {job.title || 'Job Title'}
                                                    </h3>
                                                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium ml-4">
                                                        Recommended
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                                                    <div className="flex items-center space-x-2 text-gray-600">
                                                        <Building className="h-4 w-4 flex-shrink-0" />
                                                        <span className="text-sm">
                                                            {job.postedBy?.name || 'Company Name'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-2 text-gray-600">
                                                        <MapPin className="h-4 w-4 flex-shrink-0" />
                                                        <span className="text-sm">{job.location || 'Location not specified'}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2 text-gray-600">
                                                        <Clock className="h-4 w-4 flex-shrink-0" />
                                                        <span className="text-sm">Posted {formatDate(job.datePosted)}</span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    {job.jobType && (
                                                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                                            {job.jobType}
                                                        </span>
                                                    )}
                                                    {job.jobStatus && (
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${job.jobStatus === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                            {job.jobStatus}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mt-4 lg:mt-0 lg:ml-6 flex-shrink-0">
                                                {isJobClosed(job) ? (
                                                    <div className="w-full lg:w-auto px-6 py-3 text-red-600 font-medium rounded-lg border-2 border-red-200 bg-red-50 text-center">
                                                        Closed
                                                    </div>
                                                ) : (
                                                    <button
                                                        className="w-full lg:w-auto px-6 py-3 text-white font-medium rounded-lg hover:opacity-90 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                                                        style={{ backgroundColor: '#1c398e' }}
                                                        onClick={() => window.location.href = `/jobs-landing/${job._id}`}
                                                    >
                                                        See Details
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                                <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Recommendations Available</h3>
                                <div className="text-gray-500 space-y-2">
                                    <p>No jobs match your current preferences.</p>
                                    <p className="text-sm">
                                        Current preferences: <span className="font-semibold">{getUserPreferences().join(', ')}</span>
                                    </p>
                                    <p className="text-sm">Try updating your preferences or check back later for new opportunities.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style jsx>{`
                .animate-fade-in {
                    animation: fadeIn 0.6s ease-in;
                }
                
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                
                .line-clamp-3 {
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @media (max-width: 640px) {
                    .grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};