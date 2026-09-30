import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Loader2, Plus, Star } from 'lucide-react';
import { useAddToCart } from '@/hooks/useAddToCart';
import { flyToCart } from '@/utils/cartFly';
import { formatPrice } from '@/utils/formatPrice';
import { productImages, productPricing, productPath, isOutOfStock } from '@/utils/product';
import { cn } from '@/utils/cn';

const MotionSpan = motion.span;

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=600&fit=crop';

const TEXT = {
  default: { brand: 'text-ink-faint', name: 'text-ink', meta: 'text-ink-faint', price: 'text-ink' },
  deep: { brand: 'text-on-deep-soft', name: 'text-on-deep', meta: 'text-on-deep-soft', price: 'text-on-deep' },
};

/**
 * Storefront product card. The product name is a stretched link, so the whole
 * card navigates while the add button stays its own control.
 */
export default function StoreProductCard({ product, tone = 'default', className, imageClassName }) {
  const addToCart = useAddToCart();
  const imageRef = useRef(null);
  const [status, setStatus] = useState('idle'); // idle | adding | added
  const text = TEXT[tone] || TEXT.default;

  const images = productImages(product);
  const [primary = FALLBACK_IMAGE, secondary] = images;
  const { price, compare, discount } = productPricing(product);
  const soldOut = isOutOfStock(product);

  useEffect(() => {
    if (status !== 'added') return undefined;
    const timer = window.setTimeout(() => setStatus('idle'), 1800);
    return () => window.clearTimeout(timer);
  }, [status]);

  const handleAdd = async () => {
    if (status !== 'idle' || soldOut) return;
    setStatus('adding');
    const added = await addToCart(product, 1);
    if (added) {
      flyToCart(imageRef.current, primary);
      setStatus('added');
    } else {
      setStatus('idle');
    }
  };

  const buttonLabel = soldOut ? 'Sold out' : status === 'added' ? 'Added' : 'Add to cart';

  return (
    <article className={cn('group relative flex h-full flex-col', className)}>
      <div
        className={cn(
          // No `isolate` here: the button must share the article's stacking
          // context to sit above the name's stretched link
          'relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-plate',
          imageClassName
        )}
      >
        <img
          ref={imageRef}
          src={primary}
          alt=""
          loading="lazy"
          decoding="async"
          className={cn(
            'absolute inset-0 h-full w-full object-contain p-[11%] mix-blend-multiply',
            'transition-[transform,opacity] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]',
            secondary && 'group-hover:opacity-0'
          )}
        />
        {secondary && (
          <img
            src={secondary}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full scale-[1.04] object-contain p-[11%] opacity-0 mix-blend-multiply transition-[transform,opacity] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-100 group-hover:opacity-100"
          />
        )}

        <div className="pointer-events-none absolute left-4 top-4 z-[2] flex gap-1.5">
          {discount > 0 && (
            <span className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-medium tabular-nums text-canvas">
              −{discount}%
            </span>
          )}
          {soldOut && (
            <span className="rounded-full bg-surface/85 px-2.5 py-1 text-[11px] font-medium text-ink backdrop-blur">
              Sold out
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={soldOut || status === 'adding'}
          aria-label={`${buttonLabel}: ${product.name}`}
          className={cn(
            'absolute bottom-3.5 right-3.5 z-[2] flex h-11 items-center gap-2 rounded-full pl-3 pr-3 text-[13px] font-medium',
            'shadow-[0_10px_30px_-12px_rgba(14,23,38,0.45)] transition-[background-color,color,padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
            'disabled:cursor-not-allowed',
            status === 'added' ? 'bg-accent text-white' : 'bg-ink text-canvas hover:bg-accent',
            soldOut && 'bg-ink/40 hover:bg-ink/40'
          )}
        >
          <span className="relative flex h-5 w-5 items-center justify-center" aria-hidden="true">
            <AnimatePresence mode="popLayout" initial={false}>
              <MotionSpan
                key={status}
                initial={{ scale: 0.4, opacity: 0, rotate: -45 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.4, opacity: 0, rotate: 45 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="absolute"
              >
                {status === 'adding' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : status === 'added' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4 transition-transform duration-500 group-hover:rotate-90" />
                )}
              </MotionSpan>
            </AnimatePresence>
          </span>
          {/* Label unfolds on hover (pointer devices) and while showing feedback */}
          <span
            className={cn(
              'grid transition-[grid-template-columns,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
              status === 'idle' && !soldOut
                ? 'grid-cols-[0fr] opacity-0 [@media(hover:hover)]:group-hover:grid-cols-[1fr] [@media(hover:hover)]:group-hover:opacity-100'
                : 'grid-cols-[1fr] opacity-100'
            )}
            aria-hidden="true"
          >
            <span className="overflow-hidden whitespace-nowrap pr-1">{buttonLabel}</span>
          </span>
        </button>
      </div>

      <div className="flex flex-1 flex-col px-1 pt-4">
        {product.brand && (
          <p className={cn('text-[11px] font-medium uppercase tracking-[0.18em]', text.brand)}>{product.brand}</p>
        )}
        <h3 className={cn('mt-1.5 line-clamp-2 font-display text-[15px] font-medium leading-snug sm:text-base', text.name)}>
          <Link
            to={productPath(product)}
            className="rounded-sm before:absolute before:inset-0 before:z-[1] before:rounded-[1.75rem] before:content-[''] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            {product.name}
          </Link>
        </h3>
        {product.short_description && (
          <p className={cn('mt-1 line-clamp-1 text-[13px]', text.meta)}>{product.short_description}</p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          {price ? (
            <p className="flex items-baseline gap-2">
              <span className={cn('font-display text-[17px] font-medium tabular-nums', text.price)}>
                {formatPrice(price)}
              </span>
              {compare && (
                <s className={cn('text-[13px] tabular-nums', text.meta)}>
                  <span className="sr-only">Was </span>
                  {formatPrice(compare)}
                </s>
              )}
            </p>
          ) : (
            <span className={cn('text-[13px]', text.meta)}>View details</span>
          )}
          {product.rating != null && Number(product.rating) > 0 && (
            <p className={cn('flex items-center gap-1 text-[13px] tabular-nums', text.meta)}>
              <Star className="h-3.5 w-3.5 fill-current text-amber-500" aria-hidden="true" />
              {Number(product.rating).toFixed(1)}
              <span className="sr-only">out of 5</span>
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

export function StoreProductCardSkeleton({ className }) {
  return (
    <div className={cn('flex flex-col', className)} aria-hidden="true">
      <div className="skeleton-shimmer aspect-[4/5] rounded-[1.75rem]" />
      <div className="skeleton-shimmer mt-4 h-2.5 w-16 rounded-full" />
      <div className="skeleton-shimmer mt-3 h-3.5 w-11/12 rounded-full" />
      <div className="skeleton-shimmer mt-2 h-3.5 w-2/3 rounded-full" />
      <div className="skeleton-shimmer mt-5 h-4 w-20 rounded-full" />
    </div>
  );
}
