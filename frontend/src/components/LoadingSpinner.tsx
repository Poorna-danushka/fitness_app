import React from 'react';
import { Loader } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  fullScreen = false,
  message,
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <Loader className={`${sizeClasses[size]} animate-spin text-blue-500`} />
      {message && <p className="text-gray-600">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg">
          {spinner}
        </div>
      </div>
    );
  }

  return spinner;
};

/**
 * Skeleton Loader Component
 */
export const SkeletonLoader: React.FC<{
  width?: string;
  height?: string;
  count?: number;
  circle?: boolean;
}> = ({ width = 'w-full', height = 'h-4', count = 1, circle = false }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${width} ${height} ${circle ? 'rounded-full' : 'rounded'} bg-gray-200 animate-pulse`}
        />
      ))}
    </div>
  );
};

export default LoadingSpinner;
