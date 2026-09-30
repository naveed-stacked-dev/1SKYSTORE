import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Star } from 'lucide-react';
import { EASE_OUT } from '@/animations/variants';
import { TESTIMONIALS } from '@/constants/testimonials';
import { cn } from '@/utils/cn';
import Eyebrow from './ui/Eyebrow';
import RoundButton from './ui/RoundButton';
import { CONTAINER, SECTION_Y } from './ui/styles';

const MotionFigure = motion.figure;

const ADVANCE_MS = 8000;

/** Large-type testimonial carousel; renders nothing until real quotes exist */
export default function Testimonials({ items = TESTIMONIALS }) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const count = items.length;
  const running = count > 1 && !hovered && !reduceMotion;

  useEffect(() => {
    if (!running) return undefined;
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % count), ADVANCE_MS);
    return () => window.clearTimeout(timer);
  }, [running, index, count]);

  if (!count) return null;

  const item = items[index % count];
  const go = (step) => setIndex((i) => (i + step + count) % count);

  return (
    <section
      aria-labelledby="voices-title"
      className={`bg-canvas ${SECTION_Y}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={CONTAINER}>
        <div className="flex items-center justify-between gap-6">
          <Eyebrow index="08">
            <span id="voices-title">In their words</span>
          </Eyebrow>
          {count > 1 && (
            <div className="flex items-center gap-4">
              <span className="font-display text-sm tabular-nums text-ink-faint" aria-live="polite">
                {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
              </span>
              <RoundButton label="Previous testimonial" onClick={() => go(-1)}>
                <ArrowLeft className="h-4 w-4" />
              </RoundButton>
              <RoundButton label="Next testimonial" onClick={() => go(1)}>
                <ArrowRight className="h-4 w-4" />
              </RoundButton>
            </div>
          )}
        </div>

        <div className="relative mt-12 min-h-[22rem] sm:min-h-[20rem]">
          <AnimatePresence mode="wait" initial={false}>
            <MotionFigure
              key={index}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.7, ease: EASE_OUT }}
            >
              <blockquote className="max-w-5xl font-display text-[clamp(1.8rem,4.2vw,3.75rem)] font-normal leading-[1.1] tracking-[-0.035em] text-ink">
                <span className="font-serif italic text-accent" aria-hidden="true">
                  “
                </span>
                {item.quote}
                <span className="font-serif italic text-accent" aria-hidden="true">
                  ”
                </span>
              </blockquote>
              <figcaption className="mt-10 flex items-center gap-4">
                {item.avatar && (
                  <img src={item.avatar} alt="" className="h-12 w-12 rounded-full object-cover ring-1 ring-line" />
                )}
                <div>
                  <p className="font-display text-base font-medium text-ink">{item.name}</p>
                  {item.location && <p className="text-sm text-ink-faint">{item.location}</p>}
                </div>
                {item.rating > 0 && (
                  <p className="ml-2 flex items-center gap-0.5" aria-label={`Rated ${item.rating} out of 5`}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        aria-hidden="true"
                        className={cn('h-4 w-4', i < item.rating ? 'fill-amber-500 text-amber-500' : 'text-ink/20')}
                      />
                    ))}
                  </p>
                )}
              </figcaption>
            </MotionFigure>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
