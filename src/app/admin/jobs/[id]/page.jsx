"use client"


import React, { useState, useEffect } from 'react';
import {
  Eye, Users, MapPin, Briefcase, Search,
  Calendar, Mail, Phone, Download, ArrowLeft,
  Loader2, MoreVertical
} from 'lucide-react';
import { useParams } from 'next/navigation';

const Page = () => {
  const [jobData, setJobData] = useState(null);
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const params = useParams();
  const jobId = params.id;

  // Fetch job applications
  useEffect(() => {
    const fetchJobApplications = async () => {
      setIsLoading(true);
      try {

        const userId = getUserId(); // Replace with actual user ID from auth


        const response = await fetch(`http://localhost:4441/api/job/${jobId}/applications?userId=${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Add auth header
          }
        });

        if (response.ok) {
          const data = await response.json();
          setJobData(data.job);
          setApplications(data.applications);
        } else {
          console.error('Failed to fetch job applications');
        }

      } catch (error) {
        console.error('Error fetching job applications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (jobId) {
      fetchJobApplications();
    }
  }, [jobId]);

  const getUserId = () => {
    const token = localStorage.getItem('authToken');
    if (!token) return null;

    try {
      const payloadBase64 = token.split('.')[1]; // JWT payload
      const decoded = JSON.parse(atob(payloadBase64));
      console.log('Decoded JWT:', decoded.UserId);
      return decoded.UserId;
    } catch (err) {
      console.error('Invalid token', err);
      return null;
    }

  };

  const filteredApplications = applications.filter(app =>
    app.applicantId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.applicantId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#dbeafe] via-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#1c398e] animate-spin mx-auto mb-4" />
          <p className="text-blue-600 font-medium">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#dbeafe] via-blue-50 to-white">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.href = '/admin'}
                className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-[#1c398e]" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-[#1c398e]">{jobData?.title || 'Job Applications'}</h1>
                <p className="text-xs text-blue-600">{applications.length} applications received</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Job Info Card */}
        {jobData && (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 mb-8 shadow-lg border border-white/50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#1c398e] mb-2">{jobData.title}</h2>
                <div className="flex items-center space-x-6 text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1 text-blue-400" />
                    {jobData.location}
                  </div>
                  <div className="flex items-center">
                    <Briefcase className="w-4 h-4 mr-1 text-blue-400" />
                    {jobData.jobType}
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-gradient-to-r from-[#1c398e] to-[#3b82f6] text-white px-6 py-3 rounded-lg">
                  <div className="text-2xl font-bold">{applications.length}</div>
                  <div className="text-sm">Applications</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 mb-8 shadow-lg border border-white/50 text-[#1c398e] ">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search applications by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/80 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1c398e] focus:border-transparent transition-all duration-300"
            />
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/50">
          <div className="divide-y divide-blue-100">
            {filteredApplications.map((application, index) => (
              <div key={application._id || index} className="p-6 hover:bg-blue-50/50 transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#1c398e] to-[#3b82f6] rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {application.applicantId?.name?.charAt(0).toUpperCase() || 'A'}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-[#1c398e]">
                          {application.applicantId?.name || 'Anonymous Applicant'}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-1 text-blue-400" />
                            {application.applicantId?.email || 'No email'}
                          </div>
                          {application.applicantId?.phone && (
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 mr-1 text-blue-400" />
                              {application.applicantId.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Application Details */}
                    {application.experience && (
                      <div className="mb-3">
                        <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                          Experience: {application.experience}
                        </span>
                      </div>
                    )}

                    {application.coverLetter && (
                      <div className="mb-3">
                        <p className="text-gray-700 text-sm line-clamp-2">
                          <strong>Cover Letter:</strong> {application.coverLetter}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        Applied {application.appliedDate ? new Date(application.appliedDate).toLocaleDateString() :
                          application.createdAt ? new Date(application.createdAt).toLocaleDateString() : 'Recently'}
                      </div>
                      {application.status && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${application.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          application.status === 'reviewed' ? 'bg-blue-100 text-blue-700' :
                            application.status === 'accepted' ? 'bg-green-100 text-green-700' :
                              'bg-gray-100 text-gray-700'
                          }`}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 ml-6">
                    {application.resume && (
                      <button
                        onClick={() => {
                          // TODO: Handle resume download
                          window.open(application.resume, '_blank');
                        }}
                        className="bg-blue-100 text-[#1c398e] px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center space-x-2 text-sm font-medium"
                      >
                        <Download className="w-4 h-4" />
                        <span>Resume</span>
                      </button>
                    )}

                    <button className="bg-gradient-to-r from-[#1c398e] to-[#3b82f6] text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 font-medium flex items-center space-x-2 text-sm">
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>

                    <div className="relative">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                      {/* TODO: Add dropdown menu for actions (Accept, Reject, etc.) */}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredApplications.length === 0 && (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-500 mb-2">
                {applications.length === 0 ? 'No applications yet' : 'No applications found'}
              </h3>
              <p className="text-gray-400">
                {applications.length === 0
                  ? 'Applications will appear here as candidates apply for this position'
                  : 'Try adjusting your search terms'
                }
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Page;