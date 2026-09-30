import { Sun, Moon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/utils/cn';

const MotionSpan = motion.span;

export default function ThemeToggle({ className }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full text-ink transition-colors duration-300 hover:bg-ink/[0.06]',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        className
      )}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <MotionSpan
          key={theme}
          initial={{ rotate: -90, y: 14, opacity: 0 }}
          animate={{ rotate: 0, y: 0, opacity: 1 }}
          exit={{ rotate: 90, y: -14, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </MotionSpan>
      </AnimatePresence>
    </button>
  );
}
