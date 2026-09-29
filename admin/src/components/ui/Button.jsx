import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-glow hover:from-primary-600 hover:to-primary-700 hover:shadow-glow-lg',
  secondary: 'bg-secondary-200 text-primary-800 hover:bg-secondary-300',
  outline: 'border border-neutral-200 bg-white text-neutral-700 shadow-sm hover:bg-neutral-50 hover:border-neutral-300 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800',
  ghost: 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800',
  danger: 'bg-error-500 text-white hover:bg-error-600',
  success: 'bg-success-500 text-white hover:bg-success-600',
  link: 'text-primary-500 hover:text-primary-600 underline-offset-4 hover:underline p-0 h-auto',
};

const sizes = {
  xs: 'px-2.5 py-1 text-xs rounded-lg',
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
  icon: 'p-2 rounded-xl',
};

const Button = forwardRef(({
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  ...props
}, ref) => {
  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.97 }}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 cursor-pointer',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </motion.button>
  );
});

Button.displayName = 'Button';
export default Button;
