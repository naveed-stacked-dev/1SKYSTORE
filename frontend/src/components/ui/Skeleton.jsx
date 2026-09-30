import { cn } from '@/utils/cn';

export function Skeleton({ className, variant = 'text', ...props }) {
  const base = 'skeleton-shimmer rounded-2xl';
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
    <div className="flex flex-col" aria-hidden="true">
      <div className="skeleton-shimmer aspect-[4/5] rounded-[1.75rem]" />
      <div className="skeleton-shimmer mt-4 h-2.5 w-16 rounded-full" />
      <div className="skeleton-shimmer mt-3 h-3.5 w-11/12 rounded-full" />
      <div className="skeleton-shimmer mt-2 h-3.5 w-2/3 rounded-full" />
      <div className="skeleton-shimmer mt-5 h-4 w-20 rounded-full" />
    </div>
  );
}

export function BlogCardSkeleton() {
  return (
    <div className="rounded-[1.75rem] overflow-hidden bg-surface ring-1 ring-line">
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
