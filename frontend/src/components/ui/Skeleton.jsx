import { cn } from '@/utils/cn';

export function Skeleton({ className, variant = 'text', ...props }) {
  const base = 'skeleton-shimmer rounded-xl animate-pulse';
  const variants = {
    text: 'h-4 w-full',
    title: 'h-6 w-3/4',
    avatar: 'h-10 w-10 rounded-full',
    image: 'h-48 w-full',
    card: 'h-64 w-full',
    button: 'h-10 w-24',
    line: 'h-3 w-full',
  };

  return (
    <div
      className={cn(base, variants[variant], className)}
      {...props}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
      <Skeleton variant="image" className="h-56 rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton variant="line" className="w-1/3" />
        <Skeleton variant="title" />
        <Skeleton variant="text" className="w-1/2" />
        <div className="flex justify-between pt-2">
          <Skeleton variant="button" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function BlogCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
      <Skeleton variant="image" className="h-48 rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton variant="line" className="w-1/4" />
        <Skeleton variant="title" />
        <Skeleton variant="text" />
        <Skeleton variant="text" className="w-2/3" />
      </div>
    </div>
  );
}
