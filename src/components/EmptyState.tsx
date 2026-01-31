import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title: string;
  description: string;
  icon: ReactNode;
  actionText?: string;
  actionLink?: string;
  actionFn?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionText,
  actionLink,
  actionFn
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
        {icon}
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      
      <p className="text-gray-600 mb-8 max-w-md">{description}</p>
      
      {actionText && (actionLink || actionFn) && (
        actionLink ? (
          <Link
            to={actionLink}
            className="px-5 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            {actionText}
          </Link>
        ) : (
          <button
            onClick={actionFn}
            className="px-5 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            {actionText}
          </button>
        )
      )}
    </div>
  );
};

export default EmptyState;