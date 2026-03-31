import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { drawerSlide, modalOverlay } from '@/animations/variants';

export default function Drawer({ isOpen, onClose, title, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Overlay */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            {...modalOverlay}
            onClick={onClose}
          />
          {/* Drawer panel */}
          <motion.div
            className="absolute inset-y-0 left-0 w-[300px] sm:w-[360px] bg-white dark:bg-neutral-900 shadow-elevated flex flex-col"
            {...drawerSlide}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-lg font-heading font-semibold text-neutral-900 dark:text-neutral-50">
                {title || 'Menu'}
              </span>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:hover:text-neutral-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
