"use client"

import React, { useState, useEffect } from 'react';
import {
  Eye, Users, MapPin, Briefcase, Search,
  Calendar, Mail, Phone, Download, ArrowLeft,
  Loader2, X, CheckCircle, UserCheck, UserPlus
} from 'lucide-react';
import { useParams } from 'next/navigation';

const Page = () => {
  const [jobData, setJobData] = useState(null);
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingActions, setLoadingActions] = useState({}); // Track loading states for buttons
  const [selectedResume, setSelectedResume] = useState(null); // For resume preview
  const [resumeViewerError, setResumeViewerError] = useState(false);

  const params = useParams();
  const jobId = params.id;

  // Fetch job applications
  useEffect(() => {
    const fetchJobApplications = async () => {
      setIsLoading(true);
      try {
        const userId = localStorage.getItem("userId");

        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/job/${jobId}/applications?userId=${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setJobData(data.job);
          setApplications(data.applications);
        } else {
          console.error('Failed to fetch job applications');
        }

      } catch (error) {
        console.error('Error fetching job applications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (jobId) {
      fetchJobApplications();
    }
  }, [jobId]);


  // Handle status progression
  const handleStatusAction = async (applicationId, applicantId, currentStatus) => {
    const actionKey = `${applicationId}-${currentStatus}`;
    setLoadingActions(prev => ({ ...prev, [actionKey]: true }));

    try {
      let endpoint = '';
      let newStatus = '';

      switch (currentStatus) {
        case 'pending':
          endpoint = `${process.env.NEXT_PUBLIC_BASE_URL}/api/email/${jobId}/${applicantId}`;
          newStatus = 'shortlisted';
          break;
        case 'shortlisted':
          endpoint = `${process.env.NEXT_PUBLIC_BASE_URL}/api/email/Hired/${jobId}/${applicantId}`;
          newStatus = 'hired';
          break;
        case 'hired':
          // For joined, we just update the frontend status
          newStatus = 'joined';
          break;
      }

      if (currentStatus !== 'hired') {
        // Call the API for shortlisted and hired
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to update status to ${newStatus}`);
        }
      }

      // Update the applications state
      setApplications(prev => prev.map(app =>
        app._id === applicationId
          ? { ...app, status: newStatus }
          : app
      ));

    } catch (error) {
      console.error(`Error updating status:`, error);
      alert(`Failed to update status. Please try again.`);
    } finally {
      setLoadingActions(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  // Get button configuration based on status
  const getButtonConfig = (status) => {
    switch (status) {
      case 'pending':
        return {
          text: 'Shortlist',
          icon: CheckCircle,
          className: 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600',
          disabled: false
        };
      case 'shortlisted':
        return {
          text: 'Hire',
          icon: UserCheck,
          className: 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600',
          disabled: false
        };
      case 'hired':
        return {
          text: 'Mark Joined',
          icon: UserPlus,
          className: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600',
          disabled: false
        };
      case 'joined':
        return {
          text: 'Joined',
          icon: CheckCircle,
          className: 'bg-gray-400 cursor-not-allowed',
          disabled: true
        };
      default:
        return {
          text: 'Shortlist',
          icon: CheckCircle,
          className: 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600',
          disabled: false
        };
    }
  };

  // Handle resume preview
  const handleResumePreview = (resumeUrl) => {
    setResumeViewerError(false);
    setSelectedResume(resumeUrl);
  };

  // Get Cloudinary URL for different preview formats
  const getCloudinaryPreviewUrl = (originalUrl) => {
    if (!originalUrl) return originalUrl;

    // Check if it's a Cloudinary URL
    if (originalUrl.includes('cloudinary.com')) {
      // For PDF files, we can add transformations to make them viewable
      // Transform PDF to image pages for preview
      if (originalUrl.includes('.pdf')) {
        // Convert PDF to JPG for preview (first page)
        return originalUrl.replace('/upload/', '/upload/f_jpg,q_auto/');
      }
      // For image files, optimize for web viewing
      return originalUrl.replace('/upload/', '/upload/f_auto,q_auto,w_800/');
    }

    return originalUrl;
  };

  // Get original Cloudinary URL for download
  const getOriginalUrl = (url) => {
    if (!url) return url;
    // Remove any transformations to get original file
    return url.replace(/\/upload\/[^\/]+\//, '/upload/');
  };

  const filteredApplications = applications.filter(app =>
    app.applicantId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.applicantId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#dbeafe] via-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#1c398e] animate-spin mx-auto mb-4" />
          <p className="text-blue-600 font-medium">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#dbeafe] via-blue-50 to-white">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.href = '/recruiter'}
                className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-[#1c398e]" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-[#1c398e]">{jobData?.title || 'Job Applications'}</h1>
                <p className="text-xs text-blue-600">{applications.length} applications received</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Job Info Card */}
        {jobData && (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 mb-8 shadow-lg border border-white/50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#1c398e] mb-2">{jobData.title}</h2>
                <div className="flex items-center space-x-6 text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1 text-blue-400" />
                    {jobData.location}
                  </div>
                  <div className="flex items-center">
                    <Briefcase className="w-4 h-4 mr-1 text-blue-400" />
                    {jobData.jobType}
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-gradient-to-r from-[#1c398e] to-[#3b82f6] text-white px-6 py-3 rounded-lg">
                  <div className="text-2xl font-bold">{applications.length}</div>
                  <div className="text-sm">Applications</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 mb-8 shadow-lg border border-white/50 text-[#1c398e]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search applications by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/80 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1c398e] focus:border-transparent transition-all duration-300"
            />
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/50">
          <div className="divide-y divide-blue-100">
            {filteredApplications.map((application, index) => {
              const buttonConfig = getButtonConfig(application.status || 'pending');
              const actionKey = `${application._id}-${application.status || 'pending'}`;
              const isActionLoading = loadingActions[actionKey];
              const ButtonIcon = buttonConfig.icon;

              return (
                <div key={application._id || index} className="p-6 hover:bg-blue-50/50 transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#1c398e] to-[#3b82f6] rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {application.applicantId?.name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-[#1c398e]">
                            {application.applicantId?.name || 'Anonymous Applicant'}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 mr-1 text-blue-400" />
                              {application.applicantId?.email || 'No email'}
                            </div>
                            {application.applicantId?.phone && (
                              <div className="flex items-center">
                                <Phone className="w-4 h-4 mr-1 text-blue-400" />
                                {application.applicantId.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Application Details */}
                      {application.experience && (
                        <div className="mb-3">
                          <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                            Experience: {application.experience}
                          </span>
                        </div>
                      )}

                      {application.coverLetter && (
                        <div className="mb-3">
                          <p className="text-gray-700 text-sm line-clamp-2">
                            <strong>Cover Letter:</strong> {application.coverLetter}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          Applied {application.appliedDate ? new Date(application.appliedDate).toLocaleDateString() :
                            application.createdAt ? new Date(application.createdAt).toLocaleDateString() : 'Recently'}
                        </div>
                        {application.status && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${application.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              application.status === 'shortlisted' ? 'bg-blue-100 text-blue-700' :
                                application.status === 'hired' ? 'bg-purple-100 text-purple-700' :
                                  application.status === 'joined' ? 'bg-green-100 text-green-700' :
                                    'bg-gray-100 text-gray-700'
                            }`}>
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 ml-6">
                      {application.resume && (
                        <button
                          onClick={() => handleResumePreview(application.resume)}
                          className="bg-blue-100 text-[#1c398e] px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center space-x-2 text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Resume</span>
                        </button>
                      )}

                      <button
                        onClick={() => !buttonConfig.disabled && !isActionLoading && handleStatusAction(
                          application._id,
                          application.applicantId?._id,
                          application.status || 'pending'
                        )}
                        disabled={buttonConfig.disabled || isActionLoading}
                        className={`${buttonConfig.className} text-white px-4 py-2 rounded-lg transition-all duration-300 font-medium flex items-center space-x-2 text-sm ${!buttonConfig.disabled && !isActionLoading ? 'hover:shadow-lg transform hover:-translate-y-0.5' : ''
                          }`}
                      >
                        {isActionLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ButtonIcon className="w-4 h-4" />
                        )}
                        <span>{buttonConfig.text}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredApplications.length === 0 && (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-500 mb-2">
                {applications.length === 0 ? 'No applications yet' : 'No applications found'}
              </h3>
              <p className="text-gray-400">
                {applications.length === 0
                  ? 'Applications will appear here as candidates apply for this position'
                  : 'Try adjusting your search terms'
                }
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Resume Preview Modal */}
      {selectedResume && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold text-[#1c398e]">Resume Preview</h3>
              <div className="flex items-center space-x-3">
                <a
                  href={getOriginalUrl(selectedResume)}
                  download="resume"
                  className="bg-blue-100 text-[#1c398e] px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center space-x-2 text-sm font-medium"
                  onClick={(e) => {
                    // Create a proper download
                    e.preventDefault();
                    const link = document.createElement('a');
                    link.href = getOriginalUrl(selectedResume);
                    link.download = 'resume';
                    link.target = '_blank';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </a>
                <button
                  onClick={() => {
                    setSelectedResume(null);
                    setResumeViewerError(false);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden bg-gray-50 relative">
              {!resumeViewerError ? (
                <>
                  {/* PDF Viewer using PDF.js via CDN */}
                  {selectedResume.includes('.pdf') ? (
                    <iframe
                      src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(selectedResume)}`}
                      className="w-full h-full border-none"
                      title="PDF Resume Preview"
                      onError={() => setResumeViewerError(true)}
                      onLoad={(e) => {
                        // Check if PDF loaded successfully
                        try {
                          const iframe = e.target;
                          iframe.onload = () => {
                            setTimeout(() => {
                              try {
                                iframe.contentWindow.document;
                              } catch (err) {
                                setResumeViewerError(true);
                              }
                            }, 2000);
                          };
                        } catch (err) {
                          setResumeViewerError(true);
                        }
                      }}
                    />
                  ) : (
                    /* For non-PDF files, show as image or use Google Docs Viewer */
                    selectedResume.includes('image') || selectedResume.includes('.jpg') || selectedResume.includes('.png') || selectedResume.includes('.jpeg') ? (
                      <div className="flex items-center justify-center h-full p-4">
                        <img
                          src={getCloudinaryPreviewUrl(selectedResume)}
                          alt="Resume"
                          className="max-w-full max-h-full object-contain shadow-lg rounded-lg"
                          onError={() => setResumeViewerError(true)}
                        />
                      </div>
                    ) : (
                      <iframe
                        src={`https://docs.google.com/gview?url=${encodeURIComponent(selectedResume)}&embedded=true`}
                        className="w-full h-full border-none"
                        title="Resume Preview"
                        onError={() => setResumeViewerError(true)}
                      />
                    )
                  )}
                </>
              ) : (
                /* Fallback UI when viewers fail */
                <div className="flex items-center justify-center h-full">
                  <div className="text-center p-8">
                    <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-700 mb-2">Preview Not Available</h4>
                    <p className="text-gray-500 mb-6">This document type cannot be previewed in the browser.</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={() => window.open(selectedResume, '_blank')}
                        className="bg-[#1c398e] text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Open in New Tab</span>
                      </button>
                      <button
                        onClick={(e) => {
                          const link = document.createElement('a');
                          link.href = getOriginalUrl(selectedResume);
                          link.download = 'resume';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download File</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading overlay */}
              {!resumeViewerError && (
                <div className="absolute inset-0 bg-white flex items-center justify-center" style={{
                  animation: 'fadeOut 3s forwards',
                  animationDelay: '1s'
                }}>
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 text-[#1c398e] animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading document preview...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <style jsx>{`
            @keyframes fadeOut {
              0% { opacity: 1; }
              100% { opacity: 0; pointer-events: none; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default Page;