import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { drawerSlide, modalOverlay } from '@/animations/variants';

export default function Drawer({ isOpen, onClose, title, children, className }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            {...modalOverlay}
            onClick={onClose}
          />
          <motion.div
            className={cn(
              'ml-auto relative w-full max-w-md bg-white dark:bg-neutral-900 h-full shadow-elevated flex flex-col',
              className
            )}
            {...drawerSlide}
          >
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
            <div className="flex-1 overflow-y-auto p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
