import { cn } from '@/utils/cn';
import { formatPrice } from '@/utils/formatPrice';

export default function PriceTag({ priceInr, priceUsd, price, className, size = 'md' }) {
  const sizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const displayPrice = price != null
    ? formatPrice(price)
    : formatPrice(priceUsd ?? priceInr);

  return (
    <span className={cn('font-semibold text-neutral-900 dark:text-neutral-50', sizes[size], className)}>
      {displayPrice}
    </span>
  );
}
