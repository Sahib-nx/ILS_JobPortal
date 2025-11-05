"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    Search, MapPin, Clock, Users, Briefcase, TrendingUp,
    Star, ChevronRight, Building, ArrowRight, Zap, AlertCircle, User,
    LogIn,
    UserPlus,
    Upload,
    Menu,
    X
} from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';

// Constants
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

const isJobClosed = (job) => {
    return job.jobStatus === 'closed' || job.jobStatus === 'close';
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
            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/job/`);

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

const Navigation = ({ isLoaded }) => {
    const [userRole, setUserRole] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const role = localStorage.getItem('userRole');

        setIsLoggedIn(!!token);
        setUserRole(role);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768 && mobileMenuOpen) {
                setMobileMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [mobileMenuOpen]);

    const handleUserIconClick = () => {
        if (userRole === 'User') {
            window.location.href = '/user';
        } else if (userRole === 'Recruiter') {
            console.log('Navigating to recruiter dashboard');
            window.location.href = '/recruiter';
        } else if (userRole === 'Admin') {
            console.log('Navigating to admin dashboard');
            window.location.href = '/admin';
        } else {
            console.log('No valid role found for navigation');
        }
    };

    const menuVariants = {
        hidden: {
            opacity: 0,
            height: 0,
            transition: {
                duration: 0.3,
                ease: "easeInOut"
            }
        },
        visible: {
            opacity: 1,
            height: "auto",
            transition: {
                duration: 0.3,
                ease: "easeInOut"
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: -10 },
        visible: { opacity: 1, y: 0 }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <motion.nav 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="bg-white/70 backdrop-blur-xl border-b border-blue-100/50 sticky top-0 z-50 shadow-sm"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="flex items-center space-x-3"
                    >
                        <div className="w-12 h-12 bg-gradient-to-br from-[#1c398e] via-[#2d4ba6] to-[#3b82f6] rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <span className="relative z-10">ILS</span>
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#1c398e] to-[#3b82f6] bg-clip-text text-transparent">ILS</h1>
                            <p className="text-xs text-blue-600/80 font-medium">Find Your Dream Job</p>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="hidden md:flex items-center gap-3"
                    >
                        {!isLoggedIn ? (
                            <>
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        console.log('Login button clicked');
                                        window.location.href = 'auth/login';
                                    }}
                                    className="bg-gradient-to-r from-[#1c398e] to-[#3b82f6] text-white px-6 py-2.5 rounded-xl hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 text-sm font-semibold flex items-center gap-2 relative overflow-hidden group"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#3b82f6] to-[#1c398e] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <LogIn className="w-4 h-4 relative z-10" />
                                    <span className="relative z-10">Login</span>
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        console.log('Recruiter button clicked');
                                        window.location.href = 'recruiter-form';
                                    }}
                                    className="bg-white/90 text-[#1c398e] border border-blue-200 px-6 py-2.5 rounded-xl hover:shadow-lg hover:bg-white transition-all duration-300 text-sm font-semibold flex items-center gap-2"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    <span>Join as Recruiter</span>
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        window.location.href = '/auth/login';
                                    }}
                                    className="bg-white/90 text-[#1c398e] border border-blue-200 px-6 py-2.5 rounded-xl hover:shadow-lg hover:bg-white transition-all duration-300 text-sm font-semibold flex items-center gap-2"
                                >
                                    <Upload className="w-4 h-4" />
                                    <span>Upload Resume</span>
                                </motion.button>
                            </>
                        ) : (
                            <>
                                {userRole ? (
                                    <motion.button
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            console.log('User icon button clicked');
                                            handleUserIconClick();
                                        }}
                                        className="bg-gradient-to-r from-[#1c398e] to-[#3b82f6] text-white px-6 py-2.5 rounded-xl hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 text-sm font-semibold flex items-center gap-2"
                                        title={`Go to ${userRole} dashboard`}
                                    >
                                        <User className="w-4 h-4" />
                                        <span className="max-w-[150px] truncate">{localStorage.getItem("name")}</span>
                                    </motion.button>
                                ) : (
                                    <motion.button
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            window.location.href = "/recruiter-form"
                                        }}
                                        className="bg-gradient-to-r from-[#1c398e] to-[#3b82f6] text-white px-6 py-2.5 rounded-xl hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 text-sm font-semibold flex items-center gap-2"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                        <span>Submit Form</span>
                                    </motion.button>
                                )}

                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        localStorage.clear();
                                        window.location.href = "/";
                                    }}
                                    className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2.5 rounded-xl hover:shadow-xl hover:shadow-red-500/30 transition-all duration-300 text-sm font-semibold flex items-center gap-2"
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                                    </svg>
                                    <span>Logout</span>
                                </motion.button>
                            </>
                        )}
                    </motion.div>

                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-[#1c398e] hover:bg-blue-50 rounded-xl transition-colors"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            variants={menuVariants}
                            className="md:hidden overflow-hidden border-t border-blue-100/50"
                        >
                            <motion.div 
                                variants={containerVariants}
                                className="py-4 space-y-3"
                            >
                                {!isLoggedIn ? (
                                    <>
                                        <motion.button
                                            variants={itemVariants}
                                            onClick={() => {
                                                window.location.href = 'auth/login';
                                                setMobileMenuOpen(false);
                                            }}
                                            className="w-full bg-gradient-to-r from-[#1c398e] to-[#3b82f6] text-white px-5 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold flex items-center justify-center gap-3"
                                        >
                                            <LogIn className="w-5 h-5" />
                                            <span>Login</span>
                                        </motion.button>

                                        <motion.button
                                            variants={itemVariants}
                                            onClick={() => {
                                                window.location.href = 'recruiter-form';
                                                setMobileMenuOpen(false);
                                            }}
                                            className="w-full bg-white/90 text-[#1c398e] border border-blue-200 px-5 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold flex items-center justify-center gap-3"
                                        >
                                            <UserPlus className="w-5 h-5" />
                                            <span>Join as Recruiter</span>
                                        </motion.button>

                                        <motion.button
                                            variants={itemVariants}
                                            onClick={() => {
                                                window.location.href = '/auth/login';
                                                setMobileMenuOpen(false);
                                            }}
                                            className="w-full bg-white/90 text-[#1c398e] border border-blue-200 px-5 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold flex items-center justify-center gap-3"
                                        >
                                            <Upload className="w-5 h-5" />
                                            <span>Upload Resume</span>
                                        </motion.button>
                                    </>
                                ) : (
                                    <>
                                        {userRole ? (
                                            <motion.button
                                                variants={itemVariants}
                                                onClick={() => {
                                                    handleUserIconClick();
                                                    setMobileMenuOpen(false);
                                                }}
                                                className="w-full bg-gradient-to-r from-[#1c398e] to-[#3b82f6] text-white px-5 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold flex items-center justify-center gap-3"
                                                title={`Go to ${userRole} dashboard`}
                                            >
                                                <User className="w-5 h-5" />
                                                <span className="truncate">{localStorage.getItem("name")} Dashboard</span>
                                            </motion.button>
                                        ) : (
                                            <motion.button
                                                variants={itemVariants}
                                                onClick={() => {
                                                    window.location.href = "/recruiter-form";
                                                    setMobileMenuOpen(false);
                                                }}
                                                className="w-full bg-gradient-to-r from-[#1c398e] to-[#3b82f6] text-white px-5 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold flex items-center justify-center gap-3"
                                            >
                                                <UserPlus className="w-5 h-5" />
                                                <span>Submit Form</span>
                                            </motion.button>
                                        )}

                                        <motion.button
                                            variants={itemVariants}
                                            onClick={() => {
                                                localStorage.clear();
                                                window.location.href = "/";
                                                setMobileMenuOpen(false);
                                            }}
                                            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold flex items-center justify-center gap-3"
                                        >
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                                            </svg>
                                            <span>Logout</span>
                                        </motion.button>
                                    </>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.nav>
    );
};

const LoadingSkeleton = () => (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-blue-50 to-white">
        <Navigation isLoaded={false} />

        <section className="relative py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
                <div className="animate-pulse space-y-6">
                    <div className="h-16 bg-gradient-to-r from-gray-200 to-gray-100 rounded-2xl mx-auto w-3/4"></div>
                    <div className="h-8 bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl mx-auto w-1/2"></div>
                    <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/50 max-w-4xl mx-auto">
                        <div className="h-14 bg-gradient-to-r from-gray-100 to-gray-50 rounded-2xl"></div>
                    </div>
                </div>
            </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-100 rounded-xl w-1/4 mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white/90 rounded-3xl p-8 shadow-xl">
                                <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg w-3/4 mb-3"></div>
                                <div className="h-5 bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg w-1/2 mb-6"></div>
                                <div className="h-12 bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const HeroSection = ({ isLoaded, searchTerm, setSearchTerm }) => (
    <section className="relative py-16 lg:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-blue-50/30 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="space-y-8"
                >
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                        >
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-[#1c398e] leading-tight">
                                Welcome to{" "}
                                <span className="bg-gradient-to-r from-[#1c398e] via-[#2d4ba6] to-[#3b82f6] bg-clip-text text-transparent">
                                    ILS Job Portal
                                </span>
                            </h1>
                        </motion.div>
                        
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="text-lg sm:text-xl text-blue-600/90 max-w-xl leading-relaxed font-medium"
                        >
                            Discover thousands of job opportunities with leading companies. Start your career journey today.
                        </motion.p>
                    </div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                        className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 lg:p-8 shadow-2xl shadow-blue-500/10 border border-white/50 max-w-4xl"
                    >
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 relative group">
                                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5 transition-all duration-300 group-focus-within:text-[#1c398e]" />
                                <input
                                    type="text"
                                    placeholder="Job title, keywords..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-14 pr-5 py-4 text-[#1c398e] bg-white/90 border-2 border-blue-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1c398e]/20 focus:border-[#1c398e] transition-all duration-300 placeholder-blue-400/70 text-base font-medium shadow-sm hover:shadow-md"
                                />
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => window.scrollTo({
                                    top: window.scrollY + 500,
                                    behavior: 'smooth'
                                })}
                                className="bg-gradient-to-r from-[#1c398e] via-[#2d4ba6] to-[#3b82f6] text-white px-8 py-4 rounded-2xl hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 flex items-center justify-center space-x-2 font-semibold text-base relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-[#3b82f6] to-[#1c398e] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <span className="relative z-10">Search Jobs</span>
                                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                    className="relative order-first lg:order-last"
                >
                    <div className="relative">
                        <motion.div 
                            animate={{ 
                                y: [0, -15, 0],
                                rotate: [0, 5, 0]
                            }}
                            transition={{ 
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="absolute top-8 left-8 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl opacity-90 shadow-xl shadow-yellow-500/20 flex items-center justify-center"
                        >
                            <Star className="w-8 h-8 text-white" />
                        </motion.div>
                        
                        <motion.div 
                            animate={{ 
                                y: [0, 15, 0],
                                rotate: [0, -5, 0]
                            }}
                            transition={{ 
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 0.5
                            }}
                            className="absolute bottom-12 right-12 w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl opacity-80 shadow-xl shadow-purple-500/20 flex items-center justify-center"
                        >
                            <Briefcase className="w-7 h-7 text-white" />
                        </motion.div>
                        
                        <motion.div 
                            animate={{ 
                                y: [0, -20, 0],
                                x: [0, 10, 0]
                            }}
                            transition={{ 
                                duration: 3.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 1
                            }}
                            className="absolute top-1/3 -right-6 w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl opacity-70 shadow-xl shadow-green-500/20 flex items-center justify-center"
                        >
                            <Search className="w-6 h-6 text-white" />
                        </motion.div>

                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className="relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/20"
                        >
                            <img
                                src="/ils_image.svg"
                                alt="Professional team working together - Find your dream job"
                                className="w-full h-56 sm:h-72 lg:h-96 object-cover transition-all duration-500 hover:scale-105"
                                onError={(e) => {
                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMxYzM5OGU7c3RvcC1vcGFjaXR5OjAuMSIgLz4KPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojM2I4MmY2O3N0b3Atb3BhY2l0eTowLjIiIC8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiMxYzM5OGUiIGZvbnQtc2l6ZT0iMjQiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9ImJvbGQiPkpvYiBTZWVrZXIgSW1hZ2U8L3RleHQ+Cjwvc3ZnPgo=';
                                }}
                            />
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </div>
    </section>
);

const CategoryFilter = ({ categories, selectedCategory, setSelectedCategory, isLoaded }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-12 lg:mb-20"
    >
        <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-[#1c398e] to-[#3b82f6] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Search className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#1c398e] to-[#3b82f6] bg-clip-text text-transparent">
                Browse by Category
            </h2>
        </div>

        <div className="overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, staggerChildren: 0.1 }}
                className="flex lg:flex-wrap gap-3 min-w-max lg:min-w-0"
            >
                {categories.map((category, index) => (
                    <motion.button
                        key={category.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.4 }}
                        whileHover={{ scale: 1.05, y: -3 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`flex items-center space-x-2 px-6 py-3.5 rounded-2xl transition-all duration-300 whitespace-nowrap font-semibold ${
                            selectedCategory === category.id
                                ? 'bg-gradient-to-r from-[#1c398e] to-[#3b82f6] text-white shadow-xl shadow-blue-500/30'
                                : 'bg-white/90 text-blue-600 hover:bg-white border-2 border-blue-100 hover:border-blue-200 hover:shadow-lg'
                        }`}
                    >
                        <category.icon className="w-5 h-5" />
                        <span>{category.name}</span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            selectedCategory === category.id
                                ? 'bg-white/20 text-white'
                                : 'bg-blue-100 text-blue-600'
                        }`}>
                            {category.count}
                        </span>
                    </motion.button>
                ))}
            </motion.div>
        </div>

        <div className="lg:hidden text-center mt-3">
            <div className="text-xs text-blue-400 flex items-center justify-center space-x-1 font-medium">
                <span>Swipe to see more categories</span>
                <ArrowRight className="w-3 h-3" />
            </div>
        </div>
    </motion.div>
);

