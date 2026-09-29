import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const SLIDE_INTERVAL = 10000;
const EXTERNAL_URL_RE = /^(https?:)?\/\//i;

function BannerLink({ to, children }) {
  if (!to) return children;

  if (EXTERNAL_URL_RE.test(to)) {
    return (
      <a href={to} target="_blank" rel="noreferrer" className="block h-full w-full">
        {children}
      </a>
    );
  }

  return (
    <Link to={to} className="block h-full w-full">
      {children}
    </Link>
  );
}

function ImageSlide({ slide, isActive }) {
  const content = (
    <div className="relative w-full overflow-hidden bg-neutral-100 dark:bg-neutral-900">
      <img
        src={slide.image_url}
        alt={slide.alt || slide.title || `Hero banner ${slide.id}`}
        className="w-full h-auto"
        loading={isActive ? 'eager' : 'lazy'}
        draggable={false}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/10 via-transparent to-transparent pointer-events-none" />
    </div>
  );

  return <BannerLink to={slide.link}>{content}</BannerLink>;
}

export default function HeroBannerSlider({ initialSlide, banners = [], loading = false }) {
  const MotionDiv = motion.div;
  const slides = useMemo(() => {
    const baseSlides = [];

    if (initialSlide) {
      baseSlides.push({
        id: 'default-hero-slide',
        type: 'custom',
        content: initialSlide,
      });
    }

    banners.forEach((banner) => {
      if (!banner?.image_url) return;
      baseSlides.push({
        id: banner.id,
        type: 'image',
        image_url: banner.image_url,
        link: banner.link,
      });
    });

    return baseSlides;
  }, [banners, initialSlide]);

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const count = slides.length;
  const activeIndex = count > 0 ? current % count : 0;

  useEffect(() => {
    if (count <= 1) return;

    const intervalId = window.setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % count);
    }, SLIDE_INTERVAL);

    return () => window.clearInterval(intervalId);
  }, [count]);

  if (loading && count === 0) {
    return (
      <section className="relative overflow-hidden">
        <div className="h-[560px] animate-pulse bg-neutral-100 dark:bg-neutral-900 sm:h-[620px] lg:h-[680px]" />
      </section>
    );
  }

  if (count === 0) return null;

  const goToSlide = (nextIndex) => {
    if (count <= 1) return;
    setDirection(nextIndex > activeIndex ? 1 : -1);
    setCurrent((nextIndex + count) % count);
  };

  const activeSlide = slides[activeIndex];
  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0.45 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0.45 }),
  };

  return (
    <section className="relative overflow-hidden" aria-label="Homepage hero slider">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <MotionDiv
          key={activeSlide.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          {activeSlide.type === 'custom' ? (
            activeSlide.content
          ) : (
            <div className="relative w-full bg-neutral-100 dark:bg-neutral-950">
              <ImageSlide slide={activeSlide} isActive />
            </div>
          )}
        </MotionDiv>
      </AnimatePresence>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => goToSlide(activeIndex - 1)}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-neutral-950/35 text-white backdrop-blur-md transition hover:scale-105 hover:bg-neutral-950/55 sm:left-5"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => goToSlide(activeIndex + 1)}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-neutral-950/35 text-white backdrop-blur-md transition hover:scale-105 hover:bg-neutral-950/55 sm:right-5"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-neutral-950/25 px-3 py-2 backdrop-blur-md">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={[
                  'rounded-full transition-all duration-300',
                  index === activeIndex ? 'h-2 w-7 bg-white' : 'h-2 w-2 bg-white/50 hover:bg-white/80',
                ].join(' ')}
              />
            ))}
          </div>

          <div className="absolute bottom-0 left-0 right-0 z-20 h-1 bg-white/10">
            <MotionDiv
              key={activeSlide.id}
              className="h-full bg-white/70"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: SLIDE_INTERVAL / 1000, ease: 'linear' }}
            />
          </div>
        </>
      )}
    </section>
  );
}
