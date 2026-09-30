import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import ProductCard from '@/components/ecommerce/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import RoundButton from '@/components/home/ui/RoundButton';
import { TextLink } from '@/components/home/ui/PillLink';
import { CONTAINER } from '@/components/home/ui/styles';
import { revealGroup, revealUp } from '@/animations/variants';
import { cn } from '@/utils/cn';

const MotionDiv = motion.div;

const CARD_WIDTH = 'w-[68vw] sm:w-[40vw] md:w-[30vw] lg:w-[calc((100%-3*1.5rem)/4)]';

export default function ProductRow({ title, products, isLoading, viewAllLink }) {
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -viewportWidth() : viewportWidth();
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const viewportWidth = () => {
    return scrollRef.current ? scrollRef.current.clientWidth * 0.8 : 300;
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5); // 5px tolerance
    }
  };

  const hasProducts = !isLoading && products?.length > 0;

  return (
    <div className={cn(CONTAINER, 'relative py-10 sm:py-14')}>
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-4 sm:mb-10">
        <h2 className="font-display min-w-0 text-[clamp(1.75rem,3.4vw,2.75rem)] font-medium leading-[1.05] tracking-[-0.03em] text-ink">
          {title}
        </h2>
        <div className="flex items-center gap-5">
          {viewAllLink && <TextLink to={viewAllLink}>See All</TextLink>}
          {hasProducts && (
            <div className="hidden gap-2 sm:flex">
              <RoundButton label="Scroll left" disabled={!showLeftArrow} onClick={() => scroll('left')}>
                <ArrowLeft className="h-4 w-4" />
              </RoundButton>
              <RoundButton label="Scroll right" disabled={!showRightArrow} onClick={() => scroll('right')}>
                <ArrowRight className="h-4 w-4" />
              </RoundButton>
            </div>
          )}
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="flex gap-4 overflow-hidden lg:gap-6" aria-label="Loading products">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={cn('shrink-0', CARD_WIDTH)}>
              <ProductCardSkeleton />
            </div>
          ))}
        </div>
      ) : products?.length > 0 ? (
        <MotionDiv
          ref={scrollRef}
          onScroll={handleScroll}
          className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 no-scrollbar sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:scroll-px-0 lg:gap-6 lg:px-0"
          variants={revealGroup(0.07)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
        >
          {products.map((product) => (
            <MotionDiv
              key={product.id}
              variants={revealUp}
              className={cn('flex shrink-0 snap-start', CARD_WIDTH)}
            >
              <ProductCard product={product} />
            </MotionDiv>
          ))}
        </MotionDiv>
      ) : (
        <p className="text-[15px] text-ink-soft">No products found.</p>
      )}
    </div>
  );
}
