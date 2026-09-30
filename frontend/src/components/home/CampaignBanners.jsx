import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';
import { EASE_OUT, revealUp, IN_VIEW } from '@/animations/variants';
import { useBanners } from '@/hooks/useStoreData';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/utils/cn';
import Eyebrow from './ui/Eyebrow';
import RoundButton from './ui/RoundButton';
import { CONTAINER } from './ui/styles';

const MotionDiv = motion.div;
const MotionImg = motion.img;

const SLIDE_MS = 7000;
const EXTERNAL_URL_RE = /^(https?:)?\/\//i;

/**
 * Admin-managed campaign banners (Banners page in the admin panel).
 * Desktop and mobile artwork are uploaded separately, so pick by breakpoint.
 */
export default function CampaignBanners() {
  const { data } = useBanners();
  const mobile = useMediaQuery('(max-width: 639px)');

  const slides = ((mobile ? data?.heroMobile : data?.heroDesktop) || []).filter((b) => b?.image_url);
  const info = mobile ? data?.infoMobile : data?.infoDesktop;

  if (!slides.length && !info?.image_url) return null;

  return (
    <section aria-label="Current offers" className="bg-canvas pb-20 sm:pb-28">
      <div className={CONTAINER}>
        <MotionDiv variants={revealUp} initial="hidden" whileInView="show" viewport={IN_VIEW}>
          <Eyebrow className="mb-6">In the spotlight</Eyebrow>
          {slides.length > 0 && <Carousel key={mobile ? 'm' : 'd'} slides={slides} />}
          {info?.image_url && (
            <BannerLink to={info.link} className="mt-4 block overflow-hidden rounded-[2rem] bg-mist">
              <img
                src={info.image_url}
                alt="Store information"
                loading="lazy"
                decoding="async"
                className="h-auto w-full transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.015]"
              />
            </BannerLink>
          )}
        </MotionDiv>
      </div>
    </section>
  );
}

function Carousel({ slides }) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [paused, setPaused] = useState(Boolean(reduceMotion));
  const count = slides.length;
  const running = count > 1 && !paused && !hovered;

  useEffect(() => {
    if (!running) return undefined;
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % count), SLIDE_MS);
    return () => window.clearTimeout(timer);
  }, [running, index, count]);

  const go = (step) => setIndex((i) => (i + step + count) % count);
  const slide = slides[index % count];

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      aria-roledescription="carousel"
    >
      <div className="relative overflow-hidden rounded-[2rem] bg-mist">
        {/* The first slide reserves height; others overlay it */}
        <img src={slides[0].image_url} alt="" aria-hidden="true" className="invisible h-auto w-full" />
        <AnimatePresence initial={false}>
          <MotionDiv
            key={slide.id ?? index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: EASE_OUT }}
            className="absolute inset-0"
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${count}`}
          >
            <BannerLink to={slide.link} className="block h-full w-full">
              <MotionImg
                src={slide.image_url}
                alt={slide.title || 'Current offer at 1SkyStore'}
                initial={{ scale: 1.04 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.6, ease: EASE_OUT }}
                className="h-full w-full object-cover"
              />
            </BannerLink>
          </MotionDiv>
        </AnimatePresence>
      </div>

      {count > 1 && (
        <div className="mt-5 flex items-center gap-4">
          <div className="flex flex-1 gap-1.5">
            {slides.map((s, i) => (
              <button
                key={s.id ?? i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show offer ${i + 1}`}
                aria-current={i === index || undefined}
                className="group relative h-6 flex-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 overflow-hidden rounded-full bg-ink/10 group-hover:bg-ink/20">
                  {i < index && <span className="absolute inset-0 bg-ink" />}
                  {i === index && (
                    <span
                      key={`${index}-${running}`}
                      className={cn('absolute inset-0 origin-left bg-ink', running && 'animate-[banner-progress_linear_forwards]')}
                      style={running ? { animationDuration: `${SLIDE_MS}ms` } : undefined}
                    />
                  )}
                </span>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <RoundButton label={paused ? 'Play offers' : 'Pause offers'} onClick={() => setPaused((p) => !p)}>
              {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </RoundButton>
            <RoundButton label="Previous offer" onClick={() => go(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </RoundButton>
            <RoundButton label="Next offer" onClick={() => go(1)}>
              <ArrowRight className="h-4 w-4" />
            </RoundButton>
          </div>
        </div>
      )}
    </div>
  );
}

function BannerLink({ to, className, children }) {
  if (!to) return <div className={className}>{children}</div>;
  if (EXTERNAL_URL_RE.test(to)) {
    return (
      <a href={to} target="_blank" rel="noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link to={to} className={className}>
      {children}
    </Link>
  );
}
