"use client"

import React, { useState, useEffect } from 'react';
import { Download, Eye, Search, Filter, Users, FileText, Loader2, X, Backpack } from 'lucide-react';

const AdminResumeDashboard = () => {
    const [resumes, setResumes] = useState([]);
    const [filteredResumes, setFilteredResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFilter, setSelectedFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedResume, setSelectedResume] = useState(null);
    const [resumeViewerError, setResumeViewerError] = useState(false);
    const [displayCount, setDisplayCount] = useState(20);

    const filters = ['All', 'Engineering', 'Design', 'Marketing', 'Product', 'Data'];

    useEffect(() => {
        fetchResumes();
    }, []);

    useEffect(() => {
        filterResumes();
        setDisplayCount(20); // Reset display count when filters change
    }, [selectedFilter, searchTerm, resumes]);

    const fetchResumes = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/all`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            const result = await response.json();

            // Handle different response formats
            let data = result;
            if (result.data) {
                data = result.data;
            } else if (result.users) {
                data = result.users;
            }

            // Ensure data is an array
            if (!Array.isArray(data)) {
                console.error('Response is not an array:', result);
                setResumes([]);
                setFilteredResumes([]);
                return;
            }

            // Extract only resume and resumeFilter from each user
            const resumeData = data.map(user => ({
                id: user.id || user._id,
                name: user.name || 'Unknown',
                email: user.email || '',
                resume: user.resume,
                resumeFilter: user.resumeFilter
            })).filter(item => item.resume); // Only include users with resumes

            setResumes(resumeData);
            setFilteredResumes(resumeData);
        } catch (error) {
            console.error('Error fetching resumes:', error);
            setResumes([]);
            setFilteredResumes([]);
        } finally {
            setLoading(false);
        }
    };

    const filterResumes = () => {
        let filtered = resumes;

        // Filter by category
        if (selectedFilter !== 'All') {
            filtered = filtered.filter(item => item.resumeFilter === selectedFilter);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredResumes(filtered);
    };

    const getOriginalUrl = (url) => {
        // Return the original Cloudinary URL
        return url;
    };

    const getCloudinaryPreviewUrl = (url) => {
        // For images, return as-is
        return url;
    };

    const handleDownload = (resume, name) => {
        const link = document.createElement('a');
        link.href = resume;
        link.download = `${name}_resume.pdf`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleView = (resumeItem) => {
        setSelectedResume(resumeItem.resume);
        setResumeViewerError(false);
    };

    const handleDownloadFromModal = () => {
        if (selectedResume) {
            const link = document.createElement('a');
            link.href = getOriginalUrl(selectedResume);
            link.download = 'resume';
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const closeModal = () => {
        setSelectedResume(null);
        setResumeViewerError(false);
    };

    const handleViewMore = () => {
        setDisplayCount(prevCount => prevCount + 20);
    };

    const displayedResumes = filteredResumes.slice(0, displayCount);
    const hasMore = displayCount < filteredResumes.length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 p-4 md:p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border-t-4 border-blue-700">
                    {/* Back Button */}
                    <button
                        onClick={() => window.history.back()}
                        className="group mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-all duration-300 hover:gap-3"
                    >
                        <svg
                            className="w-5 h-5 transition-transform group-hover:-translate-x-1"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path d="M15 19l-7-7 7-7"></path>
                        </svg>
                        <span>Back</span>
                    </button>

                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-2">Resume Dashboard</h1>
                            <p className="text-gray-600 flex items-center gap-2">
                                <Users size={20} />
                                Manage and review all submitted resumes
                            </p>
                        </div>
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-md transition-all duration-300 hover:scale-105">
                            <div className="text-sm opacity-90">Total Resumes</div>
                            <div className="text-3xl font-bold">{resumes.length}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    {/* Search Bar */}
                    <div className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl text-[#1c398e] focus:outline-none focus:border-blue-900 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Category Filters */}
                    <div className="flex items-center gap-3 mb-2">
                        <Filter size={20} className="text-blue-900" />
                        <span className="font-semibold text-gray-700">Filter by Category:</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {filters.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setSelectedFilter(filter)}
                                className={`px-6 py-2.5 rounded-xl font-medium transition-all transform hover:scale-105 ${selectedFilter === filter
                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                                    : 'bg-blue-50 text-blue-900 hover:bg-blue-100'
                                    }`}
                            >
                                {filter}
                                {filter !== 'All' && (
                                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${selectedFilter === filter
                                        ? 'bg-white text-blue-900'
                                        : 'bg-blue-200 text-blue-900'
                                        }`}>
                                        {resumes.filter(r => r.resumeFilter === filter).length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Results Info */}
            <div className="max-w-7xl mx-auto mb-4">
                <p className="text-gray-600 text-sm">
                    Showing <span className="font-semibold text-blue-900">{displayedResumes.length}</span> of <span className="font-semibold">{filteredResumes.length}</span> resumes
                </p>
            </div>

            {/* Resume Grid */}
            <div className="max-w-7xl mx-auto">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="animate-spin text-blue-900 mb-4" size={48} />
                        <p className="text-gray-600">Loading resumes...</p>
                    </div>
                ) : filteredResumes.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <FileText size={64} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No resumes found</h3>
                        <p className="text-gray-500">Try adjusting your filters or search term</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayedResumes.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 overflow-hidden border-2 border-transparent hover:border-blue-200"
                            >
                                <div className="bg-gradient-to-r from-blue-600 to-blue-600 p-4 text-white">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-bold truncate">{item.name}</h3>
                                            <p className="text-sm opacity-90 truncate">{item.email}</p>
                                        </div>
                                        <FileText size={24} className="flex-shrink-0 ml-2" />
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="mb-4">
                                        <span className="inline-block bg-blue-50 text-[#1c398e] px-4 py-1.5 rounded-full text-sm font-semibold">
                                            {item.resumeFilter || 'Uncategorized'}
                                        </span>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleView(item)}
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Eye size={18} />
                                            View
                                        </button>
                                        <button
                                            onClick={() => handleDownload(item.resume, item.name)}
                                            className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-900 py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Download size={18} />
                                            Download
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* View More Button */}
            {!loading && hasMore && (
                <div className="max-w-7xl mx-auto mt-8 flex justify-center">
                    <button
                        onClick={handleViewMore}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2"
                    >
                        View More
                        <Download size={18} className="rotate-90" />
                    </button>
                </div>
            )}

            {/* Resume Viewer Modal */}
            {selectedResume && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b">
                            <h3 className="text-xl font-bold text-blue-900">Resume Preview</h3>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={handleDownloadFromModal}
                                    className="bg-blue-100 text-blue-900 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center space-x-2 text-sm font-medium"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>Download</span>
                                </button>
                                <button
                                    onClick={closeModal}
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
                                    {selectedResume.toLowerCase().includes('.pdf') || selectedResume.includes('cloudinary') ? (
                                        <iframe
                                            src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(selectedResume)}`}
                                            className="w-full h-full border-none"
                                            title="PDF Resume Preview"
                                            onError={() => setResumeViewerError(true)}
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
                                                className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                                            >
                                                <Eye className="w-4 h-4" />
                                                <span>Open in New Tab</span>
                                            </button>
                                            <button
                                                onClick={handleDownloadFromModal}
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
                                <div
                                    className="absolute inset-0 bg-white flex items-center justify-center pointer-events-none"
                                    style={{
                                        animation: 'fadeOut 3s forwards',
                                        animationDelay: '1s'
                                    }}
                                >
                                    <div className="text-center">
                                        <Loader2 className="w-8 h-8 text-blue-900 animate-spin mx-auto mb-4" />
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

export default AdminResumeDashboard;