"use client";

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle, AlertCircle, Loader2, Code, Palette, Megaphone, Layers, BarChart3, ChevronDown } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    preference: 'Engineering' // Default preference
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showPreferenceDropdown, setShowPreferenceDropdown] = useState(false);


  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.preference-dropdown')) {
        setShowPreferenceDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleRegister = async () => {
    setIsLoading(true);
    setError('');

    // Basic form validation
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:4441/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          preference: formData.preference
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        //Store JWT token automatically (if backend returns token)
        if (data.token) {
          localStorage.setItem('authToken', data.token);

          window.location.href = '/dashboard';
          toast.success(data.message || 'Registration successful!');
        } else {
          // If no token returned, redirect to login after delay
          setTimeout(() => {
            window.location.href = '/auth/login';
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }

  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePreferenceSelect = (preference) => {
    setFormData(prev => ({
      ...prev,
      preference: preference
    }));
    setShowPreferenceDropdown(false);
  };

  const preferenceOptions = [
    {
      value: 'Engineering',
      label: 'Engineering',
      icon: Code,
      description: 'Software & Technical roles',
      color: 'blue'
    },
    {
      value: 'Design',
      label: 'Design',
      icon: Palette,
      description: 'UI/UX & Creative roles',
      color: 'purple'
    },
    {
      value: 'Marketing',
      label: 'Marketing',
      icon: Megaphone,
      description: 'Growth & Brand roles',
      color: 'green'
    },
    {
      value: 'Product',
      label: 'Product',
      icon: Layers,
      description: 'Product Management roles',
      color: 'orange'
    },
    {
      value: 'Data',
      label: 'Data',
      icon: BarChart3,
      description: 'Analytics & Data Science',
      color: 'red'
    }
  ];

  const selectedPreference = preferenceOptions.find(p => p.value === formData.preference);

  const getColorClasses = (color) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      purple: 'from-purple-500 to-purple-600',
      green: 'from-green-500 to-green-600',
      orange: 'from-orange-500 to-orange-600',
      red: 'from-red-500 to-red-600'
    };
    return colors[color] || colors.blue;
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#dbeafe] via-blue-50 to-white flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="text-center max-w-sm sm:max-w-md">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 animate-bounce">
            <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1c398e] mb-3 sm:mb-4">Welcome to ILS!</h2>
          <p className="text-sm sm:text-base text-blue-600 mb-2">Your account has been created successfully.</p>
          <p className="text-sm sm:text-base text-blue-500 mb-4 sm:mb-6">
            Your preference: <span className="font-bold">{formData.preference}</span>
          </p>
          <p className="text-sm sm:text-base text-blue-600 mb-4 sm:mb-6 px-4">Your account has been created successfully. Redirecting to dashboard...</p>
          <div className="flex items-center justify-center">
            <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#1c398e] animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#dbeafe] via-blue-50 to-white flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-br from-[#1c398e]/10 to-blue-300/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-br from-blue-400/10 to-[#1c398e]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className={`w-full max-w-sm sm:max-w-md lg:max-w-lg relative z-10 transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#1c398e] to-[#3b82f6] rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold text-lg sm:text-2xl shadow-xl mx-auto mb-3 sm:mb-4 transform hover:scale-105 transition-transform duration-300">
            ILS
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1c398e] mb-1 sm:mb-2">Join ILS</h1>
          <p className="text-sm sm:text-base text-blue-600 px-4">Create your account and start your career journey</p>
        </div>

        {/* Register Form */}
        <div className="bg-white/80 backdrop-blur-lg rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/50">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }} className="space-y-4 sm:space-y-6">
            {/* Preference Selection */}
            <div>
              <label className="block text-sm font-medium text-[#1c398e] mb-2">
                Job Preference
              </label>
              <div className="relative preference-dropdown">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPreferenceDropdown(!showPreferenceDropdown);
                  }}
                  className="w-full flex items-center justify-between px-3 sm:px-4 py-3 sm:py-4 bg-white/80 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1c398e] focus:border-transparent transition-all duration-300 hover:border-[#1c398e]/50"
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    {selectedPreference && (
                      <>
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br ${getColorClasses(selectedPreference.color)} flex items-center justify-center`}>
                          <selectedPreference.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-[#1c398e] text-sm sm:text-base">{selectedPreference.label}</div>
                          <div className="text-xs text-gray-500 hidden sm:block">{selectedPreference.description}</div>
                        </div>
                      </>
                    )}
                  </div>
                  <ChevronDown className={`w-5 h-5 text-blue-400 transition-transform duration-200 ${showPreferenceDropdown ? 'rotate-180' : ''
                    }`} />
                </button>

                {/* Dropdown Menu */}
                {showPreferenceDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-blue-100 overflow-hidden z-20">
                    {preferenceOptions.map((preference) => (
                      <button
                        key={preference.value}
                        type="button"
                        onClick={() => handlePreferenceSelect(preference.value)}
                        className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 hover:bg-blue-50 transition-colors ${formData.preference === preference.value ? 'bg-blue-50/50' : ''
                          }`}
                      >
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br ${getColorClasses(preference.color)} flex items-center justify-center`}>
                          <preference.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div className="text-left flex-1">
                          <div className="font-semibold text-[#1c398e] text-sm sm:text-base">{preference.label}</div>
                          <div className="text-xs text-gray-500 hidden sm:block">{preference.description}</div>
                        </div>
                        {formData.preference === preference.value && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-[#1c398e] mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-blue-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-white/80 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1c398e] focus:border-transparent transition-all duration-300 placeholder-blue-300 text-[#1c398e] text-sm sm:text-base"
                  placeholder="Choose a username"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-[#1c398e] mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-blue-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-white/80 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1c398e] focus:border-transparent transition-all duration-300 placeholder-blue-300 text-[#1c398e] text-sm sm:text-base"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>
            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-[#1c398e] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-blue-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 bg-white/80 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1c398e] focus:border-transparent transition-all duration-300 placeholder-blue-200 text-[#1c398e] text-sm sm:text-base"
                  placeholder="Create a secure password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-[#1c398e] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-2">
              <input type="checkbox" required className="rounded border-blue-300 text-[#1c398e] focus:ring-[#1c398e] mt-0.5 sm:mt-1 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                I agree to the{' '}
                <a href="/terms" className="text-[#1c398e] hover:text-blue-600 transition-colors">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-[#1c398e] hover:text-blue-600 transition-colors">
                  Privacy Policy
                </a>
              </span>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#1c398e] to-[#3b82f6] text-white py-3 sm:py-4 rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-[1.02] font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </>
              )}
            </button>
          </form>
          {/* Sign In Link */}
          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-sm sm:text-base text-gray-600">
              Already have an account?{' '}
              <a href="/auth/login" className="text-[#1c398e] hover:text-blue-600 font-semibold transition-colors">
                Sign in here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;