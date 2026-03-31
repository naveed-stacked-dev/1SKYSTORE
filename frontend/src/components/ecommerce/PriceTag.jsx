import { useGeo } from '@/context/GeoContext';
import { cn } from '@/utils/cn';

export default function PriceTag({ priceInr, priceUsd, price, className, size = 'md' }) {
  const { getPrice, currency, formatPrice: fmtPrice } = useGeo();

  const sizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const displayPrice = price != null
    ? fmtPrice(price)
    : getPrice(priceInr, priceUsd);

  return (
    <span className={cn('font-semibold text-neutral-900 dark:text-neutral-50', sizes[size], className)}>
      {displayPrice}
    </span>
  );
}
