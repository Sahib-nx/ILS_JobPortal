"use client"

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, MapPin, Clock, Users, Eye, Send, Upload, AlertCircle,
  Briefcase, Calendar, Loader2, Share2, Building2, Star, CheckCircle, X
} from 'lucide-react';

const JobDetailPage = ({ jobId }) => {
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [user, setUser] = useState(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [fileError, setFileError] = useState('');
  const [applicationData, setApplicationData] = useState({
    resume: null,
    email: '',
    phone: '',
  });

  // Helper function to decode JWT token
  const decodeJWT = (token) => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }
      const payload = parts[1];
      const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  };

  // Helper function to safely render user/poster information
  const renderPostedBy = (postedByData) => {
    if (!postedByData) return 'HR Team';
    if (typeof postedByData === 'string') return postedByData;
    if (typeof postedByData === 'object') {
      return postedByData.name || postedByData.email || 'HR Team';
    }
    return 'HR Team';
  };

  // Navigate to login if not authenticated
  const handleLoginRedirect = () => {
    window.location.href = '/auth/login';
  };

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get current user from authtoken
  useEffect(() => {
    const getUserFromAuth = async () => {
      setIsUserLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.log('No auth token found');
          setUser(null);
          return;
        }

        const decodedToken = decodeJWT(token);
        if (!decodedToken) {
          console.log('Invalid token');
          setUser(null);
          localStorage.removeItem('authToken');
          return;
        }

        const currentTime = Date.now() / 1000;
        if (decodedToken.exp && decodedToken.exp < currentTime) {
          console.log('Token expired');
          setUser(null);
          localStorage.removeItem('authToken');
          return;
        }

        const userData = {
          id: decodedToken.UserId,
          email: decodedToken.email,
          name: decodedToken.name,
        };

        console.log('User authenticated:', userData);
        setUser(userData);

      } catch (error) {
        console.error('Error getting user from auth token:', error);
        setUser(null);
        localStorage.removeItem('authToken');
      } finally {
        setIsUserLoading(false);
      }
    };

    getUserFromAuth();
  }, []);

  // Fetch job details
  useEffect(() => {
    const fetchJobDetails = async () => {
      setIsLoading(true);
      try {
        const jobResponse = await fetch(`http://localhost:4441/api/job/${jobId}`);
        if (!jobResponse.ok) {
          throw new Error("Failed to fetch job details");
        }
        const jobData = await jobResponse.json();
        setJob(jobData);
        console.log('Job data received:', jobData);
      } catch (error) {
        console.error("Error fetching job details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);



  const handleJobApplication = async (e) => {
    e.preventDefault();

    if (!user || !user.id) {
      handleLoginRedirect();
      return;
    }

    setIsApplying(true);

    try {
      const formData = new FormData();
      formData.append('email', applicationData.email);
      formData.append('phone', applicationData.phone);

      if (applicationData.resume) {
        formData.append('resume', applicationData.resume);
      }

      const response = await fetch(`http://localhost:4441/api/job/${jobId}/apply/${user.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });

      // IMPROVED: Handle both JSON and non-JSON responses
      let result;
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        try {
          result = await response.json();
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          result = { error: 'Invalid response format from server' };
        }
      } else {
        // Handle non-JSON responses (like HTML error pages)
        const textResponse = await response.text();
        console.error('Non-JSON response:', textResponse);
        result = {
          error: response.ok ? 'Unexpected server response' : `Server error (${response.status}): ${response.statusText}`
        };
      }

      if (response.ok && result.message) {
        // Success case
        setShowApplicationForm(false);
        alert(result.message || 'Application submitted successfully!');
        console.log('Application successful:', result);

        // Reset form
        setApplicationData({
          resume: null,
          email: '',
          phone: '',
        });
      } else {
        // Error case
        const errorMessage = result.error || result.message || 'Application failed. Please try again.';
        alert(errorMessage);
        console.error('Application error:', result);
      }

    } catch (error) {
      console.error('Network/Request error:', error);

      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        alert('Network error. Please check your connection and try again.');
      } else {
        alert('Something went wrong. Please try again.');
      }
    } finally {
      setIsApplying(false);
    }
  };

  //resume chnage
  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    // TODO: Add toaster for validation messages
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Only PDF, DOC, DOCX allowed.');
      e.target.value = ''; // Reset the file input
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum 10MB allowed.`);
      e.target.value = ''; // Reset the file input
      return;
    }

    //Check for empty/corrupted files
    if (file.size === 0) {
      alert('File appears to be empty or corrupted. Please select a different file.');
      e.target.value = ''; // Reset the file input
      return;
    }

    console.log('File selected:', file.name, `${(file.size / (1024 * 1024)).toFixed(2)}MB`);
    setApplicationData(prev => ({ ...prev, resume: file }));
  };
  // Remove selected file
  const handleRemoveFile = () => {
    setApplicationData(prev => ({ ...prev, resume: null }));
    setFileError('');
    // Clear the file input
    const fileInput = document.getElementById('resume');
    if (fileInput) fileInput.value = '';
  };

  // Share job posting
  const handleShareJob = () => {
    if (navigator.share) {
      navigator.share({
        title: job?.title || "Job Opportunity",
        text: `Check out this job: ${job?.title}`,
        url: window.location.href,
      }).catch(err => console.error("Error sharing:", err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Job link copied to clipboard!");
    }
  };

  // Loading state
  if (isUserLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
            <Briefcase className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div className="space-y-2 mb-4">
            <div className="w-32 h-4 bg-gray-200 rounded-full mx-auto animate-pulse"></div>
            <div className="w-24 h-3 bg-gray-100 rounded-full mx-auto animate-pulse"></div>
          </div>
          <p className="text-gray-600">
            {isUserLoading ? 'Checking authentication...' : 'Loading job details...'}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-xl">
            <AlertCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Job Not Found</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">The job you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl hover:shadow-xl transition-all duration-300 font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={() => window.history.back()}
                className="p-1 sm:p-3 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                  ILS
                </div>
                <span className="text-lg sm:text-xl font-bold text-gray-900 hidden sm:block">ILS</span>
              </div>
            </div>

            <button
              onClick={handleShareJob}
              className="p-2 sm:p-3 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-xl transition-all"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            {/* Job Header Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100">
              <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {job.title}
                </h1>
                <div className="flex items-center text-gray-600 mb-4">
                  <Building2 className="w-5 h-5 mr-2 text-blue-500" />
                  <span className="font-medium">{renderPostedBy(job.postedBy)}</span>
                </div>
              </div>

              {/* Job Meta Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Location</p>
                      <p className="font-semibold text-gray-900">{job.location || 'Remote'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Job Type</p>
                      <p className="font-semibold text-gray-900">{job.type || 'Full-time'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Posted</p>
                      <p className="font-semibold text-gray-900">
                        {job.datePosted ? new Date(job.datePosted).toLocaleDateString() : 'Recently'}
                      </p>
                    </div>
                  </div>
                </div>

                {job.experience && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                        <Star className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Experience</p>
                        <p className="font-semibold text-gray-900">{job.experience}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Briefcase className="w-6 h-6 mr-3 text-blue-500" />
                Job Description
              </h2>
              <div
                className="text-gray-700 leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{
                  __html: (job.description || job.jobDescription || 'No description available.')
                    .replace(/\n/g, '<br>')
                }}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Overview</h3>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-600 font-medium">Job Type</span>
                  <span className="font-semibold text-gray-900">{job.type || 'Full-time'}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-600 font-medium">Location</span>
                  <span className="font-semibold text-gray-900 text-right">{job.location || 'Remote'}</span>
                </div>

                {job.experience && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-gray-600 font-medium">Experience</span>
                    <span className="font-semibold text-gray-900">{job.experience}</span>
                  </div>
                )}

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-600 font-medium">Posted By</span>
                  <span className="font-semibold text-gray-900 text-right">{renderPostedBy(job.postedBy)}</span>
                </div>
              </div>

              {/* Apply Button */}
              <button
                onClick={() => {
                  if (!user) {
                    handleLoginRedirect();
                    return;
                  }
                  setShowApplicationForm(true);
                }}
                className="w-full px-6 py-4 rounded-xl font-semibold text-lg flex items-center justify-center space-x-3 transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:scale-[1.02]"
              >
                <Send className="w-5 h-5" />
                <span>Apply Now</span>
              </button>

              <p className="text-center text-sm text-gray-500 mt-4">
                Join our team and start your career journey!
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Application Modal */}
      {showApplicationForm && user && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">Apply for Position</h3>
                <p className="text-gray-600 mt-1">{job.title}</p>
                <p className="text-sm text-blue-600 mt-2">Applying as: {user.name || user.email}</p>
              </div>
              <button
                onClick={() => {
                  setShowApplicationForm(false);
                  setFileError('');
                  setApplicationData({
                    resume: null,
                    email: '',
                    phone: '',
                  });
                }}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Application Form */}
            <form onSubmit={handleJobApplication} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={applicationData.email || user.email || ''}
                    onChange={(e) => setApplicationData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 text-[#1c398e] placeholder-gray-300 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={applicationData.phone}
                    onChange={(e) => setApplicationData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 text-[#1c398e] placeholder-gray-300 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Resume/CV *
                </label>

                {/* File Upload Area */}
                <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${fileError ? 'border-red-300 bg-red-50' :
                  applicationData.resume ? 'border-green-300 bg-green-50' :
                    'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
                  }`}>
                  {!applicationData.resume ? (
                    <>
                      <input
                        type="file"
                        id="resume"
                        accept=".pdf,.doc,.docx"
                        onChange={handleResumeChange}
                        className="hidden"
                      />
                      <label htmlFor="resume" className="cursor-pointer">
                        <Upload className={`w-12 h-12 mx-auto mb-4 ${fileError ? 'text-red-400' : 'text-gray-400'}`} />
                        <p className="text-gray-900 font-semibold text-lg mb-2">Click to upload resume</p>
                        <p className="text-gray-500">PDF, DOC, DOCX (Max 10MB)</p>
                      </label>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-white border border-green-200 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="w-6 h-6 text-green-500" />
                            <div className="text-left">
                              <p className="text-green-700 font-medium">{applicationData.resume.name}</p>
                              <p className="text-gray-500 text-sm">{formatFileSize(applicationData.resume.size)}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveFile}
                            className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-green-600">✓ File validated and ready to upload</p>
                    </div>
                  )}
                </div>

                {/* File Error Display */}
                {fileError && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-700 text-sm flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {fileError}
                    </p>
                  </div>
                )}

                {/* File Requirements */}
                <div className="mt-3 text-xs text-gray-500">
                  <p>• Supported formats: PDF, DOC, DOCX</p>
                  <p>• Maximum file size: 10MB</p>
                  <p>• File will be validated before upload</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed">
                  I agree to the <a href="#" className="text-blue-600 hover:underline font-medium">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline font-medium">Privacy Policy</a>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowApplicationForm(false);
                    setFileError('');
                    setApplicationData({
                      resume: null,
                      email: '',
                      phone: '',
                    });
                  }}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-4 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isApplying || !applicationData.resume || fileError}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl hover:shadow-lg transition-all font-semibold flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isApplying ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Submit Application</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetailPage;