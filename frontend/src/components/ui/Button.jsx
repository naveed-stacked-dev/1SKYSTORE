import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { Loader2 } from 'lucide-react';

// Storefront design system: midnight ink pills, brand-blue accent on hover
const variants = {
  primary: 'bg-ink text-canvas hover:bg-accent',
  secondary: 'bg-accent-soft text-accent hover:bg-accent hover:text-white',
  outline: 'text-ink ring-1 ring-inset ring-line hover:bg-ink hover:text-canvas',
  ghost: 'text-ink hover:bg-ink/6',
  danger: 'bg-error-500 text-white hover:bg-error-600',
  link: 'text-accent underline-offset-4 hover:underline p-0 h-auto',
};

const sizes = {
  sm: 'min-h-9 px-4 py-1.5 text-sm rounded-full',
  md: 'min-h-11 px-5 py-2.5 text-sm rounded-full',
  lg: 'min-h-12 px-7 py-3 text-[15px] rounded-full',
  icon: 'h-11 w-11 rounded-full',
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
        'inline-flex items-center justify-center gap-2 font-medium transition-colors duration-300 cursor-pointer',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
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
