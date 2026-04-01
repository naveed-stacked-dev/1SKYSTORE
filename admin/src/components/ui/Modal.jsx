import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { modalOverlay, modalContent } from '@/animations/variants';

export default function Modal({ isOpen, onClose, title, children, className, size = 'md' }) {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            {...modalOverlay}
            onClick={onClose}
          />
          <motion.div
            className={cn(
              'relative w-full bg-white dark:bg-neutral-900 rounded-2xl shadow-elevated overflow-hidden max-h-[90vh] flex flex-col',
              sizes[size],
              className
            )}
            {...modalContent}
          >
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
                <h3 className="text-lg font-heading font-semibold text-neutral-900 dark:text-neutral-50">
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:hover:text-neutral-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
            <div className="p-6 overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
