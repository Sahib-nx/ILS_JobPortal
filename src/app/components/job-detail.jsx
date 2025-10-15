"use client"

import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, MapPin, Clock, Send, Upload, AlertCircle,
  Briefcase, Calendar, Loader2, Share2, Building2, Star, CheckCircle, X, ChevronDown, Search
} from 'lucide-react';
import toast from 'react-hot-toast';

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

  // Phone input states
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

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

  // Fetch countries from REST Countries API
  useEffect(() => {
    const fetchCountries = async () => {
      setIsLoadingCountries(true);
      try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,idd,flags');
        
        if (!response.ok) {
          throw new Error('Failed to fetch countries');
        }
        
        const data = await response.json();
        
        // Check if data is an array
        if (!Array.isArray(data)) {
          console.error('Expected array but got:', typeof data);
          throw new Error('Invalid data format');
        }
        
        const formattedCountries = data
          .map(country => {
            try {
              return {
                name: country.name?.common || 'Unknown',
                code: country.cca2 || '',
                dialCode: country.idd?.root 
                  ? `${country.idd.root}${country.idd.suffixes?.[0] || ''}`
                  : '',
                flag: country.flags?.svg || country.flags?.png || 'https://flagcdn.com/xx.svg',
              };
            } catch (err) {
              console.error('Error processing country:', err);
              return null;
            }
          })
          .filter(country => country !== null && country.dialCode && country.code)
          .sort((a, b) => a.name.localeCompare(b.name));

        if (formattedCountries.length === 0) {
          throw new Error('No valid countries found');
        }

        setCountries(formattedCountries);
        
        // Set India as default
        const india = formattedCountries.find(c => c.code === 'IN');
        if (india) {
          setSelectedCountry(india);
        } else {
          setSelectedCountry(formattedCountries[0]);
        }
      } catch (error) {
        console.error('Error fetching countries:', error);
        // Fallback to comprehensive basic data
        const fallback = [
          { name: 'India', code: 'IN', dialCode: '+91', flag: 'https://flagcdn.com/in.svg' },
          { name: 'United States', code: 'US', dialCode: '+1', flag: 'https://flagcdn.com/us.svg' },
          { name: 'United Kingdom', code: 'GB', dialCode: '+44', flag: 'https://flagcdn.com/gb.svg' },
          { name: 'Canada', code: 'CA', dialCode: '+1', flag: 'https://flagcdn.com/ca.svg' },
          { name: 'Australia', code: 'AU', dialCode: '+61', flag: 'https://flagcdn.com/au.svg' },
          { name: 'Germany', code: 'DE', dialCode: '+49', flag: 'https://flagcdn.com/de.svg' },
          { name: 'France', code: 'FR', dialCode: '+33', flag: 'https://flagcdn.com/fr.svg' },
          { name: 'China', code: 'CN', dialCode: '+86', flag: 'https://flagcdn.com/cn.svg' },
          { name: 'Japan', code: 'JP', dialCode: '+81', flag: 'https://flagcdn.com/jp.svg' },
          { name: 'South Korea', code: 'KR', dialCode: '+82', flag: 'https://flagcdn.com/kr.svg' },
          { name: 'Brazil', code: 'BR', dialCode: '+55', flag: 'https://flagcdn.com/br.svg' },
          { name: 'Mexico', code: 'MX', dialCode: '+52', flag: 'https://flagcdn.com/mx.svg' },
          { name: 'Russia', code: 'RU', dialCode: '+7', flag: 'https://flagcdn.com/ru.svg' },
          { name: 'Singapore', code: 'SG', dialCode: '+65', flag: 'https://flagcdn.com/sg.svg' },
          { name: 'United Arab Emirates', code: 'AE', dialCode: '+971', flag: 'https://flagcdn.com/ae.svg' },
          { name: 'Saudi Arabia', code: 'SA', dialCode: '+966', flag: 'https://flagcdn.com/sa.svg' },
          { name: 'Pakistan', code: 'PK', dialCode: '+92', flag: 'https://flagcdn.com/pk.svg' },
          { name: 'Bangladesh', code: 'BD', dialCode: '+880', flag: 'https://flagcdn.com/bd.svg' },
          { name: 'Sri Lanka', code: 'LK', dialCode: '+94', flag: 'https://flagcdn.com/lk.svg' },
          { name: 'Nepal', code: 'NP', dialCode: '+977', flag: 'https://flagcdn.com/np.svg' },
        ];
        setCountries(fallback);
        setSelectedCountry(fallback[0]);
      } finally {
        setIsLoadingCountries(false);
      }
    };

    fetchCountries();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCountryDropdown(false);
        setCountrySearch('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (showCountryDropdown && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [showCountryDropdown]);

  // Filter countries based on search
  const filteredCountries = countries.filter(country => 
    country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    country.dialCode.includes(countrySearch) ||
    country.code.toLowerCase().includes(countrySearch.toLowerCase())
  );

  // Handle country selection
  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setShowCountryDropdown(false);
    setCountrySearch('');
    
    // Update phone with dial code if phone is empty
    if (!applicationData.phone || applicationData.phone.trim() === '') {
      setApplicationData(prev => ({ ...prev, phone: '' }));
    }
  };

  // Handle phone input change
  const handlePhoneChange = (e) => {
    let value = e.target.value;
    
    // If pasted with country code, try to detect country
    if (value.startsWith('+') && value.length > 2) {
      // Extract potential dial code
      const potentialCode = value.substring(0, 4);
      const matchingCountry = countries.find(c => 
        potentialCode.startsWith(c.dialCode)
      );
      
      if (matchingCountry && matchingCountry.code !== selectedCountry?.code) {
        setSelectedCountry(matchingCountry);
        // Remove dial code from input since it's shown separately
        value = value.substring(matchingCountry.dialCode.length).trim();
      }
    }
    
    // Allow only numbers, spaces, and + sign
    if (/^[0-9\s+]*$/.test(value)) {
      setApplicationData(prev => ({ ...prev, phone: value }));
    }
  };

  // Get full phone number with country code
  const getFullPhoneNumber = () => {
    if (!selectedCountry || !applicationData.phone) return '';
    const cleanPhone = applicationData.phone.replace(/\D/g, '');
    return `${selectedCountry.dialCode}${cleanPhone}`;
  };

  // Get current user from localStorage
  useEffect(() => {
    const getUserFromLocalStorage = () => {
      setIsUserLoading(true);
      try {
        const userId = localStorage.getItem('userId');
        const userName = localStorage.getItem('name');
        const userEmail = localStorage.getItem('email');

        if (!userId) {
          console.log('No userId found in localStorage');
          setUser(null);
          return;
        }

        const userData = {
          id: userId,
          email: userEmail || '',
          name: userName || '',
        };

        console.log('User authenticated:', userData);
        setUser(userData);

      } catch (error) {
        console.error('Error getting user from localStorage:', error);
        setUser(null);
      } finally {
        setIsUserLoading(false);
      }
    };

    getUserFromLocalStorage();
  }, []);

  // Fetch job details
  useEffect(() => {
    const fetchJobDetails = async () => {
      setIsLoading(true);
      try {
        const jobResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/job/${jobId}`);
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
      formData.append('phone', getFullPhoneNumber());

      if (applicationData.resume) {
        formData.append('resume', applicationData.resume);
      }

      console.log('Submitting application with userId:', user.id);
      console.log('Full phone number:', getFullPhoneNumber());
      console.log('API URL:', `${process.env.NEXT_PUBLIC_BASE_URL}/api/job/${jobId}/apply/${user.id}`);

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/job/${jobId}/apply/${user.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const responseText = await response.text();
      console.log('Raw response:', responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        console.error('Response was:', responseText);

        if (responseText.includes('<!DOCTYPE html>') || responseText.includes('<html')) {
          alert('Server error: The server returned an HTML page instead of data. Please check the API endpoint or contact support.');
        } else {
          alert('Invalid response from server. Please try again.');
        }
        setIsApplying(false);
        return;
      }

      if (response.ok && result.message) {
        setShowApplicationForm(false);
        toast.success("Application submitted successfully!");
        console.log('Application successful:', result);

        setApplicationData({
          resume: null,
          email: '',
          phone: '',
        });
        window.location.href = "/user?tab=applications"
      } else {
        const errorMessage = result.error || result.message || 'Application failed. Please try again.';
        // alert(errorMessage);
        toast.error(errorMessage);
        // console.error('Application error:', result);
      }

    } catch (error) {
      console.error('Network/Request error:', error);

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        alert('Network error. Please check your connection and try again.');
      } else {
        alert('Something went wrong. Please try again.');
      }
    } finally {
      setIsApplying(false);
    }
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      // alert('Invalid file type. Only PDF, DOC, DOCX allowed.');
      toast.error('Invalid file type. Only PDF, DOC, DOCX allowed.')
      e.target.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum 10MB allowed.`);
      e.target.value = '';
      return;
    }

    if (file.size === 0) {
      alert('File appears to be empty or corrupted. Please select a different file.');
      e.target.value = '';
      return;
    }

    console.log('File selected:', file.name, `${(file.size / (1024 * 1024)).toFixed(2)}MB`);
    setApplicationData(prev => ({ ...prev, resume: file }));
  };

  const handleRemoveFile = () => {
    setApplicationData(prev => ({ ...prev, resume: null }));
    setFileError('');
    const fileInput = document.getElementById('resume');
    if (fileInput) fileInput.value = '';
  };

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
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100">
              <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight break-words">
                  {job.title}
                </h1>
                <div className="flex items-center text-gray-600 mb-4">
                  <Building2 className="w-5 h-5 mr-2 text-blue-500 flex-shrink-0" />
                  <span className="font-medium break-words">{renderPostedBy(job.postedBy)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-500">Location</p>
                      <p className="font-semibold text-gray-900 break-words">{job.location || 'Remote'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-500">Job Type</p>
                      <p className="font-semibold text-gray-900 break-words">{job.type || 'Full-time'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-500">Posted</p>
                      <p className="font-semibold text-gray-900 break-words">
                        {job.datePosted ? new Date(job.datePosted).toLocaleDateString() : 'Recently'}
                      </p>
                    </div>
                  </div>
                </div>

                {job.experience && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Star className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-500">Experience</p>
                        <p className="font-semibold text-gray-900 break-words">{job.experience}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Briefcase className="w-6 h-6 mr-3 text-blue-500 flex-shrink-0" />
                Job Description
              </h2>
              <div
                className="text-gray-700 leading-relaxed space-y-4 break-words overflow-wrap-anywhere"
                style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                dangerouslySetInnerHTML={{
                  __html: (job.description || job.jobDescription || 'No description available.')
                    .replace(/\n/g, '<br>')
                }}
              />
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Overview</h3>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-600 font-medium">Job Type</span>
                  <span className="font-semibold text-gray-900 break-words text-right">{job.type || 'Full-time'}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-600 font-medium flex-shrink-0 mr-2">Location</span>
                  <span className="font-semibold text-gray-900 text-right break-words">{job.location || 'Remote'}</span>
                </div>

                {job.experience && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-gray-600 font-medium">Experience</span>
                    <span className="font-semibold text-gray-900 break-words text-right">{job.experience}</span>
                  </div>
                )}

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-600 font-medium flex-shrink-0 mr-2">Posted By</span>
                  <span className="font-semibold text-gray-900 text-right break-words">{renderPostedBy(job.postedBy)}</span>
                </div>
              </div>

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

      {showApplicationForm && user && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div className="min-w-0 flex-1 pr-4">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">Apply for Position</h3>
                <p className="text-gray-600 mt-1 break-words">{job.title}</p>
                <p className="text-sm text-blue-600 mt-2 break-words">Applying as: {user.name || user.email}</p>
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
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0"
              >
                <X className="w-6 h-6 text-gray-500" />
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 text-gray-900 placeholder-gray-300 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="flex">
                      <div ref={dropdownRef} className="relative">
                        <button
                          type="button"
                          onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                          disabled={isLoadingCountries}
                          className="flex items-center space-x-2 px-3 py-3 border border-r-0 border-gray-200 rounded-l-xl bg-gray-50 hover:bg-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          {isLoadingCountries ? (
                            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                          ) : selectedCountry ? (
                            <>
                              <img 
                                src={selectedCountry.flag} 
                                alt={selectedCountry.name}
                                className="w-6 h-4 object-cover rounded"
                              />
                              <span className="text-sm font-medium text-gray-700">
                                {selectedCountry.dialCode}
                              </span>
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            </>
                          ) : (
                            <span className="text-sm text-gray-500">Select</span>
                          )}
                        </button>

                        {showCountryDropdown && !isLoadingCountries && (
                          <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 max-h-96 overflow-hidden flex flex-col">
                            <div className="p-3 border-b border-gray-100 sticky top-0 bg-white">
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                  ref={searchInputRef}
                                  type="text"
                                  value={countrySearch}
                                  onChange={(e) => setCountrySearch(e.target.value)}
                                  placeholder="Search country..."
                                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                />
                              </div>
                            </div>
                            <div className="overflow-y-auto">
                              {filteredCountries.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">
                                  No countries found
                                </div>
                              ) : (
                                filteredCountries.map((country) => (
                                  <button
                                    key={country.code}
                                    type="button"
                                    onClick={() => handleCountrySelect(country)}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left ${
                                      selectedCountry?.code === country.code ? 'bg-blue-50' : ''
                                    }`}
                                  >
                                    <img 
                                      src={country.flag} 
                                      alt={country.name}
                                      className="w-6 h-4 object-cover rounded flex-shrink-0"
                                    />
                                    <span className="flex-1 text-gray-900 font-medium truncate">
                                      {country.name}
                                    </span>
                                    <span className="text-gray-600 text-sm font-mono flex-shrink-0">
                                      {country.dialCode}
                                    </span>
                                  </button>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <input
                        type="tel"
                        value={applicationData.phone}
                        onChange={handlePhoneChange}
                        className="flex-1 px-4 py-2 ms-0.5 border border-gray-200 rounded-r-xl focus:outline-none focus:ring-2 text-gray-900 placeholder-gray-300 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                        placeholder="98765 43210"
                      />
                    </div>
                    {applicationData.phone && applicationData.phone.replace(/\D/g, '').length > 0 && applicationData.phone.replace(/\D/g, '').length < 7 && (
                      <p className="text-red-500 text-sm mt-1">
                        Phone number seems too short
                      </p>
                    )}
                    {applicationData.phone && (
                      <p className="text-gray-500 text-xs mt-1">
                        Full number: {getFullPhoneNumber()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Resume/CV *
                </label>

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
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                            <div className="text-left min-w-0">
                              <p className="text-green-700 font-medium break-words">{applicationData.resume.name}</p>
                              <p className="text-gray-500 text-sm">{formatFileSize(applicationData.resume.size)}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveFile}
                            className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors flex-shrink-0 ml-2"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-green-600">✓ File validated and ready to upload</p>
                    </div>
                  )}
                </div>

                {fileError && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-700 text-sm flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                      {fileError}
                    </p>
                  </div>
                )}

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
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
                />
                <label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed">
                  I agree to the <a href="#" className="text-blue-600 hover:underline font-medium">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline font-medium">Privacy Policy</a>
                </label>
              </div>

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