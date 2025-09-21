"use client"

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, MapPin, Clock, Users, Eye, Send, Upload, AlertCircle,
  Briefcase, Calendar, Loader2, Share2, Building2, Star, CheckCircle
} from 'lucide-react';

const JobDetailPage = ({ jobId }) => {
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [user, setUser] = useState(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [applicationData, setApplicationData] = useState({
    resume: null,
    email: '',
    phone: '',
  });

  // Helper function to decode JWT token
  const decodeJWT = (token) => {
    try {
      // Split the token into parts
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }

      // Decode the payload (second part)
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

        // Decode the JWT token to get user info
        const decodedToken = decodeJWT(token);
        if (!decodedToken) {
          console.log('Invalid token');
          setUser(null);
          localStorage.removeItem('authToken'); // Remove invalid token
          return;
        }

        // Check if token is expired
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp && decodedToken.exp < currentTime) {
          console.log('Token expired');
          setUser(null);
          localStorage.removeItem('authToken'); // Remove expired token
          return;
        }

        // Set user data from decoded token
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
        localStorage.removeItem('authToken'); // Remove problematic token
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

  // Apply for job
  const handleJobApplication = async (e) => {
    e.preventDefault();

    // Check if user is logged in
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
      const result = await response.json();

      if (response.ok) {

        setShowApplicationForm(false);
        alert('Application submitted successfully!');
        console.log('Application successful:', result);

        // Reset form data
        setApplicationData({
          resume: null,
          email: '',
          phone: '',
        });
      } else {
        alert(result.error || 'Something went wrong with your application.');
      }
    } catch (error) {
      console.error(err);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setIsApplying(false);
    }
  };


  //helper resume file validation
  const handleResumeChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (!allowedTypes.includes(file.type)) {
    alert('Invalid file type. Only PDF, DOC, DOCX allowed.');
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    alert('File is too large. Maximum 10MB allowed.');
    return;
  }

  setApplicationData(prev => ({ ...prev, resume: file }));
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

  // Show loading state while checking authentication
  if (isUserLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
            <Briefcase className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="w-32 h-4 bg-gray-200 rounded-full mx-auto animate-pulse"></div>
            <div className="w-24 h-3 bg-gray-100 rounded-full mx-auto animate-pulse"></div>
          </div>
          <p className="text-gray-600 mt-4">
            {isUserLoading ? 'Checking authentication...' : 'Loading job details...'}
          </p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Navigation */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 sm:p-3 hover:bg-gray-100 rounded-xl transition-colors group"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700 group-hover:text-blue-600 transition-colors" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                  ILS
                </div>
                <span className="text-lg sm:text-xl font-bold text-gray-900 hidden sm:block">JobsHub</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleShareJob}
                className="p-2 sm:p-3 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-xl transition-all duration-300 group"
              >
                <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Job Header Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100">
              {/* Job Title & Meta */}
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                  <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                      {job.title}
                    </h1>
                    <div className="flex items-center text-gray-600 mb-4">
                      <Building2 className="w-5 h-5 mr-2 text-blue-500" />
                      <span className="font-medium">{renderPostedBy(job.postedBy)}</span>
                    </div>
                  </div>
                </div>

                {/* Job Meta Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Location</p>
                        <p className="font-semibold text-gray-900">{job.location || 'Remote'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Job Type</p>
                        <p className="font-semibold text-gray-900">{job.type || 'Full-time'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-4 border border-purple-100 sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Posted</p>
                        <p className="font-semibold text-gray-900">
                          {job.datePosted ? new Date(job.datePosted).toLocaleDateString() : 'Recently'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Experience Badge */}
                {job.experience && (
                  <div className="mt-6">
                    <div className="inline-flex items-center bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200 text-amber-800 px-4 py-2 rounded-full text-sm font-medium">
                      <Star className="w-4 h-4 mr-2" />
                      Experience: {job.experience}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <Briefcase className="w-6 h-6 mr-3 text-blue-500" />
                Job Description
              </h2>
              <div className="prose prose-gray prose-lg max-w-none">
                <div
                  className="text-gray-700 leading-relaxed space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#d1d5db #f3f4f6'
                  }}
                  dangerouslySetInnerHTML={{
                    __html: (job.description || job.jobDescription || 'No description available.')
                      .replace(/\n/g, '<br>')
                  }}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats Card */}
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Overview</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-600 font-medium">Job Type</span>
                  <span className="font-semibold text-gray-900">{job.type || 'Full-time'}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-600 font-medium">Location</span>
                  <span className="font-semibold text-gray-900">{job.location || 'Remote'}</span>
                </div>

                {job.experience && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-gray-600 font-medium">Experience</span>
                    <span className="font-semibold text-gray-900">{job.experience}</span>
                  </div>
                )}

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-600 font-medium">Posted By</span>
                  <span className="font-semibold text-gray-900">{renderPostedBy(job.postedBy)}</span>
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
                className="w-full mt-8 px-6 py-4 rounded-2xl font-semibold text-lg flex items-center justify-center space-x-3 group transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-2xl hover:scale-[1.02]"
              >
                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">Apply for Position</h3>
                <p className="text-gray-600 mt-1">{job.title}</p>
                <p className="text-sm text-blue-600 mt-2">Applying as: {user.name || user.email}</p>
              </div>
              <button
                onClick={() => setShowApplicationForm(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <AlertCircle className="w-6 h-6 text-gray-500" />
              </button>
            </div>

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
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white"
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Resume/CV *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors bg-gray-50 hover:bg-blue-50">
                  <input
                    type="file"
                    id="resume"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeChange}
                    className="hidden"
                  />
                  <label htmlFor="resume" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-900 font-semibold text-lg mb-2">Click to upload resume</p>
                    <p className="text-gray-500">PDF, DOC, DOCX (Max 10MB)</p>
                  </label>
                  {applicationData.resume && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                      <p className="text-green-700 font-medium flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {applicationData.resume.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Cover Letter *
                </label>
                <textarea
                  required
                  rows={6}
                  value={applicationData.coverLetter}
                  onChange={(e) => setApplicationData(prev => ({ ...prev, coverLetter: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none bg-gray-50 focus:bg-white"
                  placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                />
                <p className="text-xs text-gray-500 mt-2 text-right">
                  {applicationData.coverLetter.length}/1000 characters
                </p>
              </div> */}

              <div className="flex items-start space-x-3">
                <input type="checkbox" id="terms" required className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed">
                  I agree to the <a href="#" className="text-blue-600 hover:underline font-medium">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline font-medium">Privacy Policy</a>
                </label>
              </div>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowApplicationForm(false)}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-4 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isApplying}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl hover:shadow-xl transition-all duration-300 font-semibold flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
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