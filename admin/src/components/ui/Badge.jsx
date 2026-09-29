import { cn } from '@/utils/cn';

export default function Badge({ children, variant = 'default', className }) {
  const variants = {
    default: 'bg-neutral-100 text-neutral-700 ring-neutral-200/70 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700/60',
    primary: 'bg-primary-50 text-primary-700 ring-primary-500/15 dark:bg-primary-500/10 dark:text-primary-400 dark:ring-primary-400/20',
    success: 'bg-success-50 text-success-700 ring-success-500/20 dark:bg-success-500/10 dark:text-success-500 dark:ring-success-500/20',
    warning: 'bg-warning-50 text-warning-700 ring-warning-500/25 dark:bg-warning-500/10 dark:text-warning-500 dark:ring-warning-500/20',
    error: 'bg-error-50 text-error-700 ring-error-500/20 dark:bg-error-500/10 dark:text-error-500 dark:ring-error-500/20',
    info: 'bg-info-50 text-info-700 ring-info-500/20 dark:bg-info-500/10 dark:text-info-500 dark:ring-info-500/20',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
