import { cn } from '@/utils/cn';

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800',
        className
      )}
      {...props}
    />
  );
}

export function SkeletonCard({ className }) {
  return (
    <div className={cn('rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-5', className)}>
      <Skeleton className="h-4 w-24 mb-3" />
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}
