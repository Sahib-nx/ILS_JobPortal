"use client"

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Plus, Eye, Users, MapPin, Clock, Briefcase, Search,
  Calendar, CheckCircle, Loader2, AlertCircle
} from 'lucide-react';
import { getUserId } from '../../utils';

const AdminJobsDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    pendingReviews: 0,
    activeJobs: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Memoized filtered jobs for performance
  const filteredJobs = useMemo(() => {
    if (!jobs.length) return [];
    
    return jobs.filter(job => {
      // More robust search matching
      const searchFields = [
        job.title,
        job.description, 
        job.company,
        job.location
      ].filter(Boolean).join(' ').toLowerCase();
      
      const matchesSearch = !searchTerm || searchFields.includes(searchTerm.toLowerCase());
      const jobStatus = job.status || 'active';
      const matchesFilter = filterType === 'all' || jobStatus === filterType;
      
      return matchesSearch && matchesFilter;
    });
  }, [jobs, searchTerm, filterType]);

  // Optimized stats calculation
  const calculatedStats = useMemo(() => {
    const totalJobs = jobs.length;
    const totalApplications = jobs.reduce((sum, job) => 
      sum + (Array.isArray(job.applicants) ? job.applicants.length : 0), 0
    );
    const activeJobs = jobs.filter(job => 
      (job.status || 'active') === 'active'
    ).length;
    const pendingReviews = jobs.reduce((sum, job) => {
      if (!Array.isArray(job.applicants)) return sum;
      return sum + job.applicants.filter(app => 
        (app.status || 'pending') === 'pending'
      ).length;
    }, 0);

    return {
      totalJobs,
      totalApplications,
      pendingReviews,
      activeJobs
    };
  }, [jobs]);

  // Update stats when calculated stats change
  useEffect(() => {
    setStats(calculatedStats);
  }, [calculatedStats]);

  // Fetch admin data with better error handling
  const fetchAdminData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('No authentication token found');
      }

      const jobsResponse = await fetch('http://localhost:4441/api/job/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!jobsResponse.ok) {
        if (jobsResponse.status === 401 || jobsResponse.status === 403) {
          throw new Error('Authentication failed');
        }
        throw new Error(`Failed to fetch jobs: ${jobsResponse.status}`);
      }

      const jobsData = await jobsResponse.json();
      
      // Ensure jobsData is an array
      const jobsArray = Array.isArray(jobsData) ? jobsData : 
                       (jobsData.data && Array.isArray(jobsData.data)) ? jobsData.data :
                       (jobsData.jobs && Array.isArray(jobsData.jobs)) ? jobsData.jobs : [];

      console.log('Fetched jobs:', jobsArray); // Debug log

      // Filter jobs by current user with more flexible matching
      const userJobs = jobsArray.filter(job => {
        const jobPosterId = job.postedBy?._id || job.postedBy || job.userId || job.createdBy;
        return jobPosterId === userId;
      });

      console.log('User jobs after filtering:', userJobs); // Debug log

      // Sort jobs by creation date
      const sortedJobs = userJobs.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.datePosted || a.created_at);
        const dateB = new Date(b.createdAt || b.datePosted || b.created_at);
        return dateB - dateA;
      });

      setJobs(sortedJobs);

    } catch (error) {
      console.error('Error fetching admin data:', error);
      setError(error.message);
      
      // Handle authentication errors
      if (error.message.includes('Authentication') || error.message.includes('User not authenticated')) {
        // Redirect to login after a delay
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 2000);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#dbeafe] via-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#1c398e] animate-spin mx-auto mb-4" />
          <p className="text-blue-600 font-medium">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#dbeafe] via-blue-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Dashboard</h2>
          <p className="text-red-500 mb-6">{error}</p>
          <button 
            onClick={fetchAdminData}
            className="bg-gradient-to-r from-[#1c398e] to-[#3b82f6] text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all duration-300 font-semibold"
          >
            Try Again
          </button>
          {error.includes('Authentication') && (
            <p className="text-sm text-gray-600 mt-4">Redirecting to login...</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#dbeafe] via-blue-50 to-white">
      {/* Header - Responsive */}
      <header className="bg-white/90 backdrop-blur-lg border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center space-x-3 flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-[#1c398e] to-[#3b82f6] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                ILS
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-[#1c398e]">Admin Panel</h1>
                <p className="text-xs text-blue-600">Job Management</p>
              </div>
            </div>

            <button
              onClick={() => window.location.href = '/admin/jobs/create'}
              className="bg-gradient-to-r from-[#1c398e] to-[#3b82f6] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105 font-semibold flex items-center space-x-2 text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Post New Job</span>
              <span className="sm:hidden">Post</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Stats Cards - Responsive Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          {[
            { label: 'Total Jobs', value: stats.totalJobs, icon: Briefcase, color: 'from-blue-500 to-blue-600' },
            { label: 'Applications', value: stats.totalApplications, icon: Users, color: 'from-green-500 to-green-600' },
            { label: 'Pending Reviews', value: stats.pendingReviews, icon: Clock, color: 'from-yellow-500 to-yellow-600' },
            { label: 'Active Jobs', value: stats.activeJobs, icon: CheckCircle, color: 'from-purple-500 to-purple-600' }
          ].map((stat) => (
            <div key={stat.label} className="bg-white/80 backdrop-blur-lg p-3 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 font-medium truncate">{stat.label}</p>
                  <p className="text-xl sm:text-3xl font-bold text-[#1c398e]">{stat.value}</p>
                </div>
                <div className={`w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br ${stat.color} rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <stat.icon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filters - Responsive */}
        <div className="bg-white/80 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-lg border border-white/50">
          <div className="flex flex-col gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/80 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1c398e] focus:border-transparent transition-all duration-300 text-[#1c398e]"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {['all', 'active', 'closed'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFilterType(filter)}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition-all duration-300 font-medium text-sm sm:text-base ${
                    filterType === filter
                      ? 'bg-gradient-to-r from-[#1c398e] to-[#3b82f6] text-white shadow-lg'
                      : 'bg-white border border-blue-200 text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Jobs List - Responsive */}
        <div className="bg-white/80 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-lg border border-white/50">
          <div className="p-4 sm:p-6 border-b border-blue-100">
            <h2 className="text-xl sm:text-2xl font-bold text-[#1c398e]">Your Job Posts</h2>
            <p className="text-blue-600 text-sm sm:text-base">Manage and track your job postings</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Showing {filteredJobs.length} of {jobs.length} jobs
            </p>
          </div>

          <div className="divide-y divide-blue-100">
            {filteredJobs.map((job) => (
              <div key={job._id || job.id} className="p-4 sm:p-6 hover:bg-blue-50/50 transition-all duration-300 group">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                      <h3 className="text-lg sm:text-xl font-bold text-[#1c398e] group-hover:text-blue-600 transition-colors truncate">
                        {job.title || 'Untitled Job'}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold self-start ${
                        (job.status || 'active') === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {(job.status || 'active').toUpperCase()}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-600">
                      <div className="flex items-center min-w-0">
                        <MapPin className="w-4 h-4 mr-1 text-blue-400 flex-shrink-0" />
                        <span className="truncate">{job.location || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center">
                        <Briefcase className="w-4 h-4 mr-1 text-blue-400 flex-shrink-0" />
                        <span>{job.jobType || job.type || 'Full-time'}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1 text-blue-400 flex-shrink-0" />
                        <span>{new Date(job.createdAt || job.datePosted || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:justify-end gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-2 bg-gradient-to-r from-[#dbeafe] to-blue-100 px-3 sm:px-4 py-2 rounded-lg">
                        <Users className="w-4 h-4 text-[#1c398e]" />
                        <span className="font-bold text-[#1c398e]">
                          {Array.isArray(job.applicants) ? job.applicants.length : 0}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Applications</p>
                    </div>

                    <button
                      onClick={() => window.location.href = `/admin/jobs/${job._id || job.id}`}
                      className="bg-gradient-to-r from-[#1c398e] to-[#3b82f6] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:shadow-lg transition-all duration-300 font-semibold flex items-center space-x-2 text-sm sm:text-base"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">View Applications</span>
                      <span className="sm:hidden">View</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredJobs.length === 0 && (
            <div className="p-8 sm:p-12 text-center">
              <Briefcase className="w-12 sm:w-16 h-12 sm:h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-500 mb-2">No jobs found</h3>
              <p className="text-sm sm:text-base text-gray-400 mb-6 max-w-md mx-auto">
                {searchTerm || filterType !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Create your first job posting to get started'
                }
              </p>
              <button
                onClick={() => window.location.href = '/admin/jobs/create'}
                className="bg-gradient-to-r from-[#1c398e] to-[#3b82f6] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 font-semibold"
              >
                Post Your First Job
              </button>
            </div>
          )}

          {/* Debug Info (Remove in production) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="p-4 border-t border-blue-100 bg-gray-50">
              <details className="text-xs text-gray-600">
                <summary className="cursor-pointer font-semibold">Debug Info</summary>
                <div className="mt-2 space-y-1">
                  <p>Total jobs fetched: {jobs.length}</p>
                  <p>Filtered jobs: {filteredJobs.length}</p>
                  <p>Current user ID: {getUserId()}</p>
                  <p>Search term: "{searchTerm}"</p>
                  <p>Filter type: {filterType}</p>
                </div>
              </details>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminJobsDashboard;