"use client";

import React, { useState, useEffect } from 'react';
import { Building2, Mail, MapPin, Phone, Globe, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { getUserId } from '../utils';
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

  useEffect(() => {
    // User authentication check
    const userId = getUserId();
    if (!userId) {
      // Redirect to login if no valid token
      window.location.href = '/recruiter/register';
      return;
    }

    if(localStorage.getItem("userRole") === "Recruiter") {
      window.localStorage.href = "/recruiter"
      toast.error("You are already a Recruiter!!")
     }
    setIsVisible(true);
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

    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      validateField(key, formData[key]);
      if (!formData[key] || (typeof formData[key] === 'string' && !formData[key].trim())) {
        newErrors[key] = `${key} is required`;
      }
    });

    // Update errors state
    setErrors(newErrors);

    // Check if there are any errors
    if (Object.keys(newErrors).length > 0) {
      setSubmitStatus({
        type: 'error',
        message: 'Please fill in all required fields correctly.'
      });
      return;
    }

    const userId = getUserId();
    if (!userId) {
      setSubmitStatus({ type: 'error', message: 'Authentication required. Please log in.' });
      return;
    }

    setIsLoading(true);
    setSubmitStatus(null);

    // Log the data being sent for debugging
    console.log('Form data being sent:', formData);
    console.log('User ID:', userId);

    try {
      const requestBody = {
        ...formData,
        // Ensure all fields are strings and not empty
        companyEmail: formData.companyEmail?.trim() || '',
        companyName: formData.companyName?.trim() || '',
        companyDetails: formData.companyDetails?.trim() || '',
        location: formData.location?.trim() || '',
        phone: formData.phone?.trim() || '',
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
    { name: 'phone', label: 'Phone Number', icon: Phone, type: 'tel', placeholder: '1234567890' },
    { name: 'website', label: 'Website', icon: Globe, type: 'url', placeholder: 'https://yourcompany.com' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className={`max-w-2xl mx-auto transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl mb-6 transform hover:scale-110 transition-transform duration-300">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Join as a Recruiter</h1>
          <p className="text-lg text-gray-600">Register your company and start hiring top talent</p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 backdrop-blur-sm border border-gray-100">
          <div className="space-y-6">

            {/* Input Fields */}
            {inputFields.map((field, index) => {
              const Icon = field.icon;
              return (
                <div
                  key={field.name}
                  className={`transition-all duration-500 transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
                    }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {field.label}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Icon className={`w-5 h-5 transition-colors duration-200 ${errors[field.name] ? 'text-red-400' : 'text-gray-400 group-focus-within:text-indigo-600'
                        }`} />
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

            {/* Company Details Textarea */}
            <div
              className={`transition-all duration-500 transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
                }`}
              style={{ transitionDelay: `${inputFields.length * 100}ms` }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Company Details
              </label>
              <div className="relative group">
                <div className="absolute top-4 left-4 pointer-events-none">
                  <FileText className={`w-5 h-5 transition-colors duration-200 ${errors.companyDetails ? 'text-red-400' : 'text-gray-400 group-focus-within:text-indigo-600'
                    }`} />
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
                  <p className={`text-sm transition-colors duration-200 ${formData.companyDetails.length >= 50 ? 'text-green-600' : 'text-gray-500'
                    }`}>
                    {formData.companyDetails.length}/50 minimum characters
                  </p>
                )}
              </div>
            </div>

            {/* Status Message */}
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
            {/* Submit Button */}
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

          {/* Footer Note */}
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