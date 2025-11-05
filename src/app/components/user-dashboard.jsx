"use client"

import React, { useState, useEffect } from 'react';
import { User, Briefcase, Star, MapPin, Clock, Building, Edit, X, Upload, LayoutDashboard } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { UploadResumeDialog } from './upload-resume-dailog';
import toast from 'react-hot-toast';
import WarningBox from './warning-box';
import { motion, AnimatePresence } from 'framer-motion';

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
    const [showWarning, setShowWarning] = useState(false);

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

        console.log(userId);
    }, []);

    const getUserPreferences = () => {
        if (typeof window === 'undefined') return [];

        try {
            const prefs = localStorage.getItem('userPreferences');
            console.log("Raw preferences from localStorage:", prefs);

            if (prefs) {
                const userPrefs = JSON.parse(prefs);
                console.log("Processed preferences:", userPrefs);
                return Array.isArray(userPrefs) ? userPrefs : [];
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

    const handleSavePreferences = async () => {
        if (selectedPreferences.length === 0) {
            toast.error('Please select at least one preference');
            return;
        }

        if (selectedPreferences.length > 3) {
            toast.error('Please select maximum 3 preferences');
            return;
        }

        try {
            const userId = localStorage.getItem("userId");
            const authToken = localStorage.getItem("authToken");

            console.log("Saving preferences to DB:", selectedPreferences);

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/${userId}/edit`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${authToken}`,
                    },
                    body: JSON.stringify({
                        preference: selectedPreferences,
                    }),
                }
            );

            if (!response.ok) {
                const errorData = await response.text();
                console.error("Failed to save preferences:", errorData);
                throw new Error("Failed to save preferences");
            }

            const data = await response.json();
            console.log("Preferences saved successfully in DB:", data);

            localStorage.setItem('userPreferences', JSON.stringify(selectedPreferences));

            setUserDetails(prev => ({
                ...prev,
                preference: selectedPreferences
            }));

            setShowPreferenceDialog(false);
            toast.success("Preferences saved successfully!");

            const appliedJobIds = appliedJobs.map(job => job._id || job.id || job.jobId);
            const availableJobs = allJobs.filter(job =>
                !appliedJobIds.includes(job._id || job.id)
            );
            const recommended = getRecommendedJobs(availableJobs, selectedPreferences);
            const sortedRecommendedJobs = sortJobsByDate(recommended, 'datePosted');
            setRecommendedJobs(sortedRecommendedJobs);

        } catch (error) {
            console.error("Error saving preferences:", error);
            toast.error("Failed to save preferences. Please try again.");
        }
    };

    const handleRemovePreference = async (prefToRemove) => {
        const currentPrefs = getUserPreferences();
        const updatedPrefs = currentPrefs.filter(p => p !== prefToRemove);

        if (updatedPrefs.length === 0) {
            const confirmRemoval = window.confirm('Removing all preferences will require you to set new ones. Continue?');
            if (!confirmRemoval) return;

            try {
                const userId = localStorage.getItem("userId");
                const authToken = localStorage.getItem("authToken");

                console.log("Removing all preferences from DB");

                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/${userId}/edit`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${authToken}`,
                        },
                        body: JSON.stringify({
                            preference: [],
                        }),
                    }
                );

                if (!response.ok) {
                    const errorData = await response.text();
                    console.error("Failed to remove preferences:", errorData);
                    throw new Error("Failed to remove preferences");
                }

                const data = await response.json();
                console.log("All preferences removed from DB:", data);

                localStorage.removeItem('userPreferences');
                setUserDetails(prev => ({
                    ...prev,
                    preference: []
                }));
                setShowPreferenceDialog(true);
                toast.success("All preferences removed");

            } catch (error) {
                console.error("Error removing preferences:", error);
                toast.error("Failed to remove preferences. Please try again.");
            }
        } else {
            try {
                const userId = localStorage.getItem("userId");
                const authToken = localStorage.getItem("authToken");

                console.log("Updating preferences in DB:", updatedPrefs);

                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/${userId}/edit`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${authToken}`,
                        },
                        body: JSON.stringify({
                            preference: updatedPrefs,
                        }),
                    }
                );

                if (!response.ok) {
                    const errorData = await response.text();
                    console.error("Failed to update preferences:", errorData);
                    throw new Error("Failed to update preferences");
                }

                const data = await response.json();
                console.log("Preferences updated in DB:", data);

                localStorage.setItem('userPreferences', JSON.stringify(updatedPrefs));
                setUserDetails(prev => ({
                    ...prev,
                    preference: updatedPrefs
                }));

                const appliedJobIds = appliedJobs.map(job => job._id || job.id || job.jobId);
                const availableJobs = allJobs.filter(job =>
                    !appliedJobIds.includes(job._id || job.id)
                );
                const recommended = getRecommendedJobs(availableJobs, updatedPrefs);
                const sortedRecommendedJobs = sortJobsByDate(recommended, 'datePosted');
                setRecommendedJobs(sortedRecommendedJobs);

                toast.success("Preference removed successfully");

            } catch (error) {
                console.error("Error updating preferences:", error);
                toast.error("Failed to update preferences. Please try again.");
            }
        }
    };

    const handleEditPreferences = () => {
        const currentPrefs = getUserPreferences();
        setSelectedPreferences(currentPrefs);
        setShowPreferenceDialog(true);
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
        try {
            const userId = localStorage.getItem("userId");
            const authToken = localStorage.getItem("authToken");

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/${userId}/remove`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );

            if (!response.ok) {
                toast.error("Failed to delete resume");
                setShowWarning(false);
                return;
            }

            const data = await response.json();

            setUploadedResume(null);
            setUserDetails((prev) => ({
                ...prev,
                resume: null,
            }));

            toast.success(data.message || "Resume deleted successfully");

        } catch (error) {
            console.error("Error deleting resume:", error);
            toast.error("Failed to delete resume. Please try again.");
        } finally {
            setShowWarning(false);
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

        if (uploadedResume !== null) {
            toast.success("Resume updated successfully!")
        } else {
            toast.success("Resume uploaded successfully!")
        }
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

                if (userDetailsData?.preference && Array.isArray(userDetailsData.preference) && userDetailsData.preference.length > 0) {
                    console.log("User preferences from DB:", userDetailsData.preference);
                    localStorage.setItem('userPreferences', JSON.stringify(userDetailsData.preference));
                } else {
                    const localPrefs = localStorage.getItem('userPreferences');
                    if (!localPrefs) {
                        setShowPreferenceDialog(true);
                    }
                }

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

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15
            }
        }
    };

    const cardHoverVariants = {
        hover: {
            y: -4,
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 25
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 flex items-center justify-center">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="inline-block rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-6"
                    />
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-blue-700 font-semibold text-lg"
                    >
                        Loading Your Dashboard...
                    </motion.p>
                </motion.div>
            </div>
        );
    }

    if (authError || (userDetails && userDetails.role !== 'User')) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-red-100 to-orange-100 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="text-center bg-white p-10 rounded-2xl shadow-2xl max-w-md mx-4 border border-red-100"
                >
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="mb-6 inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full"
                    >
                        <User className="h-10 w-10 text-red-600" />
                    </motion.div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">Access Denied</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        {authError || 'You need to be logged in as a user to access this dashboard.'}
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={redirectToLogin}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                    >
                        Go to Login
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
            <WarningBox
                show={showWarning}
                message="Are you sure you want to remove your resume? This action cannot be undone."
                onConfirm={handleDeleteResume}
                onCancel={() => setShowWarning(false)}
            />
            <UploadResumeDialog
                isOpen={showUploadResumeDialog}
                onClose={() => setShowUploadResumeDialog(false)}
                userId={localStorage.getItem("userId")}
                authToken={localStorage.getItem("authToken")}
                onUploadSuccess={handleResumeUploadSuccess}
            />

            <AnimatePresence>
                {showPreferenceDialog && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 25 }}
                            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full relative overflow-hidden"
                        >
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setShowPreferenceDialog(false)}
                                className="absolute top-5 right-5 z-10 w-11 h-11 rounded-full bg-white/30 backdrop-blur-sm hover:bg-white/40 transition-all duration-200 flex items-center justify-center group shadow-lg cursor-pointer"
                                aria-label="Close dialog"
                            >
                                <X className="w-5 h-5 text-white pointer-events-none" />
                            </motion.button>

                            <div className="bg-gradient-to-r from-[#1c398e] via-indigo-700 to-indigo-900 px-8 py-8 relative overflow-hidden">
                                <div className="absolute inset-0 opacity-10">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                                </div>
                                <motion.div 
                                    initial={{ scale: 0, rotate: 0 }}
                                    animate={{ scale: 1, rotate: 360 }}
                                    transition={{ delay: 0.2, type: "spring", duration: 0.8 }}
                                    className="flex items-center justify-center mb-4 relative z-10"
                                >
                                    <motion.div 
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                        className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl"
                                    >
                                        <Star className="w-10 h-10 text-white" />
                                    </motion.div>
                                </motion.div>
                                <motion.h2 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-3xl font-bold text-white text-center mb-2 relative z-10"
                                >
                                    Set Your Job Preferences
                                </motion.h2>
                                <motion.p 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-blue-100 text-center relative z-10"
                                >
                                    Help us personalize your job recommendations
                                </motion.p>
                            </div>

                            <div className="p-8">
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5 mb-6 shadow-sm"
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 mt-0.5">
                                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-blue-900">
                                                Select up to 3 preferences
                                            </p>
                                            <p className="text-xs text-blue-700 mt-1">
                                                {selectedPreferences.length}/3 selected
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>

                                <div className="space-y-3 mb-6">
                                    {availablePreferences.map((preference, idx) => {
                                        const isSelected = selectedPreferences.includes(preference);
                                        const isDisabled = !isSelected && selectedPreferences.length >= 3;

                                        return (
                                            <motion.button
                                                key={preference}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.6 + idx * 0.1 }}
                                                whileHover={!isDisabled ? { scale: 1.02, x: 4 } : {}}
                                                whileTap={!isDisabled ? { scale: 0.98 } : {}}
                                                onClick={() => handlePreferenceToggle(preference)}
                                                disabled={isDisabled}
                                                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left font-medium shadow-sm ${isSelected
                                                    ? 'border-blue-600 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-900 shadow-md'
                                                    : isDisabled
                                                    ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                                    : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50/50'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-base">{preference}</span>
                                                    {isSelected && (
                                                        <motion.div 
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-md"
                                                        >
                                                            <svg className="w-4 h-4 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path d="M5 13l4 4L19 7"></path>
                                                            </svg>
                                                        </motion.div>
                                                    )}
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                <motion.button
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.1 }}
                                    whileHover={selectedPreferences.length > 0 ? { scale: 1.02 } : {}}
                                    whileTap={selectedPreferences.length > 0 ? { scale: 0.98 } : {}}
                                    onClick={handleSavePreferences}
                                    disabled={selectedPreferences.length === 0}
                                    className={`w-full py-4 font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl ${selectedPreferences.length === 0
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800'
                                    }`}
                                >
                                    {selectedPreferences.length === 0
                                        ? 'Select at least 1 preference'
                                        : `Continue with ${selectedPreferences.length} ${selectedPreferences.length === 1 ? 'preference' : 'preferences'}`
                                    }
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.header 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden shadow-xl bg-gradient-to-r from-[#1c398e] via-indigo-700 to-[#1c398e]"
            >
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                    <div className="flex items-center justify-between">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center space-x-4"
                        >
                            <div>
                                <h1 className="text-3xl font-bold text-white drop-shadow-sm">Welcome back, {userDetails?.name} 👋</h1>
                                <p className="text-blue-100 mt-1 font-medium">{userDetails?.role || 'Job Seeker'}</p>
                            </div>
                        </motion.div>

                        <div className="flex items-center space-x-4">
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="hidden md:block"
                            >
                                <div className="flex items-center space-x-3">
                                    <LayoutDashboard className="w-8 h-8 text-white/90" />
                                    <div className="text-white/90">
                                        <h2 className="text-xl font-semibold">My Dashboard</h2>
                                        <p className="text-xs text-blue-100">Overview & insights</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    localStorage.clear();
                                    window.location.href = '/';
                                }}
                                className="flex items-center space-x-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all duration-200 border border-white/20 hover:border-white/40 group shadow-lg cursor-pointer"
                                aria-label="Logout"
                            >
                                <svg
                                    className="w-5 h-5 text-white group-hover:rotate-180 transition-transform duration-300 pointer-events-none"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                                </svg>
                                <span className="text-white font-semibold hidden sm:inline pointer-events-none">Logout</span>
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-2 mb-8 border border-white/50"
                >
                    <nav className="flex space-x-2">
                        {[
                            { id: 'profile', label: 'Profile', icon: User },
                            { id: 'applications', label: 'My Applications', icon: Briefcase },
                            { id: 'recommended', label: 'Recommended Jobs', icon: Star }
                        ].map(({ id, label, icon: Icon }) => (
                            <motion.button
                                key={id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setActiveTab(id)}
                                className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex-1 justify-center ${activeTab === id
                                    ? 'text-white shadow-lg'
                                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                                }`}
                                style={activeTab === id ? { background: 'linear-gradient(135deg, #1c398e 0%, #3b5bdb 100%)' } : {}}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="hidden sm:inline">{label}</span>
                            </motion.button>
                        ))}
                    </nav>
                </motion.div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                <AnimatePresence mode="wait">
                    {activeTab === 'profile' && (
                        <motion.div
                            key="profile"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/50">
                                <div className="px-8 py-8 bg-gradient-to-r from-[#1c398e] via-indigo-700 to-[#1c398e] relative overflow-hidden">
                                    <div className="absolute inset-0 opacity-10">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                                    </div>
                                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between relative z-10">
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <h2 className="text-3xl font-bold text-white drop-shadow-sm">Profile Information</h2>
                                            <p className="text-blue-100 mt-2 font-medium">Manage your personal details and preferences</p>
                                        </motion.div>
                                        <motion.div 
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="hidden md:flex items-center space-x-3 mt-4 md:mt-0"
                                        >
                                            <motion.button
                                                whileHover={{ scale: 1.05, y: -2 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setShowUploadResumeDialog(true)}
                                                className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                                            >
                                                <Upload className="h-4 w-4" />
                                                <span>{uploadedResume ? 'Update Resume' : 'Upload Resume'}</span>
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05, y: -2 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => window.location.href = '/user/edit'}
                                                className="px-5 py-2.5 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors flex items-center space-x-2 shadow-lg hover:shadow-xl"
                                            >
                                                <Edit className="h-4 w-4" />
                                                <span>Edit Profile</span>
                                            </motion.button>
                                        </motion.div>
                                    </div>
                                    <div className="flex md:hidden flex-col gap-3 mt-6 relative z-10">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setShowUploadResumeDialog(true)}
                                            className="w-full px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
                                        >
                                            <Upload className="h-4 w-4" />
                                            <span>{uploadedResume ? 'Update Resume' : 'Upload Resume'}</span>
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => window.location.href = '/user/edit'}
                                            className="w-full px-5 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2 shadow-lg"
                                        >
                                            <Edit className="h-4 w-4" />
                                            <span>Edit Profile</span>
                                        </motion.button>
                                    </div>
                                </div>

                                <div className="p-8">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        <motion.div 
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.4 }}
                                            className="lg:col-span-2 space-y-6"
                                        >
                                            <motion.div 
                                                whileHover="hover"
                                                variants={cardHoverVariants}
                                                className="flex items-start space-x-6 p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 rounded-2xl border-2 border-blue-100 shadow-md"
                                            >
                                                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-700 flex items-center justify-center shadow-xl ring-4 ring-blue-100">
                                                    <User className="h-12 w-12 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-2xl font-bold text-gray-900">{userDetails?.name}</h3>
                                                    <p className="text-gray-600 mt-1 font-medium">{userDetails?.role || 'Job Seeker'}</p>
                                                    <div className="flex items-center space-x-2 mt-3 text-gray-500">
                                                        <span className="text-sm font-medium">{userDetails?.email}</span>
                                                    </div>
                                                </div>
                                            </motion.div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                <motion.div 
                                                    whileHover="hover"
                                                    variants={cardHoverVariants}
                                                    className="p-6 border-2 border-gray-200 rounded-2xl hover:border-blue-300 transition-colors bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-md"
                                                >
                                                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                                                        Email Address
                                                    </label>
                                                    <p className="text-gray-900 font-semibold text-lg">{userDetails?.email}</p>
                                                </motion.div>

                                                <motion.div 
                                                    whileHover="hover"
                                                    variants={cardHoverVariants}
                                                    className="p-6 border-2 border-gray-200 rounded-2xl hover:border-blue-300 transition-colors bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-md"
                                                >
                                                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                                                        Role
                                                    </label>
                                                    <p className="text-gray-900 font-semibold text-lg">{userDetails?.role || 'Job Seeker'}</p>
                                                </motion.div>
                                            </div>

                                            {uploadedResume && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    whileHover="hover"
                                                    variants={cardHoverVariants}
                                                    className="p-6 border-2 border-blue-200 rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 shadow-md hover:shadow-lg transition-all"
                                                >
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex items-center space-x-4">
                                                            <motion.div 
                                                                whileHover={{ rotate: 360 }}
                                                                transition={{ duration: 0.5 }}
                                                                className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg"
                                                            >
                                                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                </svg>
                                                            </motion.div>
                                                            <div>
                                                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">
                                                                    Uploaded Resume
                                                                </label>
                                                                <p className="text-gray-900 font-semibold truncate max-w-xs">
                                                                    {uploadedResume.originalName || uploadedResume.fileName || 'Resume.pdf'}
                                                                </p>
                                                                {uploadedResume.uploadedAt && (
                                                                    <p className="text-xs text-gray-500 mt-1 font-medium">
                                                                        Uploaded on {formatDate(uploadedResume.uploadedAt || new Date().toISOString())}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1, rotate: 90 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => setShowWarning(true)}
                                                            className="p-2.5 hover:bg-red-100 rounded-xl transition-colors group"
                                                            title="Delete resume"
                                                        >
                                                            <X className="h-5 w-5 text-red-600 group-hover:text-red-700" />
                                                        </motion.button>
                                                    </div>
                                                    <div className="flex flex-wrap gap-3 mt-4">
                                                        {uploadedResume.fileUrl && (
                                                            <motion.a
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                href={uploadedResume.fileUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center space-x-2 shadow-md hover:shadow-lg"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                                <span>View Resume</span>
                                                            </motion.a>
                                                        )}
                                                        {uploadedResume.fileSize && (
                                                            <span className="px-4 py-2.5 bg-blue-100 text-blue-800 text-sm font-semibold rounded-xl">
                                                                {(uploadedResume.fileSize / 1024).toFixed(2)} KB
                                                            </span>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </motion.div>

                                        <motion.div 
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 }}
                                            className="space-y-6"
                                        >
                                            <motion.div 
                                                whileHover="hover"
                                                variants={cardHoverVariants}
                                                className="p-6 border-2 border-gray-200 rounded-2xl bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 shadow-md hover:shadow-lg transition-shadow"
                                            >
                                                <div className="flex items-center justify-between mb-5">
                                                    <h4 className="text-lg font-bold text-gray-900">Job Preferences</h4>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={handleEditPreferences}
                                                        className="text-xs text-blue-600 hover:text-blue-700 font-semibold px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                                    >
                                                        Edit
                                                    </motion.button>
                                                </div>
                                                <div className="space-y-3">
                                                    {getUserPreferences().length > 0 ? (
                                                        getUserPreferences().map((pref, index) => (
                                                            <motion.div
                                                                key={index}
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: 0.6 + index * 0.1 }}
                                                                whileHover={{ x: 4 }}
                                                                className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 group hover:shadow-sm transition-all"
                                                            >
                                                                <span className="font-semibold text-blue-900">{pref}</span>
                                                                <div className="flex items-center space-x-2">
                                                                    <span className="text-xs bg-blue-200 text-blue-800 px-2.5 py-1 rounded-full font-bold">Active</span>
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.2, rotate: 90 }}
                                                                        whileTap={{ scale: 0.8 }}
                                                                        onClick={() => handleRemovePreference(pref)}
                                                                        className="p-1 hover:bg-red-100 rounded-full transition-colors"
                                                                        title="Remove preference"
                                                                    >
                                                                        <X className="h-4 w-4 text-red-600" />
                                                                    </motion.button>
                                                                </div>
                                                            </motion.div>
                                                        ))
                                                    ) : (
                                                        <p className="text-gray-500 text-sm font-medium">No preferences set</p>
                                                    )}
                                                </div>
                                            </motion.div>

                                            <motion.div 
                                                whileHover="hover"
                                                variants={cardHoverVariants}
                                                className={`p-6 border-2 rounded-2xl shadow-md hover:shadow-lg transition-all ${uploadedResume ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' : 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200'}`}
                                            >
                                                <h4 className={`text-sm font-bold mb-3 uppercase tracking-wide ${uploadedResume ? 'text-green-800' : 'text-yellow-800'}`}>Profile Status</h4>
                                                <div className="flex items-center space-x-3">
                                                    <motion.div 
                                                        animate={{ scale: [1, 1.2, 1] }}
                                                        transition={{ duration: 2, repeat: Infinity }}
                                                        className={`h-3 w-3 rounded-full ${uploadedResume ? 'bg-green-500' : 'bg-yellow-500'}`}
                                                    />
                                                    <span className={`text-sm font-bold ${uploadedResume ? 'text-green-700' : 'text-yellow-700'}`}>
                                                        {uploadedResume ? 'Profile Complete' : 'Profile Incomplete'}
                                                    </span>
                                                </div>
                                                {!uploadedResume && (
                                                    <p className="text-xs text-yellow-600 mt-3 font-medium">
                                                        Upload your resume to complete your profile
                                                    </p>
                                                )}
                                            </motion.div>
                                        </motion.div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'applications' && (
                        <motion.div
                            key="applications"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center justify-between mb-8"
                            >
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900">My Applications</h2>
                                    <p className="text-gray-600 mt-2 font-medium">Track the status of your job applications</p>
                                </div>
                                <div className="text-sm text-gray-500 bg-white px-5 py-3 rounded-xl shadow-md border border-gray-200">
                                    Total Applications: <span className="font-bold text-gray-900 text-lg">{appliedJobs.length}</span>
                                </div>
                            </motion.div>

                            {appliedJobs.length > 0 ? (
                                <motion.div 
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="grid gap-6"
                                >
                                    {appliedJobs.map((job, index) => (
                                        <motion.div
                                            key={job._id || job.applicationDetails?.applicationId || index}
                                            variants={itemVariants}
                                            whileHover="hover"
                                            custom={index}
                                            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-200 w-full overflow-hidden"
                                        >
                                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <h3 className="text-2xl font-bold text-gray-900 break-words">
                                                            {job.jobTitle || 'Job Title'}
                                                        </h3>
                                                    </div>

                                                    <p className="text-gray-600 mb-5 line-clamp-2 break-words overflow-hidden leading-relaxed">
                                                        {job.jobDescription || 'No description available'}
                                                    </p>

                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                                                        <div className="flex items-center space-x-3 text-gray-600 min-w-0 bg-gray-50 p-3 rounded-lg">
                                                            <Building className="h-5 w-5 flex-shrink-0 text-blue-600" />
                                                            <span className="text-sm font-medium truncate">
                                                                {job.postedBy?.name || 'Company Name'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center space-x-3 text-gray-600 min-w-0 bg-gray-50 p-3 rounded-lg">
                                                            <MapPin className="h-5 w-5 flex-shrink-0 text-blue-600" />
                                                            <span className="text-sm font-medium truncate">{job.location || 'Location not specified'}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-3 text-gray-600 min-w-0 bg-gray-50 p-3 rounded-lg">
                                                            <Clock className="h-5 w-5 flex-shrink-0 text-blue-600" />
                                                            <span className="text-sm font-medium truncate">
                                                                Applied {formatDate(job.applicationDetails?.appliedAt || job.datePosted)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {job.jobType && (
                                                        <div className="flex items-center space-x-2">
                                                            <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-xl text-xs font-bold shadow-sm">
                                                                {job.jobType}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-16 text-center border-2 border-gray-100"
                                >
                                    <motion.div
                                        animate={{ y: [0, -10, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <Briefcase className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                                    </motion.div>
                                    <h3 className="text-2xl font-bold text-gray-600 mb-3">No Applications Yet</h3>
                                    <p className="text-gray-500 mb-8 text-lg">Start exploring opportunities and apply to jobs that match your interests!</p>
                                    <motion.button
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setActiveTab('recommended')}
                                        className="px-8 py-4 text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
                                        style={{ background: 'linear-gradient(135deg, #1c398e 0%, #3b5bdb 100%)' }}
                                    >
                                        Browse Recommended Jobs
                                    </motion.button>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'recommended' && (
                        <motion.div
                            key="recommended"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center justify-between mb-8"
                            >
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900">Recommended Jobs</h2>
                                    <p className="text-gray-600 mt-2 font-medium">Jobs curated based on your preferences and profile</p>
                                </div>
                                <div className="text-sm text-gray-500 bg-white px-5 py-3 rounded-xl shadow-md border border-gray-200">
                                    Found: <span className="font-bold text-gray-900 text-lg">{recommendedJobs.length}</span> matches
                                </div>
                            </motion.div>

                            {recommendedJobs.length > 0 ? (
                                <motion.div 
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="grid gap-6"
                                >
                                    {recommendedJobs.map((job, index) => (
                                        <motion.div
                                            key={job._id || index}
                                            variants={itemVariants}
                                            whileHover="hover"
                                            custom={index}
                                            className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-green-200 ${isJobClosed(job) ? 'opacity-50 grayscale' : ''}`}
                                        >
                                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <h3 className="text-2xl font-bold text-gray-900">
                                                            {job.title || 'Job Title'}
                                                        </h3>
                                                        <motion.span 
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            transition={{ delay: 0.3, type: "spring" }}
                                                            className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-xl text-xs font-bold ml-4 shadow-sm"
                                                        >
                                                            Recommended
                                                        </motion.span>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                                                        <div className="flex items-center space-x-3 text-gray-600 bg-gray-50 p-3 rounded-lg">
                                                            <Building className="h-5 w-5 flex-shrink-0 text-blue-600" />
                                                            <span className="text-sm font-medium">
                                                                {job.postedBy?.name || 'Company Name'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center space-x-3 text-gray-600 bg-gray-50 p-3 rounded-lg">
                                                            <MapPin className="h-5 w-5 flex-shrink-0 text-blue-600" />
                                                            <span className="text-sm font-medium">{job.location || 'Location not specified'}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-3 text-gray-600 bg-gray-50 p-3 rounded-lg">
                                                            <Clock className="h-5 w-5 flex-shrink-0 text-blue-600" />
                                                            <span className="text-sm font-medium">Posted {formatDate(job.datePosted)}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-3">
                                                        {job.jobType && (
                                                            <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-xl text-xs font-bold shadow-sm">
                                                                {job.jobType}
                                                            </span>
                                                        )}
                                                        {job.jobStatus && (
                                                            <span className={`px-4 py-2 rounded-xl text-xs font-bold shadow-sm ${job.jobStatus === 'active' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800' : 'bg-gradient-to-r from-red-100 to-orange-100 text-red-800'}`}>
                                                                {job.jobStatus}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-6 lg:mt-0 lg:ml-6 flex-shrink-0">
                                                    {isJobClosed(job) ? (
                                                        <div className="w-full lg:w-auto px-8 py-3 text-red-600 font-bold rounded-xl border-2 border-red-200 bg-red-50 text-center">
                                                            Closed
                                                        </div>
                                                    ) : (
                                                        <motion.button
                                                            whileHover={{ scale: 1.05, y: -2 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            className="w-full lg:w-auto px-8 py-3 text-white font-semibold rounded-xl hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl"
                                                            style={{ background: 'linear-gradient(135deg, #1c398e 0%, #3b5bdb 100%)' }}
                                                            onClick={() => window.location.href = `/jobs-landing/${job._id}`}
                                                        >
                                                            See Details
                                                        </motion.button>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-16 text-center border-2 border-gray-100"
                                >
                                    <motion.div
                                        animate={{ rotate: [0, 10, -10, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <Star className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                                    </motion.div>
                                    <h3 className="text-2xl font-bold text-gray-600 mb-3">No Recommendations Available</h3>
                                    <div className="text-gray-500 space-y-3 text-lg">
                                        <p>No jobs match your current preferences.</p>
                                        <p className="text-sm">
                                            Current preferences: <span className="font-bold">{getUserPreferences().join(', ')}</span>
                                        </p>
                                        <p className="text-sm">Try updating your preferences or check back later for new opportunities.</p>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};