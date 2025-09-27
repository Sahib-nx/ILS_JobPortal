"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    Search, MapPin, Clock, Users, Briefcase, TrendingUp,
    Star, ChevronRight, Building, ArrowRight, Zap, AlertCircle, User
} from "lucide-react";

// Constants
const API_BASE_URL = "http://localhost:4441/api";
const CATEGORIES = [
    { id: "all", name: "All Jobs", icon: Briefcase },
    { id: "engineering", name: "Engineering", icon: Zap },
    { id: "design", name: "Design", icon: Star },
    { id: "marketing", name: "Marketing", icon: TrendingUp },
    { id: "data", name: "Data", icon: Users },
    { id: "product", name: "Product", icon: Building },
    { id: "other", name: "Other", icon: AlertCircle },
];

// Utility Functions
const getJobTypeCategory = (jobType) => {
    if (!jobType) return 'other';
    const type = jobType.toLowerCase().trim();
    
    if (type.includes('engineer')) return 'engineering';
    if (type.includes('design')) return 'design';
    if (type.includes('market')) return 'marketing';
    if (type.includes('data')) return 'data';
    if (type.includes('product')) return 'product';
    return 'other';
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
};

// Custom Hooks
const useJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API_BASE_URL}/job/`);

            if (!res.ok) {
                const errorMap = {
                    404: { type: 'not_found', title: 'No Jobs Available', message: 'No job listings are currently available. Please check back later.' },
                    500: { type: 'server_error', title: 'Server Issue', message: 'Our servers are experiencing issues. Please try again in a few minutes.' },
                    default: { type: 'fetch_error', title: 'Loading Error', message: 'Unable to load job listings. Please refresh the page and try again.' }
                };
                setError(errorMap[res.status] || errorMap.default);
                return;
            }

            const data = await res.json();
            const sortedJobs = Array.isArray(data) 
                ? data.sort((a, b) => new Date(b.datePosted) - new Date(a.datePosted))
                : [];
            setJobs(sortedJobs);
        } catch (error) {
            console.error("Error fetching jobs:", error);
            
            const errorType = error.name === 'TypeError' && error.message.includes('fetch')
                ? { type: 'network_error', title: 'Connection Problem', message: 'Unable to connect to our servers. Please check your internet connection and try again.' }
                : { type: 'unknown_error', title: 'Something Went Wrong', message: 'An unexpected error occurred while loading job listings. Please refresh the page.' };
            
            setError(errorType);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    return { jobs, loading, error, refetch: fetchJobs };
};

const useFilters = (jobs) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedLocation, setSelectedLocation] = useState("all");

    const filteredJobs = useMemo(() => {
        return jobs.filter((job) => {
            const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
            const matchesCategory = selectedCategory === "all" || getJobTypeCategory(job.jobType) === selectedCategory;
            const matchesLocation = selectedLocation === "all" ||
                (selectedLocation === "remote" && job.remote) ||
                job.location?.toLowerCase().includes(selectedLocation.replace("-", " "));

            return matchesSearch && matchesCategory && matchesLocation;
        });
    }, [jobs, searchTerm, selectedCategory, selectedLocation]);

    const resetFilters = useCallback(() => {
        setSearchTerm('');
        setSelectedCategory('all');
        setSelectedLocation('all');
    }, []);

    return {
        searchTerm,
        setSearchTerm,
        selectedCategory,
        setSelectedCategory,
        selectedLocation,
        setSelectedLocation,
        filteredJobs,
        resetFilters
    };
};

// Components
const Navigation = ({ isLoaded }) => {
    const [userRole, setUserRole] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const role = localStorage.getItem('userRole');

        
        setIsLoggedIn(!!token);
        setUserRole(role);
    }, []);

    const handleUserIconClick = () => {
        if (userRole === 'user') {
            window.location.href = '/user';
        } else if (userRole === 'recruiter') {
            console.log('Navigating to recruiter dashboard');
            window.location.href = '/recruiter';
        } else if (userRole === 'Admin') {
            console.log('Navigating to admin dashboard');
            window.location.href = '/admin';
        } else {
            console.log('No valid role found for navigation');
        }
    };

    return (
        <nav className={`bg-white/90 backdrop-blur-lg border-b border-blue-100 sticky top-0 z-50 transition-all duration-700 ${
            isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#1c398e] to-[#3b82f6] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            ILS
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-xl font-bold text-[#1c398e]">ILS</h1>
                            <p className="text-xs text-blue-600">Find Your Dream Job</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 sm:space-x-3">
                        {console.log('Rendering buttons - isLoggedIn:', isLoggedIn, 'userRole:', userRole)}
                        {!isLoggedIn ? (
                            <button
                                onClick={() => { 
                                    console.log('Login button clicked');
                                    window.location.href = 'auth/login'; 
                                }}
                                className="bg-gradient-to-r from-[#1c398e] to-[#3b82f6] text-white px-3 sm:px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 text-sm sm:text-base">
                                Login
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    console.log('User icon button clicked');
                                    handleUserIconClick();
                                }}
                                className="bg-gradient-to-r from-[#1c398e] to-[#3b82f6] text-white p-2 flex gap-2 rounded-lg hover:shadow-lg transition-all duration-300"
                                title={`Go to ${userRole} dashboard`}>
                                <User className="w-5 h-5" />
                                <span>Dashboard</span>
                            </button>
                        )}
                        
                        {userRole === 'user' && (
                            <button
                                onClick={() => { 
                                    console.log('Recruiter button clicked');
                                    window.location.href = 'recruiter-form'; 
                                }}
                                className="bg-gradient-to-r from-[#1c398e] to-[#3b82f6] text-white px-2 sm:px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 text-sm sm:text-base whitespace-nowrap">
                                Recruiter
                            </button>
                        )}
                        
                    </div>
                </div>
            </div>
        </nav>
    );
};

