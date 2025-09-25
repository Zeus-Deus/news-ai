import React from "react";

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-secondary-50 dark:bg-dark-secondary-900 transition-colors duration-200">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 dark:border-dark-primary-700"></div>
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-600 border-t-transparent absolute top-0 left-0"></div>
      </div>
      <div className="mt-6 text-center">
        <h2 className="text-xl font-display font-semibold text-secondary-900 dark:text-dark-secondary-100 mb-2">
          Loading Articles
        </h2>
        <p className="text-secondary-600 dark:text-dark-secondary-400">
          Fetching the latest AI-summarized news...
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