const JobCard = ({ job, index, featured = false }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
        whileHover={{ y: -8, scale: 1.02 }}
        className={`group bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-blue-500/10 border border-white/50 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:bg-white cursor-pointer ${
            isJobClosed(job) ? 'opacity-50 grayscale' : ''
        }`}
    >
        {featured && (
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                className="flex items-center justify-between mb-6"
            >
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-yellow-500/20">
                    <Star className="w-4 h-4" />
                    <span>FEATURED</span>
                </span>
            </motion.div>
        )}

        <div className="mb-6 space-y-3">
            <h3 className="text-xl font-bold text-[#1c398e] group-hover:text-blue-600 transition-colors leading-tight">
                {job.title}
            </h3>
            {job.location && (
                <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-blue-400" />
                    <span className="text-sm font-medium">{job.location}</span>
                </div>
            )}
            {job.jobType && (
                <div className="flex items-center text-gray-600">
                    <Briefcase className="w-4 h-4 mr-2 text-blue-400" />
                    <span className="text-sm font-medium">{job.jobType}</span>
                </div>
            )}
            {job.datePosted && (
                <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-blue-400" />
                    <span className="text-sm font-medium">Posted {formatDate(job.datePosted)}</span>
                </div>
            )}
            {job.jobStatus && (
                <div className="flex items-center text-gray-600">
                    <div className={`w-2 h-2 rounded-full mr-2 ${job.jobStatus === 'active' ? 'bg-green-400 shadow-lg shadow-green-400/50' : 'bg-red-400 shadow-lg shadow-red-400/50'}`}></div>
                    <span className={`text-sm font-semibold ${job.jobStatus === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                        {job.jobStatus === 'active' ? 'Active' : 'Closed'}
                    </span>
                </div>
            )}
        </div>

        {isJobClosed(job) ? (
            <div className="w-full bg-gray-400 text-white py-4 rounded-2xl font-semibold text-center cursor-not-allowed">
                Closed
            </div>
        ) : (
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.href = `/jobs-landing/${job._id}`}
                className="w-full bg-gradient-to-r from-[#1c398e] to-[#3b82f6] text-white py-4 rounded-2xl hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 font-semibold text-base"
            >
                See Details
            </motion.button>
        )}
    </motion.div>
);

const JobListCard = ({ job, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.4 }}
        whileHover={{ y: -4, scale: 1.005 }}
        className={`group bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-blue-500/10 border border-white/50 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:bg-white cursor-pointer ${
            isJobClosed(job) ? 'opacity-50 grayscale' : ''
        }`}
    >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1 space-y-4">
                <h3 className="text-2xl font-bold text-[#1c398e] group-hover:text-blue-600 transition-colors leading-tight">
                    {job.title}
                </h3>
                <div className="space-y-2">
                    {job.location && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 text-blue-400" />
                            <span className="font-medium">{job.location}</span>
                        </div>
                    )}
                    {job.jobType && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Briefcase className="w-4 h-4 text-blue-400" />
                            <span className="font-medium">Category: {job.jobType}</span>
                        </div>
                    )}
                    {job.datePosted && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3.5 h-3.5 text-blue-300" />
                            <span className="font-medium">Posted: {formatDate(job.datePosted)}</span>
                        </div>
                    )}
                    {job.jobStatus && (
                        <div className="flex items-center gap-2 text-sm">
                            <div className={`w-2 h-2 rounded-full ${job.jobStatus === 'active' ? 'bg-green-400 shadow-lg shadow-green-400/50' : 'bg-red-400 shadow-lg shadow-red-400/50'}`}></div>
                            <span className={`font-semibold ${job.jobStatus === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                                {job.jobStatus === 'active' ? 'Active' : 'Closed'}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center">
                {isJobClosed(job) ? (
                    <div className="bg-gray-400 text-white px-8 py-4 rounded-2xl font-semibold cursor-not-allowed">
                        Closed
                    </div>
                ) : (
                    <motion.button
                        whileHover={{ scale: 1.05, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => window.location.href = `/jobs-landing/${job._id}`}
                        className="bg-gradient-to-r from-[#1c398e] to-[#3b82f6] text-white px-8 py-4 rounded-2xl hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 font-semibold flex items-center space-x-2 text-base"
                    >
                        <span>See Details</span>
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </motion.button>
                )}
            </div>
        </div>
    </motion.div>
);

const ErrorState = ({ error, onRetry }) => (
    <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/90 backdrop-blur-xl rounded-3xl p-16 shadow-2xl shadow-blue-500/10 border border-white/50 text-center"
    >
        <div className="max-w-md mx-auto">
            <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-xl shadow-red-500/20"
            >
                <AlertCircle className="w-10 h-10 text-white" />
            </motion.div>
            <h3 className="text-3xl font-bold text-[#1c398e] mb-5">{error.title}</h3>
            <p className="text-blue-600 mb-10 leading-relaxed text-lg">{error.message}</p>
            <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={onRetry}
                className="bg-gradient-to-r from-[#1c398e] to-[#3b82f6] text-white px-8 py-4 rounded-2xl hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 font-semibold text-base"
            >
                Try Again
            </motion.button>
        </div>
    </motion.div>
);

const EmptyState = ({ onReset }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center py-20"
    >
        <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-28 h-28 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full mx-auto mb-8 flex items-center justify-center shadow-xl shadow-blue-500/20"
        >
            <Search className="w-12 h-12 text-[#1c398e]" />
        </motion.div>
        <h3 className="text-3xl font-bold text-[#1c398e] mb-5">No jobs found</h3>
        <p className="text-blue-600 mb-8 text-lg">Try adjusting your search criteria or browse all categories.</p>
        <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onReset}
            className="bg-gradient-to-r from-[#1c398e] to-[#3b82f6] text-white px-8 py-4 rounded-2xl hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 font-semibold text-base"
        >
            View All Jobs
        </motion.button>
    </motion.div>
);

const JobSeekersLanding = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const { jobs, loading, error, refetch } = useJobs();
    const [isCheckingRole, setIsCheckingRole] = useState(true);
    const {
        searchTerm,
        setSearchTerm,
        selectedCategory,
        setSelectedCategory,
        filteredJobs,
        resetFilters
    } = useFilters(jobs);

    useEffect(() => {
        const userRole = localStorage.getItem("userRole");
        if (userRole === "User") {
            window.location.href = "/user";
        } else if (userRole === "Recruiter") {
            window.location.href = "/recruiter"
        } else {
            setIsCheckingRole(false);
        }
    }, []);

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
    if (isCheckingRole) {
        return <LoadingSkeleton />
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-blue-50 to-white pb-20">
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
                    <motion.section 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="mb-20"
                    >
                        <div className="flex items-center space-x-3 mb-10">
                            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
                                <Star className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#1c398e] to-[#3b82f6] bg-clip-text text-transparent">
                                Featured Jobs
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {featuredJobs.slice(0, 3).map((job, index) => (
                                <JobCard key={job._id} job={job} index={index} featured />
                            ))}
                        </div>
                    </motion.section>
                )}

                <motion.section 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                >
                    {error ? (
                        <ErrorState error={error} onRetry={refetch} />
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-10">
                                <h2 className="text-2xl sm:text-3xl font-bold text-[#1c398e]">
                                    {selectedCategory === 'all'
                                        ? 'All Jobs'
                                        : `${categoriesWithCounts.find(c => c.id === selectedCategory)?.name} Jobs`
                                    }
                                    <span className="text-blue-600 font-normal ml-2">({filteredJobs.length} jobs)</span>
                                </h2>
                            </div>

                            {filteredJobs.length > 0 ? (
                                <div className="space-y-6">
                                    {filteredJobs.map((job, index) => (
                                        <JobListCard key={job._id} job={job} index={index} />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState onReset={resetFilters} />
                            )}
                        </>
                    )}
                </motion.section>
            </div>

            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};

export default JobSeekersLanding;