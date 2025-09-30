"use client"

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
    ArrowLeft, Save,
    CheckCircle, AlertCircle, Loader2
} from 'lucide-react';

const Page = () => {
    const { id } = useParams(); // Get jobId from URL params
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        phone: '',
        jobType: 'Engineering',
        jobStatus: 'active'
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    // Fetch existing job data when component mounts
    useEffect(() => {
        fetchJobData();
    }, [id]);

    const fetchJobData = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/job/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (response.ok) {
                const jobData = await response.json();
                setFormData({
                    title: jobData.title || '',
                    description: jobData.description || '',
                    location: jobData.location || '',
                    phone: jobData.phone || '',
                    jobType: jobData.jobType || 'Engineering',
                    jobStatus: jobData.jobStatus || 'active'
                });
            } else {
                setError('Failed to fetch job data');
            }
        } catch (error) {
            console.error('Error fetching job:', error);
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Update job posting
    const handleUpdateJob = async () => {
        setIsSubmitting(true);
        setError('');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/job/${id}/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    location: formData.location,
                    phone: formData.phone,
                    jobStatus: formData.jobStatus
                })
            });

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => {
                    window.location.href = `/recruiter/jobs/${id}`;
                }, 2000);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to update job posting');
            }

        } catch (error) {
            console.error('Error updating job:', error);
            setError('Network error. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#dbeafe] via-blue-50 to-white flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-[#1c398e] animate-spin mx-auto mb-4" />
                    <p className="text-[#1c398e] text-lg">Loading job details...</p>
                </div>
            </div>
        );
    }

    // Success state
    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#dbeafe] via-blue-50 to-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                        <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-[#1c398e] mb-4">Job Updated Successfully!</h2>
                    <p className="text-blue-600 mb-6">Your job posting has been updated with the new information.</p>
                    <div className="flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-[#1c398e] animate-spin mr-2" />
                        <span className="text-[#1c398e]">Redirecting to job details...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#dbeafe] via-blue-50 to-white">
            {/* Header */}
            <header className="bg-white/90 backdrop-blur-lg border-b border-blue-100">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => window.history.back()}
                                className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-[#1c398e]" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-[#1c398e]">Edit Job Posting</h1>
                                <p className="text-xs text-blue-600">Update job details and status</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-lg border border-white/50">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-[#1c398e] mb-2">
                                Job Title *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1c398e] focus:border-transparent transition-all duration-300 text-[#1c398e]"
                                placeholder="e.g. Senior Frontend Developer"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-[#1c398e] mb-2">
                                    Location *
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1c398e] focus:border-transparent transition-all duration-300 text-[#1c398e]"
                                    placeholder="e.g. India, Remote, etc."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#1c398e] mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1c398e] focus:border-transparent transition-all duration-300 text-[#1c398e]"
                                    placeholder="e.g. +91 9876543210"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#1c398e] mb-2">
                                    Job Type *
                                </label>
                                <select
                                    name="jobType"
                                    value={formData.jobType}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1c398e] focus:border-transparent transition-all duration-300 text-[#1c398e]"
                                >
                                    <option value="Engineering">Engineering</option>
                                    <option value="Design">Design</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Product">Product</option>
                                    <option value="Data">Data</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#1c398e] mb-2">
                                Job Status *
                            </label>
                            <div className="flex flex-wrap gap-4">
                                <label className="flex items-center space-x-2 cursor-pointer bg-white p-3 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors">
                                    <input
                                        type="radio"
                                        name="jobStatus"
                                        value="active"
                                        checked={formData.jobStatus === 'active'}
                                        onChange={handleInputChange}
                                        className="w-4 h-4 text-[#1c398e] border-blue-300 focus:ring-[#1c398e]"
                                    />
                                    <span className="text-sm text-[#1c398e] font-medium">Active</span>
                                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Open for applications</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer bg-white p-3 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors">
                                    <input
                                        type="radio"
                                        name="jobStatus"
                                        value="closed"
                                        checked={formData.jobStatus === 'closed'}
                                        onChange={handleInputChange}
                                        className="w-4 h-4 text-[#1c398e] border-blue-300 focus:ring-[#1c398e]"
                                    />
                                    <span className="text-sm text-[#1c398e] font-medium">Closed</span>
                                    <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">No longer accepting</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#1c398e] mb-2">
                                Job Description *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                                rows={10}
                                className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1c398e] focus:border-transparent transition-all duration-300 resize-none text-[#1c398e]"
                                placeholder="Describe the job role, responsibilities, requirements, benefits, etc..."
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {formData.description.length} characters
                            </p>
                        </div>

                        <div className="flex space-x-4">
                            <button
                                type="button"
                                onClick={() => window.history.back()}
                                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-all duration-300 font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleUpdateJob}
                                disabled={isSubmitting}
                                className="flex-1 bg-gradient-to-r from-[#1c398e] to-[#3b82f6] text-white py-3 rounded-lg hover:shadow-lg transition-all duration-300 font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Updating Job...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        <span>Update Job Posting</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Page;