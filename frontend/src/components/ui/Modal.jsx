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
          {/* Overlay */}
          <motion.div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            {...modalOverlay}
            onClick={onClose}
          />
          {/* Content */}
          <motion.div
            className={cn(
              'relative w-full bg-surface rounded-[1.75rem] shadow-[0_40px_100px_-30px_rgba(14,23,38,0.5)] ring-1 ring-line overflow-hidden',
              sizes[size],
              className
            )}
            {...modalContent}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-line">
                <h3 className="font-display text-lg font-medium tracking-[-0.02em] text-ink">
                  {title}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-ink-faint hover:text-ink hover:bg-ink/6 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
            {/* Body */}
            <div className="max-h-[calc(100dvh-9rem)] overflow-y-auto overscroll-contain p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
