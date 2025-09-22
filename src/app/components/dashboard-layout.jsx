"use client";

import React, { useState, useEffect } from "react";
import {
    Search, MapPin, Clock, Users, Briefcase, TrendingUp,
    Star, ChevronRight, Building, ArrowRight, Zap, AlertCircle
} from "lucide-react";
import Link from "next/link";

const JobSeekersLanding = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedLocation, setSelectedLocation] = useState("all");
    const [isLoaded, setIsLoaded] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch jobs from API with proper error handling
    useEffect(() => {
        const fetchJobs = async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await fetch("http://localhost:4441/api/job/");

                if (!res.ok) {
                    if (res.status === 404) {
                        setError({
                            type: 'not_found',
                            title: 'No Jobs Available',
                            message: 'No job listings are currently available. Please check back later.'
                        });
                    } else if (res.status >= 500) {
                        setError({
                            type: 'server_error',
                            title: 'Server Issue',
                            message: 'Our servers are experiencing issues. Please try again in a few minutes.'
                        });
                    } else {
                        setError({
                            type: 'fetch_error',
                            title: 'Loading Error',
                            message: 'Unable to load job listings. Please refresh the page and try again.'
                        });
                    }
                    return;
                }

                const data = await res.json();
                setJobs(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching jobs:", error);

                if (error.name === 'TypeError' && error.message.includes('fetch')) {
                    setError({
                        type: 'network_error',
                        title: 'Connection Problem',
                        message: 'Unable to connect to our servers. Please check your internet connection and try again.'
                    });
                } else {
                    setError({
                        type: 'unknown_error',
                        title: 'Something Went Wrong',
                        message: 'An unexpected error occurred while loading job listings. Please refresh the page.'
                    });
                }
            } finally {
                setLoading(false);
                setIsLoaded(true);
            }
        };

        fetchJobs();
    }, []);

    const getJobTypeCategory = (jobType) => {
        if (!jobType) return 'other';
        const type = jobType.toLowerCase().trim();

        // Map API jobType values to our category IDs
        if (type.includes('engineer') || type.includes('developer') || type.includes('software') || type.includes('tech')) {
            return 'engineering';
        }
        if (type.includes('design') || type.includes('ui') || type.includes('ux')) {
            return 'design';
        }
        if (type.includes('market') || type.includes('sales') || type.includes('business')) {
            return 'marketing';
        }
        if (type.includes('data') || type.includes('analyst') || type.includes('science')) {
            return 'data';
        }
        if (type.includes('product') || type.includes('management') || type.includes('manager')) {
            return 'product';
        }
        return 'other';
    };

    const categories = [
        { id: "all", name: "All Jobs", count: jobs.length, icon: Briefcase },
        { id: "engineering", name: "Engineering", count: jobs.filter((j) => getJobTypeCategory(j.jobType) === "engineering").length, icon: Zap },
        { id: "design", name: "Design", count: jobs.filter((j) => getJobTypeCategory(j.jobType) === "design").length, icon: Star },
        { id: "marketing", name: "Marketing", count: jobs.filter((j) => getJobTypeCategory(j.jobType) === "marketing").length, icon: TrendingUp },
        { id: "data", name: "Data", count: jobs.filter((j) => getJobTypeCategory(j.jobType) === "data").length, icon: Users },
        { id: "product", name: "Product", count: jobs.filter((j) => getJobTypeCategory(j.jobType) === "product").length, icon: Building },
        { id: "other", name: "Other", count: jobs.filter((j) => getJobTypeCategory(j.jobType) === "other").length, icon: AlertCircle },
    ];

    

    const filteredJobs = jobs.filter((job) => {
        const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false;

        const matchesCategory = selectedCategory === "all" || getJobTypeCategory(job.jobType) === selectedCategory;

        const matchesLocation = selectedLocation === "all" ||
            (selectedLocation === "remote" && job.remote) ||
            job.location?.toLowerCase().includes(selectedLocation.replace("-", " "));

        return matchesSearch && matchesCategory && matchesLocation;
    });
    const featuredJobs = jobs.filter((job) => job.featured);

    // Loading state - keep full page layout
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#dbeafe] via-blue-50 to-white">
                {/* Navigation */}
                <nav className="bg-white/90 backdrop-blur-lg border-b border-blue-100 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-[#1c398e] to-[#3b82f6] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                    ILS
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-[#1c398e]">ILS</h1>
                                    <p className="text-xs text-blue-600">Find Your Dream Job</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => window.href = 'auth/login'}
                                    className="bg-gradient-to-r from-[#1c398e] to-[#3b82f6] text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105">
                                    Login
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Loading Hero Section */}
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

                {/* Loading Content */}
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
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#dbeafe] via-blue-50 to-white">
            {/* Navigation */}
            <nav className={`bg-white/90 backdrop-blur-lg border-b border-blue-100 sticky top-0 z-50 transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#1c398e] to-[#3b82f6] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                ILS
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-[#1c398e]">ILS</h1>
                                <p className="text-xs text-blue-600">Find Your Dream Job</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => { window.location.href = 'auth/login';}}
                                className="bg-gradient-to-r from-[#1c398e] to-[#3b82f6] text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105">
                                Login
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className={`relative py-20 px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-[#1c398e] mb-6 leading-tight">
                        Find Your
                        <span className="bg-gradient-to-r from-[#1c398e] to-[#3b82f6] bg-clip-text text-transparent"> Dream Job</span>
                    </h1>
                    <p className="text-xl text-blue-600 mb-8 max-w-2xl mx-auto">
                        Discover thousands of job opportunities with leading companies. Start your career journey today.
                    </p>

                    {/* Hero Search */}
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/50 max-w-4xl mx-auto">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Job title or keywords"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 text-[#1c398e] bg-white/80 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1c398e] focus:border-transparent transition-all duration-300 placeholder-blue-400 text-lg"
                                />
                            </div>
                            <button className="bg-gradient-to-r from-[#1c398e] to-[#3b82f6] text-white px-8 py-4 rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center space-x-2 font-semibold">
                                <span>Search Jobs</span>
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Featured Jobs */}
                {!error && featuredJobs.length > 0 && (
                    <section className={`mb-16 transition-all duration-1000 delay-300 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <div className="flex items-center space-x-3 mb-8">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#1c398e] to-[#3b82f6] rounded-lg flex items-center justify-center">
                                <Star className="w-4 h-4 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-[#1c398e]">Featured Jobs</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredJobs.slice(0, 3).map((job, index) => (
                                <div
                                    key={job._id}
                                    className={`group bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:bg-white/90 cursor-pointer transform`}
                                    style={{ animationDelay: `${index * 150}ms` }}
                                >
                                    {/* Featured Badge */}
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                                            <Star className="w-3 h-3" />
                                            <span>FEATURED</span>
                                        </span>
                                    </div>

                                    {/* Job Info */}
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
                                            <div className="flex items-center text-gray-600">
                                                <Clock className="w-4 h-4 mr-2 text-blue-400" />
                                                <span className="text-sm">Posted {new Date(job.datePosted).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Details Button */}
                                    <Link href={`/dashboard/${job._id}`}>
                                        <button className="w-full bg-gradient-to-r from-[#1c398e] to-[#3b82f6] text-white py-3 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 font-semibold">
                                            See Details
                                        </button>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Categories Filter */}
                {!error && (
                    <div className={`mb-8 transition-all duration-1000 delay-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <div className="flex flex-wrap gap-3">
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.id)}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${selectedCategory === category.id
                                        ? 'bg-gradient-to-r from-[#1c398e] to-[#3b82f6] text-white shadow-lg'
                                        : 'bg-white/80 text-blue-600 hover:bg-white border border-blue-200'
                                        }`}
                                >
                                    <category.icon className="w-4 h-4" />
                                    <span>{category.name}</span>
                                    <span className={`px-2 py-1 rounded-full text-xs ${selectedCategory === category.id
                                        ? 'bg-white/20 text-white'
                                        : 'bg-blue-100 text-blue-600'
                                        }`}>
                                        {category.count}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* All Jobs or Error Section */}
                <section className={`transition-all duration-1000 delay-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    {error ? (
                        // Error state in job listing area
                        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-12 shadow-lg border border-white/50 text-center">
                            <div className="max-w-md mx-auto">
                                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                                    <AlertCircle className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-[#1c398e] mb-4">{error.title}</h3>
                                <p className="text-blue-600 mb-8 leading-relaxed">{error.message}</p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="bg-gradient-to-r from-[#1c398e] to-[#3b82f6] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 font-semibold"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold text-[#1c398e]">
                                    {selectedCategory === 'all' ? 'All Jobs' : categories.find(c => c.id === selectedCategory)?.name + ' Jobs'}
                                    <span className="text-blue-600 font-normal"> ({filteredJobs.length} jobs)</span>
                                </h2>
                            </div>

                            {filteredJobs.length > 0 ? (
                                <div className="space-y-4">
                                    {filteredJobs.map((job, index) => (
                                        <div
                                            key={job._id}
                                            className={`group bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-2xl transition-all duration-500 hover:scale-[1.01] hover:bg-white/90 cursor-pointer`}
                                            style={{ animationDelay: `${index * 100}ms` }}
                                        >
                                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                                                {/* Job Info */}
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
                                                                    <span>Posted: {new Date(job.datePosted).toLocaleDateString()}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                                                    <Link href={`/dashboard/${job._id}`}>
                                                        <button className="bg-gradient-to-r from-[#1c398e] to-[#3b82f6] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 font-semibold flex items-center space-x-2">
                                                            <span>See Details</span>
                                                            <ChevronRight className="w-4 h-4" />
                                                        </button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <div className="w-24 h-24 bg-gradient-to-br from-[#dbeafe] to-blue-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                                        <Search className="w-8 h-8 text-[#1c398e]" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-[#1c398e] mb-4">No jobs found</h3>
                                    <p className="text-blue-600 mb-6">Try adjusting your search criteria or browse all categories.</p>
                                    <button
                                        onClick={() => {
                                            setSearchTerm('');
                                            setSelectedCategory('all');
                                            setSelectedLocation('all');
                                        }}
                                        className="bg-gradient-to-r from-[#1c398e] to-[#3b82f6] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 font-semibold"
                                    >
                                        View All Jobs
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </section>
            </div>
        </div>
    );
};

export default JobSeekersLanding;