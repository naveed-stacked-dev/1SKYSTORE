import { cn } from '@/utils/cn';

export default function Badge({ children, variant = 'default', className }) {
  const variants = {
    default: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
    primary: 'bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400',
    success: 'bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-500',
    warning: 'bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-500',
    error: 'bg-error-50 text-error-700 dark:bg-error-500/10 dark:text-error-500',
    info: 'bg-info-50 text-info-700 dark:bg-info-500/10 dark:text-info-500',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