const LoadingSkeleton = () => (
    <div className="min-h-screen bg-gradient-to-br from-[#dbeafe] via-blue-50 to-white">
        <Navigation isLoaded={false} />
        
        <section className="relative py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
                <div className="animate-pulse space-y-6">
                    <div className="h-12 bg-gray-200 rounded-lg mx-auto w-3/4"></div>
                    <div className="h-6 bg-gray-100 rounded mx-auto w-1/2"></div>
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/50 max-w-4xl mx-auto">
                        <div className="h-12 bg-gray-100 rounded-xl"></div>
                    </div>
                </div>
            </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white/80 rounded-2xl p-6 shadow-lg">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-100 rounded w-1/2 mb-4"></div>
                                <div className="h-10 bg-gray-100 rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const HeroSection = ({ isLoaded, searchTerm, setSearchTerm }) => (
    <section className={`relative py-12 lg:py-20 px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
        isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
    } overflow-hidden`}>
        <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div className={`space-y-8 transition-all duration-1000 delay-200 ${
                    isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
                }`}>
                    <div className="space-y-6">
                        <h1 className="text-2xl sm:text-2xl lg:text-5xl xl:text-5xl font-bold text-[#1c398e] leading-tight">
                            Welcome to ILS Job Portal
                        </h1>
                        <p className="text-base sm:text-lg text-blue-500 max-w-xl leading-relaxed">
                            Discover thousands of job opportunities with leading companies. Start your career journey today.
                        </p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/50 max-w-4xl mx-auto">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Job title, keywords..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 sm:py-4 text-[#1c398e] bg-white/80 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1c398e] focus:border-transparent transition-all duration-300 placeholder-blue-400 text-base"
                                />
                            </div>
                            <button className="bg-gradient-to-r from-[#1c398e] to-[#3b82f6] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 font-semibold">
                                <span>Search Jobs</span>
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className={`relative transition-all duration-1000 delay-400 ${
                    isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
                } order-first lg:order-last`}>
                    <div className="relative">
                        <div className="absolute top-4 left-4 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl opacity-80 animate-bounce delay-1000 flex items-center justify-center">
                            <Star className="w-6 h-6 text-white" />
                        </div>
                        <div className="absolute bottom-8 right-8 w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl opacity-70 animate-bounce delay-2000 flex items-center justify-center">
                            <Briefcase className="w-6 h-6 text-white" />
                        </div>
                        <div className="absolute top-1/3 -right-4 w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg opacity-60 animate-bounce delay-3000 flex items-center justify-center">
                            <Search className="w-5 h-5 text-white" />
                        </div>
                        
                        <img
                            src="/ils_image.svg"
                            alt="Professional team working together - Find your dream job"
                            className="w-full h-48 sm:h-64 lg:h-80 object-cover rounded-2xl transition-all duration-500"
                            onError={(e) => {
                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMxYzM5OGU7c3RvcC1vcGFjaXR5OjAuMSIgLz4KPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojM2I4MmY2O3N0b3Atb3BhY2l0eTowLjIiIC8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiMxYzM5OGUiIGZvbnQtc2l6ZT0iMjQiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9ImJvbGQiPkpvYiBTZWVrZXIgSW1hZ2U8L3RleHQ+Cjwvc3ZnPgo=';
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    </section>
);

const CategoryFilter = ({ categories, selectedCategory, setSelectedCategory, isLoaded }) => (
    <div className={`mb-8 lg:mb-16 transition-all duration-1000 delay-500 ${
        isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
    }`}>
        <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-[#1c398e] to-[#3b82f6] rounded-lg flex items-center justify-center">
                <Search className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1c398e]">Browse by Category</h2>
        </div>
        
        <div className="overflow-x-auto pb-4 lg:pb-0">
            <div className="flex lg:flex-wrap gap-3 min-w-max lg:min-w-0">
                {categories.map((category, index) => (
                    <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap ${
                            selectedCategory === category.id
                                ? 'bg-gradient-to-r from-[#1c398e] to-[#3b82f6] text-white shadow-lg'
                                : 'bg-white/80 text-blue-600 hover:bg-white border border-blue-200 hover:shadow-md'
                        }`}
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <category.icon className="w-4 h-4" />
                        <span className="font-medium">{category.name}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            selectedCategory === category.id
                                ? 'bg-white/20 text-white'
                                : 'bg-blue-100 text-blue-600'
                        }`}>
                            {category.count}
                        </span>
                    </button>
                ))}
            </div>
        </div>
        
        <div className="lg:hidden text-center mt-2">
            <div className="text-xs text-blue-400 flex items-center justify-center space-x-1">
                <span>Swipe to see more categories</span>
                <ArrowRight className="w-3 h-3" />
            </div>
        </div>
    </div>
);

const JobCard = ({ job, index, featured = false }) => (
    <div
        className={`group bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:bg-white/90 cursor-pointer transform`}
        style={{ animationDelay: `${index * 150}ms` }}
    >
        {featured && (
            <div className="flex items-center justify-between mb-4">
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                    <Star className="w-3 h-3" />
                    <span>FEATURED</span>
                </span>
            </div>
        )}

        <div className="mb-4">
            <h3 className="text-lg font-bold text-[#1c398e] group-hover:text-blue-600 transition-colors mb-2">
                {job.title}
            </h3>
            {job.location && (
                <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-2 text-blue-400" />
                    <span className="text-sm">{job.location}</span>
                </div>
            )}
            {job.jobType && (
                <div className="flex items-center text-gray-600 mb-2">
                    <Briefcase className="w-4 h-4 mr-2 text-blue-400" />
                    <span className="text-sm">{job.jobType}</span>
                </div>
            )}
            {job.datePosted && (
                <div className="flex items-center text-gray-600 mb-2">
                    <Clock className="w-4 h-4 mr-2 text-blue-400" />
                    <span className="text-sm">Posted {formatDate(job.datePosted)}</span>
                </div>
            )}
            {job.jobStatus && (
                <div className="flex items-center text-gray-600">
                    <div className={`w-2 h-2 rounded-full mr-2 ${job.jobStatus === 'active' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span className={`text-sm font-medium ${job.jobStatus === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                        {job.jobStatus === 'active' ? 'Active' : 'Closed'}
                    </span>
                </div>
            )}
        </div>

        {job.jobStatus === 'closed' || job.jobStatus === 'close' ? (
            <div className="w-full bg-gray-400 text-white py-3 rounded-xl font-semibold text-center cursor-not-allowed">
                Closed
            </div>
        ) : (
            <button 
            onClick={() => window.location.href = `/jobs-landing/${job._id}`}
            className="w-full bg-gradient-to-r from-[#1c398e] to-[#3b82f6] text-white py-3 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 font-semibold">
                See Details
            </button>
        )}
    </div>
);

const JobListCard = ({ job, index }) => (
    <div
        className="group bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-2xl transition-all duration-500 hover:scale-[1.01] hover:bg-white/90 cursor-pointer"
        style={{ animationDelay: `${index * 100}ms` }}
    >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start space-x-4 mb-4 lg:mb-0">
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#1c398e] group-hover:text-blue-600 transition-colors">
                        {job.title}
                    </h3>
                    <div className="space-y-1 mt-2">
                        {job.location && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="w-4 h-4 text-blue-400" />
                                <span>{job.location}</span>
                            </div>
                        )}
                        {job.jobType && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Briefcase className="w-4 h-4 text-blue-400" />
                                <span>Category: {job.jobType}</span>
                            </div>
                        )}
                        {job.datePosted && (
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <Clock className="w-3 h-3 text-blue-300" />
                                <span>Posted: {formatDate(job.datePosted)}</span>
                            </div>
                        )}
                        {job.jobStatus && (
                            <div className="flex items-center gap-2 text-sm">
                                <div className={`w-2 h-2 rounded-full ${job.jobStatus === 'active' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                <span className={`font-medium ${job.jobStatus === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                                    {job.jobStatus === 'active' ? 'Active' : 'Closed'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                {job.jobStatus === 'closed' || job.jobStatus === 'close' ? (
                    <div className="bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold cursor-not-allowed">
                        Closed
                    </div>
                ) : (
                    <button 
                     onClick={() => window.location.href = `/jobs-landing/${job._id}`}
                    className="bg-gradient-to-r from-[#1c398e] to-[#3b82f6] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 font-semibold flex items-center space-x-2">
                        <span>See Details</span>
                        <ChevronRight className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    </div>
);

const ErrorState = ({ error, onRetry }) => (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-12 shadow-lg border border-white/50 text-center">
        <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-[#1c398e] mb-4">{error.title}</h3>
            <p className="text-blue-600 mb-8 leading-relaxed">{error.message}</p>
            <button
                onClick={onRetry}
                className="bg-gradient-to-r from-[#1c398e] to-[#3b82f6] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 font-semibold"
            >
                Try Again
            </button>
        </div>
    </div>
);

const EmptyState = ({ onReset }) => (
    <div className="text-center py-16">
        <div className="w-24 h-24 bg-gradient-to-br from-[#dbeafe] to-blue-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Search className="w-8 h-8 text-[#1c398e]" />
        </div>
        <h3 className="text-2xl font-bold text-[#1c398e] mb-4">No jobs found</h3>
        <p className="text-blue-600 mb-6">Try adjusting your search criteria or browse all categories.</p>
        <button
            onClick={onReset}
            className="bg-gradient-to-r from-[#1c398e] to-[#3b82f6] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 font-semibold"
        >
            View All Jobs
        </button>
    </div>
);

// Main Component
const JobSeekersLanding = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const { jobs, loading, error, refetch } = useJobs();
    const {
        searchTerm,
        setSearchTerm,
        selectedCategory,
        setSelectedCategory,
        filteredJobs,
        resetFilters
    } = useFilters(jobs);
    useEffect(() => {
        if (!loading) {
            setIsLoaded(true);
        }
    }, [loading]);

    const categoriesWithCounts = useMemo(() => 
        CATEGORIES.map(category => ({
            ...category,
            count: category.id === 'all' 
                ? jobs.length 
                : jobs.filter(job => getJobTypeCategory(job.jobType) === category.id).length
        }))
    , [jobs]);

    const featuredJobs = useMemo(() => 
        jobs.filter(job => job.featured)
    , [jobs]);

    if (loading) {
        return <LoadingSkeleton />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#dbeafe] via-blue-50 to-white pb-16">
            <Navigation isLoaded={isLoaded} />
            
            <HeroSection 
                isLoaded={isLoaded}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {!error && (
                    <CategoryFilter
                        categories={categoriesWithCounts}
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        isLoaded={isLoaded}
                    />
                )}

                {!error && featuredJobs.length > 0 && (
                    <section className={`mb-16 transition-all duration-1000 delay-300 ${
                        isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                    }`}>
                        <div className="flex items-center space-x-3 mb-8">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#1c398e] to-[#3b82f6] rounded-lg flex items-center justify-center">
                                <Star className="w-4 h-4 text-white" />
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold text-[#1c398e]">Featured Jobs</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {featuredJobs.slice(0, 3).map((job, index) => (
                                <JobCard key={job._id} job={job} index={index} featured />
                            ))}
                        </div>
                    </section>
                )}

                <section className={`transition-all duration-1000 delay-700 ${
                    isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}>
                    {error ? (
                        <ErrorState error={error} onRetry={refetch} />
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl sm:text-2xl font-bold text-[#1c398e]">
                                    {selectedCategory === 'all' 
                                        ? 'All Jobs' 
                                        : `${categoriesWithCounts.find(c => c.id === selectedCategory)?.name} Jobs`
                                    }
                                    <span className="text-blue-600 font-normal"> ({filteredJobs.length} jobs)</span>
                                </h2>
                            </div>

                            {filteredJobs.length > 0 ? (
                                <div className="space-y-4">
                                    {filteredJobs.map((job, index) => (
                                        <JobListCard key={job._id} job={job} index={index} />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState onReset={resetFilters} />
                            )}
                        </>
                    )}
                </section>
            </div>

            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-10px) rotate(5deg); }
                }
                
                @keyframes float-delayed {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-15px) rotate(-5deg); }
                }
                
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
                
                .animate-float-delayed {
                    animation: float-delayed 3s ease-in-out infinite;
                    animation-delay: 1s;
                }
                
                .overflow-x-auto::-webkit-scrollbar {
                    height: 4px;
                }
                
                .overflow-x-auto::-webkit-scrollbar-track {
                    background: rgba(59, 130, 246, 0.1);
                    border-radius: 2px;
                }
                
                .overflow-x-auto::-webkit-scrollbar-thumb {
                    background: linear-gradient(90deg, #1c398e, #3b82f6);
                    border-radius: 2px;
                }
            `}</style>
        </div>
    );
};

export default JobSeekersLanding;