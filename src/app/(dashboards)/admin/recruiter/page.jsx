"use client";

import React, { useState, useEffect } from 'react';
import { Search, Filter, Building2, Mail, Phone, Calendar, MapPin, Users, Eye } from 'lucide-react';
import { getUserId } from '../../../utils'; 

const Page = () => {
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    // User authentication check
    const userId = getUserId();
    if (!userId) {
      // Redirect to login if no valid token
      window.location.href = '/auth/login';
      return;
    }

    const fetchRecruiters = async () => {
      try {
        setLoading(true);

        const response = await fetch('http://localhost:4441/api/Admin/');
        const data = await response.json();

        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        setRecruiters(data);
      } catch (error) {
        console.error('Error fetching recruiters:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecruiters();
  }, []);

  // Function to refresh recruiters data (call this after status changes)
  const refreshRecruiters = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4441/api/Admin/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache' // Prevent caching issues
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setRecruiters(data);
    } catch (error) {
      console.error('Error refreshing recruiters:', error);
      // Todo: show a toast notification here
    } finally {
      setLoading(false);
    }
  };

  const filteredRecruiters = recruiters
    .filter(recruiter => {

      const companyName = recruiter.companyName || '';
      const recruiterName = recruiter.userId?.name || '';
      const email = recruiter.companyEmail || '';

      const matchesSearch = companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recruiterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.toLowerCase().includes(searchTerm.toLowerCase());

      // Fixed: status field is applicationStatus in API response
      const status = recruiter.applicationStatus || 'pending';
      const matchesFilter = filterStatus === 'all' || status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.submittedAt) - new Date(a.submittedAt);
      if (sortBy === 'oldest') return new Date(a.submittedAt) - new Date(b.submittedAt);
      if (sortBy === 'company') return a.companyName.localeCompare(b.companyName);
      return 0;
    });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-blue-600 font-medium">Loading recruiters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="animate-fade-in">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Recruiter Management</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage and review recruiter registration requests
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 animate-slide-in w-full sm:w-auto">
              <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                <span className="text-sm text-blue-600 font-medium">
                  Total Requests: {recruiters.length}
                </span>
              </div>
              <button
                onClick={refreshRecruiters}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 w-full sm:w-auto"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-4 sm:p-6 mb-6 sm:mb-8 animate-fade-in-up">
          <div className="flex flex-col gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1c398e] w-5 h-5" />
              <input
                type="text"
                placeholder="Search by company, recruiter, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-[#1c398e] focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 sm:flex-none">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="appearance-none bg-white pl-10 pr-8 py-3 border border-gray-200 rounded-lg focus:ring-2 text-[#1c398e] focus:ring-blue-500 focus:border-transparent w-full sm:min-w-32"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 text-[#1c398e] focus:ring-blue-500 focus:border-transparent flex-1 sm:flex-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="company">Company Name</option>
              </select>
            </div>
          </div>
        </div>

        {/* Recruiters Grid */}
        {filteredRecruiters.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-8 sm:p-12 text-center">
            <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No recruiters found</h3>
            <p className="text-sm sm:text-base text-gray-500">Try adjusting your search criteria or filters.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
            {filteredRecruiters.map((recruiter, index) => (
              <div
                key={recruiter._id}
                className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden hover:shadow-lg hover:shadow-blue-100 transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="p-4 sm:p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4 gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                        {recruiter.companyName}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">{recruiter.userId?.name || 'Unknown'}</p>
                    </div>
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${(recruiter.applicationStatus || 'pending') === 'pending'
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      : (recruiter.applicationStatus || 'pending') === 'approved'
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                      {(recruiter.applicationStatus || 'pending').charAt(0).toUpperCase() + (recruiter.applicationStatus || 'pending').slice(1)}
                    </span>
                  </div>

                  {/* Company Info */}
                  <div className="space-y-2 sm:space-y-3 mb-4">
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-blue-500 flex-shrink-0" />
                      <span className="truncate">{recruiter.companyEmail}</span>
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-blue-500 flex-shrink-0" />
                      <span>{recruiter.phone}</span>
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-blue-500 flex-shrink-0" />
                      <span className="truncate">{recruiter.location}</span>
                    </div>
                    {recruiter.website && (
                      <div className="flex items-center text-xs sm:text-sm text-gray-600">
                        <Building2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-blue-500 flex-shrink-0" />
                        <span className="truncate">{recruiter.website}</span>
                      </div>
                    )}
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-blue-500 flex-shrink-0" />
                      <span>{formatDate(recruiter.submittedAt)}</span>
                    </div>
                  </div>

                  {/* Description */}
                  {recruiter.companyDetails && (
                    <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 line-clamp-2">
                      {recruiter.companyDetails}
                    </p>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={() => window.location.href = `/admin/recruiter/${recruiter._id}`}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2.5 sm:py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 text-sm"
                  >
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out both;
        }
        
        .animate-slide-in {
          animation: slide-in 0.6s ease-out;
        }
        
        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
        }
        
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        /* Mobile responsive improvements */
        @media (max-width: 640px) {
          .animate-fade-in-up {
            animation-delay: 0ms !important;
          }
        }
        
        /* Ensure proper text truncation on mobile */
        @media (max-width: 480px) {
          .line-clamp-2 {
            -webkit-line-clamp: 3;
          }
        }
      `}</style>
    </div>
  );
};

export default Page;