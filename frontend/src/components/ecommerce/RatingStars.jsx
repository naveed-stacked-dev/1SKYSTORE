import { Star } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function RatingStars({ rating = 0, max = 5, size = 'sm', className }) {
  const sizes = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-5 h-5' };
  const iconSize = sizes[size] || sizes.sm;

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {[...Array(max)].map((_, i) => (
        <Star
          key={i}
          className={cn(
            iconSize,
            i < Math.floor(rating)
              ? 'text-warning-500 fill-warning-500'
              : i < rating
              ? 'text-warning-500 fill-warning-500 opacity-50'
              : 'text-neutral-300 dark:text-neutral-600'
          )}
        />
      ))}
    </div>
  );
}
