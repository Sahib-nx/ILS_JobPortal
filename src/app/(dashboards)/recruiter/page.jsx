"use client"

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Plus, Eye, Users, MapPin, Clock, Briefcase, Search,
  Calendar, CheckCircle, Loader2, User, Edit, Trash2, ArrowLeft
} from 'lucide-react';
import { getUserId } from '../../utils';
import { DeleteJobModal } from '@/app/components/delete-job-model';

const RecruiterDashboard = () => {
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
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, jobId: null, jobTitle: '' });



  useEffect(() => {
    const userId = localStorage.getItem("userId")
    // User authentication check
    if (!userId) {
      // Redirect to login if no valid token
      // window.location.href = '/auth/login';
      return;
    }
    console.log(userId)
  }, [])

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


      const jobStatus = job.jobStatus || job.status || 'active';
      const matchesFilter = filterType === 'all' || jobStatus === filterType;

      return matchesSearch && matchesFilter;
    });
  }, [jobs, searchTerm, filterType]);

  // stats calculation - Updated to use jobStatus
  const calculatedStats = useMemo(() => {
    const totalJobs = jobs.length;
    const totalApplications = jobs.reduce((sum, job) =>
      sum + (Array.isArray(job.applicants) ? job.applicants.length : 0), 0
    );
    // jobStatus field
    const activeJobs = jobs.filter(job =>
      (job.jobStatus || job.status || 'active') === 'active'
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


  // Function to redirect to login page
  const redirectToLogin = () => {
    // Clear any stored tokens
    localStorage.clear();

    // Redirect to login page 
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  };


  // Fetch admin data with better error handling
  const fetchRecruiterData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const userId = getUserId();
      if (!userId) {
        // setAuthError("User not authenticated")
        // console.log('User not authenticated');
        setError("UserId Not Found!")
      }

      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        // throw new Error('No authentication token found');
        setError("No authentication token found")
      }

      const jobsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/job/`, {
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

      const contentType = jobsResponse.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
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
      } else {
        throw new Error('Server returned invalid response format');
      }

    } catch (error) {
      console.error('Error fetching admin data:', error);
      setError(error.message);

      // // Handle authentication errors
      // if (error.message.includes('Authentication') || error.message.includes('User not authenticated')) {
      //   // Redirect to login after a delay
      //   setTimeout(() => {
      //     window.location.href = '/auth/login';
      //   }, 2000);
      // }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecruiterData();
  }, [fetchRecruiterData]);

  // Handle job deletion
  const handleDeleteSuccess = (deletedJobId) => {
    setJobs(prevJobs => prevJobs.filter(job => job._id !== deletedJobId));
  };

  // Handle edit navigation
  const handleEditJob = (jobId) => {
    window.location.href = `/recruiter/jobs/${jobId}/edit`;
  };

  // Handle delete modal
  const handleDeleteClick = (job) => {
    setDeleteModal({
      isOpen: true,
      jobId: job._id,
      jobTitle: job.title || 'Untitled Job'
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, jobId: null, jobTitle: '' });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#dbeafe] via-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#1c398e] animate-spin mx-auto mb-4" />
          <p className="text-blue-600 font-medium">Loading recruiter dashboard...</p>
        </div>
      </div>
    );
  }

  // Authentication error state
  if (error || localStorage.getItem("userRole") !== "Recruiter") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md mx-4">
          <div className="mb-4">
            <User className="h-12 w-12 text-red-600 mx-auto" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            {error || 'You need to be logged in as a recruiter to access this dashboard.'}
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
    <>
      <DeleteJobModal />
      <div className="min-h-screen bg-gradient-to-br from-[#dbeafe] via-blue-50 to-white">
        {/* Header - Responsive */}
        <header className="bg-white/90 backdrop-blur-lg border-b border-blue-100 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 gap-4">
              <div className="flex items-center space-x-3 flex-shrink-0">
                <button
                  onClick={() => window.location.href = "/"}
                  className="p-1 sm:p-3 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                </button>
                <div className="w-10 h-10 bg-gradient-to-br from-[#1c398e] to-[#3b82f6] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  ILS
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-[#1c398e]">Welcome {localStorage.getItem("name")}</h1>
                  <p className="text-xs text-blue-600">{localStorage.getItem("userRole")}</p>
                </div>
              </div>

              <button
                onClick={() => window.location.href = '/recruiter/jobs/create'}
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

          {/* Search and Filters - Responsive - Updated filter buttons */}
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
                {[
                  { key: 'all', label: 'All Jobs', count: jobs.length },
                  { key: 'active', label: 'Active', count: jobs.filter(job => (job.jobStatus || job.status || 'active') === 'active').length },
                  { key: 'closed', label: 'Closed', count: jobs.filter(job => (job.jobStatus || job.status || 'active') === 'closed').length }
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setFilterType(filter.key)}
                    className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition-all duration-300 font-medium text-sm sm:text-base flex items-center space-x-2 ${filterType === filter.key
                      ? 'bg-gradient-to-r from-[#1c398e] to-[#3b82f6] text-white shadow-lg'
                      : 'bg-white border border-blue-200 text-blue-600 hover:bg-blue-50'
                      }`}
                  >
                    <span>{filter.label}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${filterType === filter.key
                      ? 'bg-white/20 text-white'
                      : 'bg-blue-100 text-blue-600'
                      }`}>
                      {filter.count}
                    </span>
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
                        {/* Updated to use jobStatus field */}
                        <span className={`px-3 py-1 rounded-full text-xs font-bold self-start ${(job.jobStatus || job.status || 'active') === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                          }`}>
                          {(job.jobStatus || job.status || 'active').toUpperCase()}
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

                      <div className="flex items-center space-x-2">
                        {/* Edit Button */}
                        <button
                          onClick={() => handleEditJob(job._id || job.id)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-lg transition-all duration-300 flex items-center justify-center"
                          title="Edit Job"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteClick(job)}
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-all duration-300 flex items-center justify-center"
                          title="Delete Job"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        {/* View Applications Button */}
                        <button
                          onClick={() => window.location.href = `/recruiter/jobs/${job._id || job.id}`}
                          className="bg-gradient-to-r from-[#1c398e] to-[#3b82f6] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:shadow-lg transition-all duration-300 font-semibold flex items-center space-x-2 text-sm sm:text-base"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">View Applications</span>
                          <span className="sm:hidden">View</span>
                        </button>
                      </div>
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
                  onClick={() => window.location.href = '/recruiter/jobs/create'}
                  className="bg-gradient-to-r from-[#1c398e] to-[#3b82f6] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 font-semibold"
                >
                  Post Your First Job
                </button>
              </div>
            )}
          </div>
        </main>

        {/* Delete Job Modal */}
        <DeleteJobModal
          isOpen={deleteModal.isOpen}
          onClose={closeDeleteModal}
          jobId={deleteModal.jobId}
          jobTitle={deleteModal.jobTitle}
          onDeleteSuccess={handleDeleteSuccess}
        />
      </div>
    </>
  );
};


export default RecruiterDashboard;