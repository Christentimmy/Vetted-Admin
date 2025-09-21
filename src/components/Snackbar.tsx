import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, X } from 'lucide-react';

export interface SnackbarProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  type: 'success' | 'error';
  duration?: number;
}

const Snackbar: React.FC<SnackbarProps> = ({
  isOpen,
  onClose,
  message,
  type,
  duration = 4000
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!isOpen) return;

    // Reset progress when snackbar opens
    setProgress(100);

    // Start progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (duration / 50));
        return newProgress <= 0 ? 0 : newProgress;
      });
    }, 50);

    // Auto close after duration
    const timeout = setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timeout);
    };
  }, [isOpen, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800 dark:text-green-200';
      case 'error':
        return 'text-red-800 dark:text-red-200';
      default:
        return 'text-gray-800 dark:text-gray-200';
    }
  };

  const getProgressColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed bottom-4 right-4 z-50 max-w-sm w-full"
        >
          <div className={`relative overflow-hidden rounded-xl border shadow-lg backdrop-blur-sm ${getBackgroundColor()}`}>
            {/* Progress bar */}
            <div className="absolute top-0 left-0 h-1 w-full bg-gray-200 dark:bg-gray-700">
              <motion.div
                className={`h-full ${getProgressColor()}`}
                initial={{ width: '100%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.05, ease: 'linear' }}
              />
            </div>

            {/* Content */}
            <div className="p-4 pr-12">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {getIcon()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${getTextColor()}`}>
                    {message}
                  </p>
                </div>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Snackbar;