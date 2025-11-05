import React, { useEffect } from 'react';

export type ToastType = 'info' | 'warning' | 'error' | 'success';

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeStyles = {
    info: 'bg-info/20 border-info/30 text-info',
    warning: 'bg-warning/20 border-warning/30 text-warning',
    error: 'bg-error/20 border-error/30 text-error',
    success: 'bg-success/20 border-success/30 text-success',
  };

  const icons = {
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌',
    success: '✅',
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div className={`flex items-start p-4 border rounded-lg shadow-lg min-w-80 max-w-md ${typeStyles[type]}`}>
        <div className="text-2xl mr-3">{icons[type]}</div>
        <div className="flex-1">
          <div className="font-semibold text-text-primary">{message}</div>
        </div>
        <button
          onClick={onClose}
          className="ml-3 text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default Toast;

