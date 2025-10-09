'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GoogleCallback() {
  const router = useRouter();
  const [status, setStatus] = useState('processing');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const name = urlParams.get('name');
    const email = urlParams.get('email');
    const role = urlParams.get('role');
    const id = urlParams.get('id');
    const flow = urlParams.get('flow'); // recruiter or jobseeker

    if (token) {
      // ✅ Store all in localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('name', name);
      localStorage.setItem('email', email);
      localStorage.setItem('userRole', role);
      if (id) localStorage.setItem('userId', id);

      setStatus('success');


      // ✅ Decide where to send the user
      setTimeout(() => {
        if (flow === 'recruiter') {
          // Recruiter starts onboarding flow
          router.replace('/recruiter-form');
        } else {
          // Jobseeker goes to dashboard or home
          router.replace('/');
        }
      }, 1500);
    } else {
      // ❌ Token missing
      setStatus('error');
      setTimeout(() => {
        router.replace('/login?error=missing_token');
      }, 2000);
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #93c5fd 50%, #3b82f6 100%)' }}>
      <div className="relative">
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full opacity-20" style={{ backgroundColor: '#1c398e' }}></div>
        <div className="absolute -bottom-20 -right-20 w-32 h-32 rounded-full opacity-20" style={{ backgroundColor: '#1c398e' }}></div>

        {/* Main card */}
        <div className="relative bg-white rounded-2xl shadow-2xl p-12 max-w-md mx-4" style={{ boxShadow: '0 25px 50px -12px rgba(28, 57, 142, 0.25)' }}>
          {status === 'processing' && (
            <div className="text-center">
              {/* Animated logo/icon */}
              <div className="mb-8 relative inline-block">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto" style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #3b82f6 100%)' }}>
                  <svg className="w-10 h-10 text-white animate-spin" style={{ animation: 'spin 1s linear infinite' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                {/* Pulse effect */}
                <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: '#3b82f6' }}></div>
              </div>

              <h2 className="text-3xl font-bold mb-3" style={{ color: '#1c398e' }}>
                Signing you in
              </h2>
              <p className="text-gray-600 text-lg mb-6">
                Connecting with Google...
              </p>

              {/* Progress dots */}
              <div className="flex justify-center gap-2">
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#3b82f6', animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#3b82f6', animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#3b82f6', animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              {/* Success checkmark */}
              <div className="mb-8">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: '#10b981' }}>
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>

              <h2 className="text-3xl font-bold mb-3" style={{ color: '#1c398e' }}>
                Success!
              </h2>
              <p className="text-gray-600 text-lg">
                Redirecting you now...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              {/* Error icon */}
              <div className="mb-8">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: '#ef4444' }}>
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </div>
              </div>

              <h2 className="text-3xl font-bold mb-3" style={{ color: '#1c398e' }}>
                Authentication Failed
              </h2>
              <p className="text-gray-600 text-lg">
                Redirecting to login...
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}