import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight, Check, Loader2, Plus } from 'lucide-react';
import { revealGroup, revealUp, IN_VIEW } from '@/animations/variants';
import { useBestsellers } from '@/hooks/useStoreData';
import { useAddToCart } from '@/hooks/useAddToCart';
import { flyToCart } from '@/utils/cartFly';
import { formatPrice } from '@/utils/formatPrice';
import { isOutOfStock, productImages, productPath, productPricing } from '@/utils/product';
import { cn } from '@/utils/cn';
import StoreProductCard, { StoreProductCardSkeleton } from './StoreProductCard';
import SectionHeading from './ui/SectionHeading';
import Accent from './ui/Accent';
import PillLink from './ui/PillLink';
import StatusMessage from './ui/StatusMessage';
import { CONTAINER } from './ui/styles';

const MotionDiv = motion.div;
const MotionSection = motion.section;

export default function Bestsellers() {
  const { data, loading, error, retry } = useBestsellers();
  const section = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: section, offset: ['start end', 'start 0.25'] });

  // The dark block grows from an inset card to full bleed as it arrives
  const inset = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [4, 0]);
  const radius = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [48, 0]);
  const clipPath = useTransform(() => `inset(0% ${inset.get()}% 0% ${inset.get()}% round ${radius.get()}px)`);

  const products = data || [];
  if (!loading && !error && !products.length) return null;

  const [lead, ...rest] = products;

  return (
    <MotionSection
      ref={section}
      style={{ clipPath }}
      aria-labelledby="best-title"
      className="relative bg-deep py-20 text-on-deep sm:py-28 lg:py-36"
    >
      <div
        className="pointer-events-none absolute -left-40 top-0 h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(closest-side,rgba(107,164,226,0.16),transparent)]"
        aria-hidden="true"
      />
      <div className={`${CONTAINER} relative`}>
        <SectionHeading
          id="best-title"
          tone="deep"
          eyebrow="Bestsellers"
          index="06"
          lines={['The ones people', <>keep <Accent tone="deep">reordering.</Accent></>]}
        >
          <PillLink to="/shop" tone="light">
            Shop the store
          </PillLink>
        </SectionHeading>

        <div className="mt-14 lg:mt-20">
          {loading ? (
            <div className="grid gap-6 lg:grid-cols-12">
              <div className="skeleton-shimmer aspect-[4/5] rounded-[2.25rem] opacity-20 lg:col-span-7 lg:aspect-auto lg:min-h-[640px]" />
              <div className="hidden grid-cols-2 gap-6 lg:col-span-5 lg:grid">
                {[0, 1, 2, 3].map((i) => (
                  <StoreProductCardSkeleton key={i} className="opacity-20" />
                ))}
              </div>
            </div>
          ) : error ? (
            <StatusMessage tone="deep" title="We couldn't load bestsellers" text="Please check your connection." onRetry={retry} />
          ) : (
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-6">
              <MotionDiv variants={revealUp} initial="hidden" whileInView="show" viewport={IN_VIEW} className="lg:col-span-7">
                <LeadProduct product={lead} />
              </MotionDiv>

              {rest.length > 0 && (
                <MotionDiv
                  variants={revealGroup(0.08, 0.1)}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.1 }}
                  className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 no-scrollbar sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:col-span-5 lg:mx-0 lg:grid lg:grid-cols-2 lg:gap-x-6 lg:gap-y-10 lg:overflow-visible lg:px-0 lg:pb-0"
                >
                  {rest.slice(0, 4).map((product) => (
                    <MotionDiv key={product.id} variants={revealUp} className="w-[62vw] shrink-0 snap-start sm:w-[40vw] lg:w-auto">
                      <StoreProductCard product={product} tone="deep" imageClassName="aspect-square" />
                    </MotionDiv>
                  ))}
                </MotionDiv>
              )}
            </div>
          )}
        </div>
      </div>
    </MotionSection>
  );
}

