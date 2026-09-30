import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { EASE_OUT, revealGroup, revealUp } from '@/animations/variants';
import { useFeaturedProducts, useTrendingProducts } from '@/hooks/useStoreData';
import { cn } from '@/utils/cn';
import StoreProductCard, { StoreProductCardSkeleton } from './StoreProductCard';
import SectionHeading from './ui/SectionHeading';
import Accent from './ui/Accent';
import { TextLink } from './ui/PillLink';
import StatusMessage from './ui/StatusMessage';
import RoundButton from './ui/RoundButton';
import { CONTAINER } from './ui/styles';

const MotionDiv = motion.div;
const MotionSpan = motion.span;

const CARD_WIDTH = 'w-[68vw] sm:w-[40vw] md:w-[30vw] lg:w-[calc((100%-3*1.5rem)/4)]';

export default function ProductRail() {
  const featured = useFeaturedProducts();
  const trending = useTrendingProducts();
  const [tab, setTab] = useState('featured');

  const tabs = [
    { id: 'featured', label: 'Featured', query: featured },
    { id: 'trending', label: 'Trending', query: trending },
  ].filter((t) => t.query.loading || t.query.error || t.query.data?.length);

  const active = tabs.find((t) => t.id === tab) || tabs[0];

  return (
    <section aria-labelledby="featured-title" className="overflow-hidden bg-canvas pb-20 sm:pb-28 lg:pb-36">
      <div className={CONTAINER}>
        <SectionHeading
          id="featured-title"
          eyebrow="The edit"
          index="02"
          lines={['Featured', <Accent key="a">remedies</Accent>]}
        >
          {tabs.length > 1 && (
            <div role="tablist" aria-label="Product collections" className="flex rounded-full p-1 ring-1 ring-inset ring-line">
              {tabs.map((t) => {
                const selected = t.id === active?.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    id={`rail-tab-${t.id}`}
                    aria-selected={selected}
                    aria-controls="rail-panel"
                    onClick={() => setTab(t.id)}
                    className={cn(
                      'relative min-h-10 rounded-full px-5 text-sm font-medium transition-colors duration-300',
                      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                      selected ? 'text-canvas' : 'text-ink-soft hover:text-ink'
                    )}
                  >
                    {selected && (
                      <MotionSpan
                        layoutId="rail-tab-pill"
                        className="absolute inset-0 rounded-full bg-ink"
                        transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                      />
                    )}
                    <span className="relative">{t.label}</span>
                  </button>
                );
              })}
            </div>
          )}
          <TextLink to="/shop" className="ml-2">
            Shop all
          </TextLink>
        </SectionHeading>

        <div id="rail-panel" role="tabpanel" aria-labelledby={active ? `rail-tab-${active.id}` : undefined} className="mt-12 lg:mt-16">
          {active ? (
            <AnimatePresence mode="wait" initial={false}>
              <MotionDiv
                key={active.id}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.45, ease: EASE_OUT }}
              >
                <RailBody query={active.query} />
              </MotionDiv>
            </AnimatePresence>
          ) : (
            <StatusMessage
              title="New arrivals are on their way"
              text="Our full catalogue is ready to explore in the meantime."
              action={{ to: '/shop', label: 'Browse the store' }}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function RailBody({ query }) {
  const { data, loading, error, retry } = query;

  if (loading) {
    return (
      <div className="flex gap-4 overflow-hidden lg:gap-6" aria-label="Loading products">
        {[0, 1, 2, 3].map((i) => (
          <StoreProductCardSkeleton key={i} className={cn('shrink-0', CARD_WIDTH)} />
        ))}
      </div>
    );
  }

  if (error) {
    return <StatusMessage title="We couldn't load these products" text="Please check your connection." onRetry={retry} />;
  }

  return <Rail products={data} />;
}

function Rail({ products }) {
  const scroller = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const { scrollXProgress } = useScroll({ container: scroller });
  const progress = useSpring(scrollXProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });

  const updateEdges = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft >= max - 4 });
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return undefined;
    const observer = new ResizeObserver(updateEdges);
    observer.observe(el);
    return () => observer.disconnect();
  }, [updateEdges]);

  const scrollByPage = (direction) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  const overflowing = !(edges.start && edges.end);

  return (
    <>
      <MotionDiv
        ref={scroller}
        onScroll={updateEdges}
        variants={revealGroup(0.07)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        className="relative -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 no-scrollbar sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:scroll-px-0 lg:gap-6 lg:px-0"
      >
        {products.map((product) => (
          <MotionDiv key={product.id} variants={revealUp} className={cn('shrink-0 snap-start', CARD_WIDTH)}>
            <StoreProductCard product={product} />
          </MotionDiv>
        ))}
      </MotionDiv>

      {overflowing && (
        <div className="mt-10 flex items-center gap-6">
          <div className="relative h-px flex-1 bg-line" aria-hidden="true">
            <MotionDiv style={{ scaleX: progress }} className="absolute inset-0 origin-left bg-ink" />
          </div>
          <div className="flex gap-2">
            <RoundButton label="Previous products" disabled={edges.start} onClick={() => scrollByPage(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </RoundButton>
            <RoundButton label="Next products" disabled={edges.end} onClick={() => scrollByPage(1)}>
              <ArrowRight className="h-4 w-4" />
            </RoundButton>
          </div>
        </div>
      )}
    </>
  );
}
