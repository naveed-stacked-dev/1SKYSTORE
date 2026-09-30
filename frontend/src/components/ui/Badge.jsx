import { cn } from '@/utils/cn';

const variants = {
  default: 'bg-mist text-ink-soft',
  primary: 'bg-accent-soft text-accent',
  success: 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500',
  error: 'bg-error-50 text-error-700 dark:bg-error-500/15 dark:text-error-500',
  warning: 'bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-500',
  info: 'bg-info-50 text-info-700 dark:bg-info-500/15 dark:text-info-500',
};

export default function Badge({ children, variant = 'default', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