/** Oversized feature card; details lift and actions appear on hover */
function LeadProduct({ product }) {
  const addToCart = useAddToCart();
  const imageRef = useRef(null);
  const [status, setStatus] = useState('idle');
  const [primary, secondary] = productImages(product);
  const { price, compare, discount } = productPricing(product);
  const soldOut = isOutOfStock(product);

  const handleAdd = async () => {
    if (status !== 'idle' || soldOut) return;
    setStatus('adding');
    const added = await addToCart(product, 1);
    if (added) {
      flyToCart(imageRef.current, primary);
      setStatus('added');
      window.setTimeout(() => setStatus('idle'), 1800);
    } else {
      setStatus('idle');
    }
  };

  return (
    <article className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-[2.25rem] bg-plate sm:aspect-[5/4] lg:aspect-auto lg:h-full lg:min-h-[640px]">
      <div className="absolute inset-0">
        {primary && (
          <img
            ref={imageRef}
            src={primary}
            alt=""
            loading="lazy"
            decoding="async"
            className={cn(
              'absolute inset-0 h-full w-full object-contain p-[12%] pb-[30%] mix-blend-multiply transition-[transform,opacity] duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]',
              secondary && 'group-hover:opacity-0'
            )}
          />
        )}
        {secondary && (
          <img
            src={secondary}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-contain p-[12%] pb-[30%] opacity-0 mix-blend-multiply transition-opacity duration-[1100ms] group-hover:opacity-100"
          />
        )}
      </div>

      <div className="absolute left-5 top-5 flex gap-2 sm:left-7 sm:top-7">
        <span className="rounded-full bg-[#0E1726] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-[#F3F1EC]">
          Bestseller
        </span>
        {discount > 0 && (
          <span className="rounded-full bg-white/80 px-3 py-1.5 text-[11px] font-medium tabular-nums text-[#0E1726]">
            −{discount}%
          </span>
        )}
      </div>

      {/* Details: glass panel that lifts on hover */}
      <div className="relative m-3 rounded-[1.75rem] bg-white/75 p-5 text-[#0E1726] ring-1 ring-black/5 backdrop-blur-xl transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] sm:m-4 sm:p-7 lg:translate-y-[4.25rem] lg:group-focus-within:translate-y-0 lg:group-hover:translate-y-0">
        {product.brand && (
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#0E1726]/60">{product.brand}</p>
        )}
        <h3 className="mt-2 line-clamp-2 font-display text-[clamp(1.35rem,2.4vw,2.1rem)] font-medium leading-[1.08] tracking-[-0.03em]">
          <Link
            to={productPath(product)}
            className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1565C0]"
          >
            {product.name}
          </Link>
        </h3>
        {price && (
          <p className="mt-3 flex items-baseline gap-2.5">
            <span className="font-display text-xl font-medium tabular-nums">{formatPrice(price)}</span>
            {compare && (
              <s className="text-sm tabular-nums text-[#0E1726]/55">
                <span className="sr-only">Was </span>
                {formatPrice(compare)}
              </s>
            )}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3 transition-opacity duration-500 lg:opacity-0 lg:group-focus-within:opacity-100 lg:group-hover:opacity-100">
          <button
            type="button"
            onClick={handleAdd}
            disabled={soldOut || status === 'adding'}
            className={cn(
              'inline-flex min-h-12 items-center gap-2 rounded-full px-6 text-sm font-medium transition-colors duration-300',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1565C0] disabled:cursor-not-allowed disabled:opacity-60',
              status === 'added' ? 'bg-[#1565C0] text-white' : 'bg-[#0E1726] text-[#F3F1EC] hover:bg-[#1565C0]'
            )}
          >
            {status === 'adding' ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : status === 'added' ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Plus className="h-4 w-4" aria-hidden="true" />
            )}
            {soldOut ? 'Sold out' : status === 'added' ? 'Added to cart' : 'Add to cart'}
          </button>
          <Link
            to={productPath(product)}
            className="group/link inline-flex min-h-12 items-center gap-1.5 rounded-full px-5 text-sm font-medium ring-1 ring-inset ring-black/10 transition-colors hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1565C0]"
            tabIndex={-1}
            aria-hidden="true"
          >
            Details
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
