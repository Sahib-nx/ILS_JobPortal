"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Building2, Mail, MapPin, Phone, Globe, FileText, CheckCircle, AlertCircle, Loader2, ChevronDown, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const CompanyRegistrationForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    companyEmail: '',
    companyName: '',
    companyDetails: '',
    location: '',
    phone: '',
    website: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);

  // Phone input states
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const handleBackClick = () => {
    setShowLogoutWarning(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/recruiter/register';
  };

  const cancelLogout = () => {
    setShowLogoutWarning(false);
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
        
        const india = formattedCountries.find(c => c.code === 'IN');
        if (india) {
          setSelectedCountry(india);
        } else {
          setSelectedCountry(formattedCountries[0]);
        }
      } catch (error) {
        console.error('Error fetching countries:', error);
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
    
    if (!formData.phone || formData.phone.trim() === '') {
      setFormData(prev => ({ ...prev, phone: '' }));
    }
  };

  // Handle phone input change
  const handlePhoneChange = (e) => {
    let value = e.target.value;
    
    if (value.startsWith('+') && value.length > 2) {
      const potentialCode = value.substring(0, 4);
      const matchingCountry = countries.find(c => 
        potentialCode.startsWith(c.dialCode)
      );
      
      if (matchingCountry && matchingCountry.code !== selectedCountry?.code) {
        setSelectedCountry(matchingCountry);
        value = value.substring(matchingCountry.dialCode.length).trim();
      }
    }
    
    if (/^[0-9\s+]*$/.test(value)) {
      setFormData(prev => ({ ...prev, phone: value }));
      validateField('phone', value);
    }
  };

  // Get full phone number with country code
  const getFullPhoneNumber = () => {
    if (!selectedCountry || !formData.phone) return '';
    const cleanPhone = formData.phone.replace(/\D/g, '');
    return `${selectedCountry.dialCode}${cleanPhone}`;
  };

  useEffect(() => {
    const userId = localStorage.getItem("userId")
    if (!userId) {
      window.location.href = '/recruiter/register';
      return;
    }

    if (localStorage.getItem("userRole") === "Recruiter") {
      window.location.href = "/recruiter"
      toast.error("You are already a Recruiter!!")
      return;
    }

    const handlePopState = () => {
      setShowLogoutWarning(true);
      window.history.pushState(null, '', window.location.pathname);
    };

    window.history.pushState(null, '', window.location.pathname);
    window.addEventListener('popstate', handlePopState);

    setIsVisible(true);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'companyEmail':
        if (!value) {
          newErrors.companyEmail = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          newErrors.companyEmail = 'Please enter a valid email';
        } else {
          delete newErrors.companyEmail;
        }
        break;
      case 'companyName':
        if (!value.trim()) {
          newErrors.companyName = 'Company name is required';
        } else {
          delete newErrors.companyName;
        }
        break;
      case 'companyDetails':
        if (!value.trim()) {
          newErrors.companyDetails = 'Company details are required';
        } else if (value.trim().length < 50) {
          newErrors.companyDetails = 'Please provide at least 50 characters';
        } else {
          delete newErrors.companyDetails;
        }
        break;
      case 'location':
        if (!value.trim()) {
          newErrors.location = 'Location is required';
        } else {
          delete newErrors.location;
        }
        break;
      case 'phone':
        if (!value) {
          newErrors.phone = 'Phone number is required';
        } else if (!/^[0-9]+$/.test(value)) {
          newErrors.phone = 'Phone number must contain only digits';
        } else if (value.length < 10) {
          newErrors.phone = 'Phone number must be at least 10 digits';
        } else {
          delete newErrors.phone;
        }
        break;
      case 'website':
        if (!value.trim()) {
          newErrors.website = 'Website is required';
        } else if (!/^https?:\/\/.+\..+/.test(value)) {
          newErrors.website = 'Please enter a valid URL (e.g., https://example.com)';
        } else {
          delete newErrors.website;
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.keys(formData).forEach(key => {
      validateField(key, formData[key]);
      if (!formData[key] || (typeof formData[key] === 'string' && !formData[key].trim())) {
        newErrors[key] = `${key} is required`;
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setSubmitStatus({
        type: 'error',
        message: 'Please fill in all required fields correctly.'
      });
      return;
    }

    const userId = localStorage.getItem("userId");
    if (!userId) {
      setSubmitStatus({ type: 'error', message: 'Authentication required. Please log in.' });
      return;
    }

    setIsLoading(true);
    setSubmitStatus(null);

    console.log('Form data being sent:', formData);
    console.log('User ID:', userId);

    try {
      const requestBody = {
        companyEmail: formData.companyEmail?.trim() || '',
        companyName: formData.companyName?.trim() || '',
        companyDetails: formData.companyDetails?.trim() || '',
        location: formData.location?.trim() || '',
        phone: getFullPhoneNumber(),
        website: formData.website?.trim() || ''
      };

      console.log('Request body:', requestBody);

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/recruiter/submit/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(requestBody)
      });

      const responseData = await response.json();
      console.log('Response:', responseData);

      if (response.ok) {
        setSubmitStatus({
          type: 'success',
          message: 'Company registration submitted successfully! Your application is pending review.'
        });
        setFormData({
          companyEmail: '',
          companyName: '',
          companyDetails: '',
          location: '',
          phone: '',
          website: ''
        });
        router.push('/pending-approval-page');
      } else {
        setSubmitStatus({
          type: 'error',
          message: responseData.message || `Server error: ${response.status}. Please try again.`
        });
      }
    } catch (error) {
      console.error('Network error:', error);
      setSubmitStatus({
        type: 'error',
        message: 'Network error. Please check your connection and try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const inputFields = [
    { name: 'companyName', label: 'Company Name', icon: Building2, type: 'text', placeholder: 'Enter your company name' },
    { name: 'companyEmail', label: 'Company Email', icon: Mail, type: 'email', placeholder: 'company@example.com' },
    { name: 'location', label: 'Location', icon: MapPin, type: 'text', placeholder: 'City, State, Country' },
    { name: 'website', label: 'Website', icon: Globe, type: 'url', placeholder: 'https://yourcompany.com' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      {showLogoutWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full transform animate-pulse">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">Warning!</h3>
            <p className="text-gray-600 text-center mb-6">
              Going back will log you out and you'll lose all unsaved progress. Are you sure you want to continue?
            </p>
            <div className="flex space-x-4">
              <button
                onClick={cancelLogout}
                className="flex-1 py-3 px-4 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`max-w-2xl mx-auto transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>

        <button
          onClick={handleBackClick}
          className="mb-6 flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">Back</span>
        </button>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl mb-6 transform hover:scale-110 transition-transform duration-300">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Join as a Recruiter</h1>
          <p className="text-lg text-gray-600">Register your company and start hiring top talent</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 backdrop-blur-sm border border-gray-100">
          <div className="space-y-6">

            {inputFields.map((field, index) => {
              const Icon = field.icon;
              return (
                <div
                  key={field.name}
                  className={`transition-all duration-500 transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {field.label}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Icon className={`w-5 h-5 transition-colors duration-200 ${errors[field.name] ? 'text-red-400' : 'text-gray-400 group-focus-within:text-indigo-600'}`} />
                    </div>
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-0 ${errors[field.name]
                        ? 'border-red-300 focus:border-red-500 bg-red-50'
                        : 'border-gray-200 focus:border-indigo-500 focus:bg-white hover:border-gray-300'
                        }`}
                    />
                  </div>
                  {errors[field.name] && (
                    <p className="mt-2 text-sm text-red-600 flex items-center animate-pulse">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors[field.name]}
                    </p>
                  )}
                </div>
              );
            })}

            {/* Phone Number with Country Code */}
            <div
              className={`transition-all duration-500 transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}
              style={{ transitionDelay: `${inputFields.length * 100}ms`, position: 'relative', zIndex: 100 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Phone className={`w-5 h-5 transition-colors duration-200 ${errors.phone ? 'text-red-400' : 'text-gray-400 group-focus-within:text-indigo-600'}`} />
                </div>
                <div className="flex">
                  <div ref={dropdownRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                      disabled={isLoadingCountries}
                      className="flex items-center space-x-2 pl-12 pr-3 py-4 border-2 border-r-0 border-gray-200 rounded-l-xl bg-gray-50 hover:bg-gray-100 transition-all focus:outline-none focus:border-indigo-500 disabled:opacity-50 h-[56px]"
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
                      <div className="absolute top-full left-0 mt-2 w-80 border-2 border-gray-400 rounded-xl shadow-2xl max-h-96 overflow-hidden flex flex-col" style={{ zIndex: 10000, backgroundColor: '#ffffff' }}>
                        <div className="p-3 border-b border-gray-200" style={{ backgroundColor: '#f9fafb' }}>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              ref={searchInputRef}
                              type="text"
                              value={countrySearch}
                              onChange={(e) => setCountrySearch(e.target.value)}
                              placeholder="Search country..."
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                              style={{ backgroundColor: '#ffffff' }}
                            />
                          </div>
                        </div>
                        <div className="overflow-y-auto" style={{ backgroundColor: '#ffffff' }}>
                          {filteredCountries.length === 0 ? (
                            <div className="p-4 text-center text-gray-500" style={{ backgroundColor: '#ffffff' }}>
                              No countries found
                            </div>
                          ) : (
                            filteredCountries.map((country) => (
                              <button
                                key={country.code}
                                type="button"
                                onClick={() => handleCountrySelect(country)}
                                style={{ backgroundColor: selectedCountry?.code === country.code ? '#e0e7ff' : '#ffffff' }}
                                className={`w-full flex items-center space-x-3 px-4 py-3 transition-colors text-left`}
                                onMouseEnter={(e) => {
                                  if (selectedCountry?.code !== country.code) {
                                    e.currentTarget.style.backgroundColor = '#e0e7ff';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (selectedCountry?.code !== country.code) {
                                    e.currentTarget.style.backgroundColor = '#ffffff';
                                  }
                                }}
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
                    name="phone"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    placeholder="1234567890"
                    className={`flex-1 px-4 py-2 border-2 rounded-r-xl text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-0 ${errors.phone
                      ? 'border-red-300 focus:border-red-500 bg-red-50'
                      : 'border-gray-200 focus:border-indigo-500 focus:bg-white hover:border-gray-300'
                      }`}
                  />
                </div>
              </div>
              {errors.phone && (
                <p className="mt-2 text-sm text-red-600 flex items-center animate-pulse">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.phone}
                </p>
              )}
              {formData.phone && !errors.phone && (
                <p className="text-gray-500 text-xs mt-1">
                  Full number: {getFullPhoneNumber()}
                </p>
              )}
            </div>

            <div
              className={`transition-all duration-500 transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}
              style={{ transitionDelay: `${(inputFields.length + 1) * 100}ms`, position: 'relative', zIndex: 1 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Company Details
              </label>
              <div className="relative group">
                <div className="absolute top-4 left-4 pointer-events-none">
                  <FileText className={`w-5 h-5 transition-colors duration-200 ${errors.companyDetails ? 'text-red-400' : 'text-gray-400 group-focus-within:text-indigo-600'}`} />
                </div>
                <textarea
                  name="companyDetails"
                  value={formData.companyDetails}
                  onChange={handleChange}
                  placeholder="Describe your company, services, culture, and what makes you unique... (minimum 50 characters)"
                  rows="4"
                  className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-0 resize-none ${errors.companyDetails
                    ? 'border-red-300 focus:border-red-500 bg-red-50'
                    : 'border-gray-200 focus:border-indigo-500 focus:bg-white hover:border-gray-300'
                    }`}
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                {errors.companyDetails ? (
                  <p className="text-sm text-red-600 flex items-center animate-pulse">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.companyDetails}
                  </p>
                ) : (
                  <p className={`text-sm transition-colors duration-200 ${formData.companyDetails.length >= 50 ? 'text-green-600' : 'text-gray-500'}`}>
                    {formData.companyDetails.length}/50 minimum characters
                  </p>
                )}
              </div>
            </div>

            {submitStatus && (
              <div className={`p-4 rounded-xl flex items-center space-x-3 ${submitStatus.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
                }`} style={{ animation: 'fadeIn 0.5s ease-out' }}>
                {submitStatus.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="font-medium">{submitStatus.message}</span>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isLoading || Object.keys(errors).length > 0}
              className={`w-full py-4 px-8 rounded-xl font-semibold text-white text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:transform-none ${isLoading || Object.keys(errors).length > 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
                }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Submitting...</span>
                </div>
              ) : (
                'Submit Registration'
              )}
            </button>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-sm text-blue-800 text-center">
              <span className="font-semibold">Note:</span> Your application will be reviewed by our team.
              You'll receive a confirmation email once approved.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default CompanyRegistrationForm;