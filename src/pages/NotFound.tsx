import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
        <Search className="w-12 h-12 text-blue-600" />
      </div>
      
      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">Page Not Found</h2>
      
      <p className="text-gray-600 max-w-md mb-8">
        The page you are looking for might have been removed, had its name changed,
        or is temporarily unavailable.
      </p>
      
      <div className="flex space-x-4">
        <Link
          to="/"
          className="px-5 py-2 flex items-center bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          <Home size={18} className="mr-2" />
          Go Home
        </Link>
        
        <Link
          to="/dashboard"
          className="px-5 py-2 flex items-center bg-white border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;