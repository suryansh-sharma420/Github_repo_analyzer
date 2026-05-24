import React from 'react';
import { X } from 'lucide-react';

const ErrorBanner = ({ error, onDismiss }) => {
  if (!error) return null;

  // Determine error type based on error message
  const isErrorType = (type) => {
    const message = error.toLowerCase();
    if (type === '404') return message.includes('404') || message.includes('not found');
    if (type === '429') return message.includes('429') || message.includes('rate limit');
    if (type === '502') return message.includes('502');
    if (type === '504') return message.includes('504') || message.includes('timed out');
    return false;
  };

  let bgColor = 'bg-red-50';
  let borderColor = 'border-red-200';
  let textColor = 'text-red-700';

  if (isErrorType('429')) {
    bgColor = 'bg-orange-50';
    borderColor = 'border-orange-200';
    textColor = 'text-orange-700';
  }

  // Extract rate limit reset time if available
  const rateLimitReset = isErrorType('429') ? error.match(/resets at (.+)/i)?.[1] : null;

  return (
    <div className={`${bgColor} ${borderColor} ${textColor} border px-4 py-3 rounded-lg mb-6 relative`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-medium">{error}</p>
          {rateLimitReset && (
            <p className="text-sm mt-1 opacity-90">Rate limit resets at {rateLimitReset}</p>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="ml-4 hover:opacity-70 transition-opacity"
          aria-label="Dismiss error"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default ErrorBanner;
