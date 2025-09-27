"use client"

import React, { useState, useEffect } from 'react';
import { User, Briefcase, Star, MapPin, Clock, DollarSign, Building } from 'lucide-react';

const Page = () => {
    const [userDetails, setUserDetails] = useState(null);
    const [appliedJobs, setAppliedJobs] = useState([]);
    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [allJobs, setAllJobs] = useState([]);
    const [userId, setUserId] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(true);

    // Fixed getUserId function with proper error handling
    const getUserId = () => {
        if (typeof window === 'undefined') return null;
        
        const token = localStorage.getItem('authToken');
        if (!token) return null;

        try {
            const payloadBase64 = token.split('.')[1];
            const decoded = JSON.parse(atob(payloadBase64));
            console.log('Decoded JWT:', decoded.UserId);
            return decoded.UserId;
        } catch (err) {
            console.error('Invalid token', err);
            return null;
        }
    };

    // Simplified and improved getUserPreferences function
    const getUserPreferences = () => {
        if (typeof window === 'undefined') return ['Engineering'];
        
        try {
            const prefs = localStorage.getItem('prefrence');
            console.log("Raw preferences from localStorage:", prefs);
            
            if (prefs) {
                const userPrefs = prefs.includes(',') 
                    ? prefs.split(',').map(p => p.trim()).filter(p => p.length > 0)
                    : [prefs.trim()];
                
                console.log("Processed preferences:", userPrefs);
                return userPrefs.length > 0 ? userPrefs : ['Engineering'];
            }
            
            return ['Engineering'];
        } catch (error) {
            console.error('Error getting preferences:', error);
            return ['Engineering'];
        }
    };

    // Updated getRecommendedJobs function to handle new API structure
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
            return jobs.slice(0, 10);
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

    // Helper function to safely parse JSON response
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

    // Sort jobs by date - fresh first (descending order)
    const sortJobsByDate = (jobs, dateField = 'datePosted') => {
        return [...jobs].sort((a, b) => {
            const dateA = new Date(a[dateField] || a.applicationDetails?.appliedAt || 0);
            const dateB = new Date(b[dateField] || b.applicationDetails?.appliedAt || 0);
            return dateB - dateA; // Descending order (fresh first)
        });
    };

    useEffect(() => {
        const currentUserId = getUserId();
        setUserId(currentUserId);
        console.log("User ID:", currentUserId);

        const fetchData = async () => {
            setLoading(true);

            try {
                if (!currentUserId) {
                    console.error('No user ID found');
                    setLoading(false);
                    return;
                }

                // Fetch user details
                const userResponse = await fetch(`http://localhost:4441/api/auth/${currentUserId}`);
                if (!userResponse.ok) {
                    throw new Error(`User API error: ${userResponse.status} ${userResponse.statusText}`);
                }
                const userDetails = await safeJsonParse(userResponse);
                setUserDetails(userDetails);

                // Fetch applied jobs
                const jobsResponse = await fetch(`http://localhost:4441/api/auth/${currentUserId}/applications`);
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
                
                // Sort applied jobs by date - fresh first
                const sortedAppliedJobs = sortJobsByDate(appliedJobsArray, 'applicationDetails.appliedAt');
                setAppliedJobs(sortedAppliedJobs);

                // Fetch all available jobs for recommendations
                const allJobsResponse = await fetch(`http://localhost:4441/api/job/`);
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
                
                // Sort recommended jobs by date - fresh first
                const sortedRecommendedJobs = sortJobsByDate(recommended, 'datePosted');
                setRecommendedJobs(sortedRecommendedJobs);

            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'under review': 
            case 'pending': 
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'interview scheduled': 
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'rejected': 
                return 'bg-red-100 text-red-800 border-red-200';
            case 'accepted': 
            case 'hired':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'open':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'closed':
                return 'bg-red-100 text-red-800 border-red-200';
            default: 
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Date not available';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Check if job is closed
    const isJobClosed = (job) => {
        return job?.jobStatus?.toLowerCase() === 'closed';
    };

    if (loading) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: '#dbeafe' }}>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#1c398e' }}></div>
                </div>
            </div>
        );
    }

    if (!userId || !userDetails) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: '#dbeafe' }}>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
                        <p className="text-gray-600">Please log in to access your dashboard.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#dbeafe' }}>
            {/* Header */}
            <header className="shadow-lg" style={{ backgroundColor: '#1c398e' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                                <User className="h-6 w-6 text-white" />
                            </div>
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

            {/* Navigation Tabs */}
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

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="animate-fade-in">
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="px-8 py-6" style={{ backgroundColor: '#1c398e' }}>
                                <h2 className="text-2xl font-bold text-white">Profile Information</h2>
                                <p className="text-blue-100 mt-1">Manage your personal details and preferences</p>
                            </div>
                            
                            <div className="p-8">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2 space-y-6">
                                        <div className="flex items-start space-x-6 p-6 bg-gray-50 rounded-xl">
                                            <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
                                                <User className="h-10 w-10 text-blue-600" />
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
                                            <div className="p-4 border border-gray-200 rounded-xl">
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Email Address
                                                </label>
                                                <p className="text-gray-900 font-medium">{userDetails?.email}</p>
                                            </div>
                                            
                                            <div className="p-4 border border-gray-200 rounded-xl">
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Role
                                                </label>
                                                <p className="text-gray-900 font-medium">{userDetails?.role || 'Job Seeker'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="p-6 border border-gray-200 rounded-xl">
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Job Preferences</h4>
                                            <div className="space-y-3">
                                                {getUserPreferences().map((pref, index) => (
                                                    <div 
                                                        key={index}
                                                        className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
                                                    >
                                                        <span className="font-medium text-blue-900">{pref}</span>
                                                        <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">Active</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="p-6 bg-green-50 border border-green-200 rounded-xl">
                                            <h4 className="text-sm font-semibold text-green-800 mb-2">Profile Status</h4>
                                            <div className="flex items-center space-x-2">
                                                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                                                <span className="text-sm text-green-700">Profile Complete</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Applications Tab */}
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
                                        className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-3">
                                                    <h3 className="text-xl font-bold text-gray-900">
                                                        {job.jobTitle || 'Job Title'}
                                                    </h3>
                                                    {/* <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ml-4 ${getStatusColor(job.applicationDetails?.status || job.jobStatus)}`}>
                                                        {job.applicationDetails?.status || job.jobStatus || 'Pending'}
                                                    </span> */}
                                                </div>
                                                
                                                <p className="text-gray-600 mb-4 line-clamp-2">
                                                    {job.jobDescription || 'No description available'}
                                                </p>
                                                
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
                                                        <span className="text-sm">
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

                {/* Recommended Jobs Tab */}
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
                                        className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
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
                                                
                                                <p className="text-gray-600 mb-4 line-clamp-3">
                                                    {job.description || 'No description available'}
                                                </p>
                                                
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
                                            
                                            {/* Conditional Apply Button or Closed Status */}
                                            <div className="mt-4 lg:mt-0 lg:ml-6 flex-shrink-0">
                                                {isJobClosed(job) ? (
                                                    <div className="w-full lg:w-auto px-6 py-3 text-red-600 font-medium rounded-lg border-2 border-red-200 bg-red-50 text-center">
                                                        Closed
                                                    </div>
                                                ) : (
                                                    <button
                                                        className="w-full lg:w-auto px-6 py-3 text-white font-medium rounded-lg hover:opacity-90 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                                                        style={{ backgroundColor: '#1c398e' }}
                                                        onClick={() => {
                                                            console.log('Applying to job:', job);
                                                        }}
                                                    >
                                                        Apply Now
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

export default Page;