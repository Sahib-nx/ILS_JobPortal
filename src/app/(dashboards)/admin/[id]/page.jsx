"use client";

import React, { useState, useEffect } from 'react';
import { Building2, Mail, Calendar, FileText, CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';
import { useParams } from 'next/navigation';
import { getUserId } from '@/app/utils';

const Page = () => {
  const [recruiter, setRecruiter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionCompleted, setActionCompleted] = useState(false);
  const [error, setError] = useState(null);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  const params = useParams()
  const recruiterId = params.id;

  // Fetch recruiter data from API
  useEffect(() => {
    // User authentication check
    const userId = getUserId();
    if (!userId) {
      window.location.href = '/auth/login';
      return;
    }

    const fetchRecruiter = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/Admin/${recruiterId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        if (!response.ok) {
          if (error.message.includes('401') || error.message.includes('403')) {
            throw new Error('Please logout and login again, Token Expired! ');
          }
        }

        const data = await response.json();
        setRecruiter(data);
      } catch (error) {
        console.error('Error fetching recruiter:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (recruiterId) {
      fetchRecruiter();
    }
  }, [recruiterId]);

  const handleStatusChange = async (status) => {
    setActionLoading(status); // Set to the specific action being performed

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/Admin/status/${recruiterId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update status');
      }

      // Update local state
      setRecruiter(prev => ({
        ...prev,
        applicationStatus: status,
        isVerified: status === 'approved',
        verifiedAt: status === 'approved' ? new Date().toISOString() : prev.verifiedAt
      }));

      setActionCompleted(true);
      setTimeout(() => setActionCompleted(false), 5000);

    } catch (error) {
      console.error('Error updating status:', error);
      setError(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'approved':
        return {
          color: 'text-green-700',
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: CheckCircle,
          text: 'Approved'
        };
      case 'rejected':
        return {
          color: 'text-red-700',
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: XCircle,
          text: 'Rejected'
        };
      default:
        return {
          color: 'text-yellow-700',
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: Clock,
          text: 'Pending'
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-700">Loading Recruiter Details</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Unable to Load Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!recruiter) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Recruiter Not Found</h2>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(recruiter.applicationStatus);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => window.location.href = '/admin'}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>

        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Company Info */}
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                  {recruiter.companyName || 'Company Name'}
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{recruiter.companyEmail || 'Email not provided'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      Applied {recruiter.submittedAt ? new Date(recruiter.submittedAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${statusConfig.bg} ${statusConfig.border} border self-start`}>
              <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
              <span className={`font-semibold ${statusConfig.color}`}>{statusConfig.text}</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Mail className="w-5 h-5 text-blue-600 mr-2" />
                Contact Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email</p>
                    <p className="text-gray-800 font-medium break-all">{recruiter.companyEmail || 'Not provided'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Phone</p>
                    <p className="text-gray-800 font-medium">{recruiter.phone || 'Not provided'}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Location</p>
                    <p className="text-gray-800 font-medium">{recruiter.location || 'Not provided'}</p>
                  </div>
                  {recruiter.website && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Website</p>
                      <a
                        href={`https://${recruiter.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-medium break-all"
                      >
                        {recruiter.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Company Details */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Building2 className="w-5 h-5 text-purple-600 mr-2" />
                Company Details
              </h2>

              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm font-semibold text-blue-800 mb-2">Company Name</p>
                  <p className="text-gray-800 font-bold text-lg">{recruiter.companyName || 'Not specified'}</p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <p className="text-sm font-semibold text-green-800 mb-2">Location</p>
                  <p className="text-gray-800 font-bold">{recruiter.location || 'Not specified'}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">About Company</p>
                  <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-purple-500">
                    <p className="text-gray-700 leading-relaxed">
                      {recruiter.companyDetails || 'No details provided.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Actions & Info */}
          <div className="space-y-6">
            {/* Action Panel */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <FileText className="w-5 h-5 text-green-600 mr-2" />
                Application Review
              </h2>

              {recruiter.applicationStatus === 'pending' && !actionCompleted ? (
                <div className="space-y-4">
                  <button
                    onClick={() => handleStatusChange('approved')}
                    disabled={actionLoading}
                    className={`w-full font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 ${actionLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                      } text-white`}
                  >
                    {actionLoading && actionLoading === 'approved' ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Approving...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span>Approve Application</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleStatusChange('rejected')}
                    disabled={actionLoading}
                    className={`w-full font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 ${actionLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700'
                      } text-white`}
                  >
                    {actionLoading && actionLoading === 'rejected' ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Rejecting...</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5" />
                        <span>Reject Application</span>
                      </>
                    )}
                  </button>

                  {actionLoading && (
                    <div className="text-center py-2">
                      <p className="text-sm text-blue-600">Processing request and sending email...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${statusConfig.bg} border-2 ${statusConfig.border} mb-4`}>
                    <StatusIcon className={`w-8 h-8 ${statusConfig.color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    Application {statusConfig.text}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {recruiter.applicationStatus === 'approved'
                      ? 'Email notification sent. Recruiter can now access their dashboard.'
                      : recruiter.applicationStatus === 'rejected'
                        ? 'Application declined with email notification sent.'
                        : 'Application pending review.'
                    }
                  </p>

                  {actionCompleted && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-700 font-semibold text-sm">Status updated successfully!</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Application Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Application Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 text-sm">Application ID</span>
                  <span className="font-mono text-gray-800 text-xs bg-white px-2 py-1 rounded border">
                    {recruiter._id ? `...${recruiter._id.slice(-8)}` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 text-sm">Submitted</span>
                  <span className="text-gray-800 text-sm font-medium">
                    {recruiter.submittedAt ? new Date(recruiter.submittedAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 text-sm">Status</span>
                  <span className={`text-sm font-medium px-2 py-1 rounded capitalize ${recruiter.applicationStatus === 'approved' ? 'text-green-700 bg-green-100' :
                    recruiter.applicationStatus === 'rejected' ? 'text-red-700 bg-red-100' :
                      'text-yellow-700 bg-yellow-100'
                    }`}>
                    {recruiter.applicationStatus || 'Pending'}
                  </span>
                </div>
                {recruiter.verifiedAt && (
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 text-sm">Verified Date</span>
                    <span className="text-gray-800 text-sm font-medium">
                      {new Date(recruiter.verifiedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;