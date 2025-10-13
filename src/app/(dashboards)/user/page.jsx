import { UserDashboard } from '@/app/components/user-dashboard';
import { Suspense } from 'react';

const LoadingFallback = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-blue-600 font-medium">Loading User Dashboard...</p>
      </div>
    </div>
  );
};

const Page = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <UserDashboard />
    </Suspense>
  );
}

export default Page;