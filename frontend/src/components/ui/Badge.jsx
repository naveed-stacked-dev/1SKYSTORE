import { cn } from '@/utils/cn';

const variants = {
  default: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  primary: 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
  success: 'bg-success-50 text-success-700',
  error: 'bg-error-50 text-error-700',
  warning: 'bg-warning-50 text-warning-700',
  info: 'bg-info-50 text-info-700',
};

export default function Badge({ children, variant = 'default', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
