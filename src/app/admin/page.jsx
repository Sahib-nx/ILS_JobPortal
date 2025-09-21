"use client"

import React, { useState, useEffect } from 'react';
import {
  Plus, Eye, Users, MapPin, Clock, Briefcase, Search,
  Calendar,
  CheckCircle, Loader2
} from 'lucide-react';

const Page = () => {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    pendingReviews: 0,
    activeJobs: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // User authentication check
  const getUserId = () => {
    const token = localStorage.getItem('authToken');
    if (!token) return null;

    try {
      const payloadBase64 = token.split('.')[1]; // JWT payload
      const decoded = JSON.parse(atob(payloadBase64));
      console.log('Decoded JWT:', decoded.UserId);
      return decoded.UserId;
    } catch (err) {
      console.error('Invalid token', err);
      return null;
    }
  };

  // Fetch admin jobs and statistics with API integration
  useEffect(() => {
    const fetchAdminData = async () => {
      setIsLoading(true);
      try {
        // User authentication check
        const userId = getUserId();
        if (!userId) {
          // Redirect to login if no valid token
          window.location.href = '/auth/login';
          return;
        }

        // API call to fetch all jobs
        const jobsResponse = await fetch('http://localhost:4441/api/job/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!jobsResponse.ok) {
          throw new Error(`HTTP error! status: ${jobsResponse.status}`);
        }

        const jobsData = await jobsResponse.json();

        // Job filtering - Only show jobs posted by current user
        const userJobs = jobsData.filter(job => 
          job.postedBy === userId || job.postedBy._id === userId
        );

        setJobs(userJobs);

        // Dynamic statistics calculation
        const totalJobs = userJobs.length;
        const totalApplications = userJobs.reduce((sum, job) => 
          sum + (job.applicants?.length || 0), 0
        );
        const activeJobs = userJobs.filter(job => 
          job.status === 'active' || !job.status
        ).length;
        const pendingReviews = userJobs.reduce((sum, job) => 
          sum + (job.applicants?.filter(app => app.status === 'pending')?.length || 0), 0
        );

        setStats({
          totalJobs,
          totalApplications,
          pendingReviews,
          activeJobs
        });

      } catch (error) {
        console.error('Error fetching admin data:', error);
        
        // If unauthorized, redirect to login
        if (error.message.includes('401') || error.message.includes('403')) {
          window.location.href = '/auth/login';
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || job.status === filterType;
    return matchesSearch && matchesFilter;
  });

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#dbeafe] via-blue-50 to-white">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#1c398e] to-[#3b82f6] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                ILS
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#1c398e]">Admin Panel</h1>
                <p className="text-xs text-blue-600">Job Management</p>
              </div>
            </div>

            <button
              onClick={() => window.location.href = '/admin/jobs/create'}
              className="bg-gradient-to-r from-[#1c398e] to-[#3b82f6] text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105 font-semibold flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Post New Job</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Jobs', value: stats.totalJobs, icon: Briefcase, color: 'from-blue-500 to-blue-600' },
            { label: 'Applications', value: stats.totalApplications, icon: Users, color: 'from-green-500 to-green-600' },
            { label: 'Pending Reviews', value: stats.pendingReviews, icon: Clock, color: 'from-yellow-500 to-yellow-600' },
            { label: 'Active Jobs', value: stats.activeJobs, icon: CheckCircle, color: 'from-purple-500 to-purple-600' }
          ].map((stat, index) => (
            <div key={stat.label} className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-[#1c398e]">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 mb-8 shadow-lg border border-white/50">
          <div className="flex flex-col md:flex-row gap-4">
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

            <div className="flex gap-2">
              {['all', 'active', 'closed'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFilterType(filter)}
                  className={`px-6 py-3 rounded-xl transition-all duration-300 font-medium ${filterType === filter
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

        {/* Jobs List */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/50">
          <div className="p-6 border-b border-blue-100">
            <h2 className="text-2xl font-bold text-[#1c398e]">Your Job Posts</h2>
            <p className="text-blue-600">Manage and track your job postings</p>
          </div>

          <div className="divide-y divide-blue-100">
            {filteredJobs.map((job, index) => (
              <div key={job._id} className="p-6 hover:bg-blue-50/50 transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <h3 className="text-xl font-bold text-[#1c398e] group-hover:text-blue-600 transition-colors">
                        {job.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${job.status === 'active' || !job.status
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                        }`}>
                        {(job.status || 'active').toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-blue-400" />
                        {job.location || 'Not specified'}
                      </div>
                      <div className="flex items-center">
                        <Briefcase className="w-4 h-4 mr-1 text-blue-400" />
                        {job.jobType || job.type || 'Full-time'}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1 text-blue-400" />
                        {new Date(job.createdAt || job.datePosted).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-2 bg-gradient-to-r from-[#dbeafe] to-blue-100 px-4 py-2 rounded-lg">
                        <Users className="w-4 h-4 text-[#1c398e]" />
                        <span className="font-bold text-[#1c398e]">{job.applicants?.length || 0}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Applications</p>
                    </div>

                    <button
                      onClick={() => window.location.href = `/admin/jobs/${job._id}`}
                      className="bg-gradient-to-r from-[#1c398e] to-[#3b82f6] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 font-semibold flex items-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Applications</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <div className="p-12 text-center">
              <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-500 mb-2">No jobs found</h3>
              <p className="text-gray-400 mb-6">
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
        </div>
      </main>
    </div>
  );
};

export default Page;