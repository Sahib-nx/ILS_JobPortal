"use client";

import React, { useState, useEffect } from 'react';
import { CheckCircle, Mail, Clock, LogOut, Shield } from 'lucide-react';

const PendingApprovalPage = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleLogout = () => {
    setIsLoggingOut(true);
    localStorage.clear();
    
    setTimeout(() => {
      window.location.href = '/';
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#dbeafe] via-blue-50 to-white flex items-center justify-center p-3 xs:p-4 sm:p-6 lg:p-8">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 xs:-top-20 xs:-right-20 sm:-top-40 sm:-right-40 w-32 h-32 xs:w-40 xs:h-40 sm:w-80 sm:h-80 bg-gradient-to-br from-[#1c398e]/10 to-blue-300/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-10 -left-10 xs:-bottom-20 xs:-left-20 sm:-bottom-40 sm:-left-40 w-32 h-32 xs:w-40 xs:h-40 sm:w-80 sm:h-80 bg-gradient-to-br from-blue-400/10 to-[#1c398e]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className={`w-full max-w-[95%] xs:max-w-sm sm:max-w-md lg:max-w-2xl relative z-10 transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="bg-white/80 backdrop-blur-lg rounded-xl xs:rounded-2xl sm:rounded-3xl p-5 xs:p-6 sm:p-8 lg:p-12 shadow-2xl border border-white/50">
          <div className="text-center mb-6 xs:mb-8">
            <div className="w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 xs:mb-6 animate-bounce">
              <CheckCircle className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 text-white" />
            </div>
            
            <h1 className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1c398e] mb-3 xs:mb-4 px-2">
              Registration Submitted Successfully!
            </h1>
            
            <div className="w-12 xs:w-16 h-1 bg-gradient-to-r from-[#1c398e] to-[#3b82f6] rounded-full mx-auto mb-4 xs:mb-6"></div>
          </div>

          <div className="space-y-4 xs:space-y-5 sm:space-y-6 mb-6 xs:mb-8">
            <div className="bg-blue-50/80 rounded-lg xs:rounded-xl p-4 xs:p-5 sm:p-6 border border-blue-100">
              <div className="flex items-start space-x-3 xs:space-x-4">
                <div className="w-10 h-10 xs:w-12 xs:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 xs:w-6 xs:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base xs:text-lg font-semibold text-[#1c398e] mb-1 xs:mb-2">Application Under Review</h3>
                  <p className="text-xs xs:text-sm sm:text-base text-gray-700 leading-relaxed">
                    Your company registration is currently pending approval from our team. This process typically takes 24-48 hours.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50/80 rounded-lg xs:rounded-xl p-4 xs:p-5 sm:p-6 border border-purple-100">
              <div className="flex items-start space-x-3 xs:space-x-4">
                <div className="w-10 h-10 xs:w-12 xs:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 xs:w-6 xs:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base xs:text-lg font-semibold text-[#1c398e] mb-1 xs:mb-2">Check Your Email</h3>
                  <p className="text-xs xs:text-sm sm:text-base text-gray-700 leading-relaxed">
                    Once your application is approved, you'll receive a confirmation email with further instructions.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50/80 rounded-lg xs:rounded-xl p-4 xs:p-5 sm:p-6 border border-green-100">
              <div className="flex items-start space-x-3 xs:space-x-4">
                <div className="w-10 h-10 xs:w-12 xs:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 xs:w-6 xs:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base xs:text-lg font-semibold text-[#1c398e] mb-1 xs:mb-2">Next Steps</h3>
                  <p className="text-xs xs:text-sm sm:text-base text-gray-700 leading-relaxed">
                    After approval, log back into your account to access full recruiter features and start posting jobs.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-blue-200 pt-5 xs:pt-6">
            <p className="text-center text-gray-600 mb-4 xs:mb-6 text-xs xs:text-sm sm:text-base px-2">
              Please logout from your account and wait for the approval email before attempting to access recruiter features.
            </p>
            
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full bg-gradient-to-r from-[#1c398e] to-[#3b82f6] text-white py-3 xs:py-4 rounded-lg xs:rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-[1.02] font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm xs:text-base"
            >
              {isLoggingOut ? (
                <span>Logging out...</span>
              ) : (
                <>
                  <LogOut className="w-4 h-4 xs:w-5 xs:h-5" />
                  <span>Logout</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-4 xs:mt-6 text-center px-2">
            <p className="text-xs sm:text-sm text-gray-500">
              Need help? Contact us at{' '}
              <a href="mailto:support@ils.com" className="text-[#1c398e] hover:text-blue-600 font-semibold transition-colors break-all">
                support@ils.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingApprovalPage;