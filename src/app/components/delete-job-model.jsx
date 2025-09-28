"use client"

import { useState } from "react";
import {
 Loader2, Trash2, X, AlertTriangle
} from 'lucide-react';

// Delete Job Modal Component
export const DeleteJobModal = ({ isOpen, onClose, jobId, jobTitle, onDeleteSuccess }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');


  const handleDeleteJob = async () => {
    setIsDeleting(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:4441/api/job/${jobId}/delete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            await response.json();
          } catch {
            // If JSON parsing fails but response is ok, still consider it success
            console.warn('Delete response was OK but not valid JSON');
          }
        }
        onDeleteSuccess(jobId);
        onClose();
      } else {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            setError(errorData.message || 'Failed to delete job');
          } catch {
            setError(`Failed to delete job (Status: ${response.status})`);
          }
        } else {
          setError(`Failed to delete job (Status: ${response.status})`);
        }
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm  flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Delete Job Posting</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-3">
            Are you sure you want to delete this job posting?
          </p>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="font-medium text-gray-900 truncate">{jobTitle}</p>
          </div>
          <p className="text-sm text-red-600 mt-3">
            This action cannot be undone. All applications for this job will also be removed.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteJob}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete Job</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};




