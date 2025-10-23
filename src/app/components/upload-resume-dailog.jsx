"use client"

import React, { useState } from 'react';
import { Upload, X, FileText, Check, AlertCircle } from 'lucide-react';

export const UploadResumeDialog = ({ isOpen, onClose, userId, authToken, onUploadSuccess }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [resumeFilter, setResumeFilter] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null);
    const [toast, setToast] = useState(null);

    const resumeCategories = ['Engineering', 'Design', 'Marketing', 'Product', 'Data'];
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const allowedMimeTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    const showToast = (message, type = 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const validateFile = (file) => {
        if (!file) return false;

        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        const isValidType = allowedMimeTypes.includes(file.type) || allowedTypes.includes(fileExtension);

        if (!isValidType) {
            showToast('Invalid file type. Please upload PDF, DOC, or DOCX files only.');
            return false;
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            showToast('File size exceeds 5MB. Please upload a smaller file.');
            return false;
        }

        return true;
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file && validateFile(file)) {
            setSelectedFile(file);
            setUploadStatus(null);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file && validateFile(file)) {
            setSelectedFile(file);
            setUploadStatus(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            showToast('Please select a file to upload.');
            return;
        }

        if (!resumeFilter) {
            showToast('Please select a resume category.');
            return;
        }

        setIsUploading(true);
        setUploadStatus(null);

        try {
            const formData = new FormData();
            formData.append('resume', selectedFile);
            formData.append('resumeFilter', resumeFilter);

            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/${userId}/edit`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Upload failed');
            }

            const data = await response.json();

            setUploadStatus('success');

            // showToast('Resume uploaded successfully!', 'success');

            // After successful upload, fetch the updated user data to get resume details
            if (onUploadSuccess) {
                try {
                    // Fetch updated user data from the server
                    const userResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/${userId}`, {
                        headers: {
                            'Authorization': `Bearer ${authToken}`
                        }
                    });

                    if (userResponse.ok) {
                        const userData = await userResponse.json();
                        console.log('✅ Fetched updated user data:', userData);

                        if (userData.resume) {
                            console.log('✅ Resume found, updating UI:', userData.resume);
                            onUploadSuccess(userData.resume);
                        } else {
                            console.warn('⚠️ No resume in user data');
                        }
                    }
                } catch (fetchError) {
                    console.error('Error fetching updated user data:', fetchError);
                }
            }

            setTimeout(() => {
                handleClose();
            }, 1500);

        } catch (error) {
            console.error('Upload error:', error);
            setUploadStatus('error');
            showToast(error.message || 'Failed to upload resume. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        setResumeFilter('');
        setUploadStatus(null);
        setIsDragging(false);
        onClose();
    };

    const removeFile = () => {
        setSelectedFile(null);
        setUploadStatus(null);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Toast Notification */}
            {toast && (
                <div className="fixed top-4 right-4 z-[60] animate-slide-in">
                    <div className={`flex items-start space-x-3 px-6 py-4 rounded-xl shadow-2xl border-l-4 ${toast.type === 'success'
                        ? 'bg-green-50 border-green-500'
                        : 'bg-red-50 border-red-500'
                        }`}>
                        {toast.type === 'success' ? (
                            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                            <p className={`text-sm font-medium ${toast.type === 'success' ? 'text-green-900' : 'text-red-900'
                                }`}>
                                {toast.message}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Dialog Overlay */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full relative overflow-hidden animate-scale-in">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#1c398e] to-indigo-900 px-8 py-6 relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
                        <div className="relative">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                        <Upload className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Upload Resume</h2>
                                        <p className="text-blue-100 text-sm mt-1">Share your latest resume with potential employers</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                    disabled={isUploading}
                                >
                                    <X className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-6">

                        {/* Resume Category Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-3">
                                Resume Category <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    value={resumeFilter}
                                    onChange={(e) => setResumeFilter(e.target.value)}
                                    disabled={isUploading}
                                    className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 font-medium focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all duration-200 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <option value="">Select a category</option>
                                    {resumeCategories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* File Upload Area */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-3">
                                Resume File <span className="text-red-500">*</span>
                            </label>

                            {!selectedFile ? (
                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${isDragging
                                        ? 'border-blue-500 bg-blue-50 scale-[1.02]'
                                        : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                                        }`}
                                >
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={handleFileSelect}
                                        disabled={isUploading}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                    />

                                    <div className="pointer-events-none">
                                        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <Upload className="w-8 h-8 text-blue-600" />
                                        </div>
                                        <p className="text-gray-900 font-semibold mb-2">
                                            {isDragging ? 'Drop your file here' : 'Click to upload or drag and drop'}
                                        </p>
                                        <p className="text-sm text-gray-500 mb-3">
                                            PDF, DOC, or DOCX (Max 5MB)
                                        </p>
                                        <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
                                            {allowedTypes.map((type, index) => (
                                                <React.Fragment key={type}>
                                                    <span className="font-medium">{type.toUpperCase()}</span>
                                                    {index < allowedTypes.length - 1 && <span>•</span>}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="border-2 border-green-200 bg-green-50 rounded-xl p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-4 flex-1 min-w-0">
                                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <FileText className="w-6 h-6 text-green-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-900 truncate">
                                                    {selectedFile.name}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                                {uploadStatus === 'success' && (
                                                    <div className="flex items-center space-x-2 mt-2">
                                                        <Check className="w-4 h-4 text-green-600" />
                                                        <span className="text-sm text-green-700 font-medium">Upload successful!</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {!isUploading && uploadStatus !== 'success' && (
                                            <button
                                                onClick={removeFile}
                                                className="p-2 hover:bg-red-100 rounded-lg transition-colors flex-shrink-0"
                                            >
                                                <X className="w-5 h-5 text-red-600" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Info Box */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <div className="flex items-start space-x-3">
                                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-blue-900 space-y-1">
                                    <p className="font-medium">Important:</p>
                                    <ul className="list-disc list-inside space-y-1 text-blue-800">
                                        <li>Ensure your resume is up-to-date and relevant</li>
                                        <li>Choose the category that best matches your resume</li>
                                        <li>Only PDF, DOC, and DOCX formats are accepted</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex items-center justify-end space-x-3">
                        <button
                            onClick={handleClose}
                            disabled={isUploading}
                            className="px-6 py-3 font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpload}
                            disabled={isUploading || !selectedFile || !resumeFilter || uploadStatus === 'success'}
                            className="px-8 py-3 font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
                        >
                            {isUploading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Uploading...</span>
                                </>
                            ) : uploadStatus === 'success' ? (
                                <>
                                    <Check className="w-5 h-5" />
                                    <span>Uploaded</span>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-5 h-5" />
                                    <span>Upload Resume</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes slide-in {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }

                @keyframes fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes scale-in {
                    from {
                        transform: scale(0.95);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }

                .animate-slide-in {
                    animation: slide-in 0.3s ease-out;
                }

                .animate-fade-in {
                    animation: fade-in 0.2s ease-out;
                }

                .animate-scale-in {
                    animation: scale-in 0.2s ease-out;
                }
            `}</style>
        </>
    );
};