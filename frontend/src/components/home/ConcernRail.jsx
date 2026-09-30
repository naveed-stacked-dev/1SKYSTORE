import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play } from 'lucide-react';
import { TOP_CONCERNS } from '@/constants/concerns';
import { useSymptoms } from '@/hooks/useStoreData';
import { concernPath } from '@/utils/product';
import { cn } from '@/utils/cn';
import SectionHeading from './ui/SectionHeading';
import Accent from './ui/Accent';
import RoundButton from './ui/RoundButton';
import { CONTAINER } from './ui/styles';

const TINTS = ['bg-tint-1', 'bg-tint-3', 'bg-tint-4', 'bg-tint-2', 'bg-tint-5'];
const MORE_LIMIT = 18;
const SPEED = 42; // px per second
const RESUME_AFTER_TOUCH = 2500; // ms

export default function ConcernRail() {
  return (
    <section aria-labelledby="concerns-title" className="overflow-hidden bg-canvas pb-20 sm:pb-28 lg:pb-36">
      <div className={CONTAINER}>
        <SectionHeading
          id="concerns-title"
          eyebrow="Shop by concern"
          index="03"
          lines={['Find relief for', <>what you&apos;re <Accent>feeling.</Accent></>]}
        />
      </div>
      <AutoRail />
      <div className={cn(CONTAINER, 'mt-8')}>
        <MoreConcerns />
      </div>
    </section>
  );
}

/**
 * A native horizontal scroller that drifts on its own in a seamless loop.
 * It pauses on hover/focus and while the visitor drags, swipes or scrolls it,
 * so it can always be moved by hand; the pause button stops it for good.
 */
function AutoRail() {
  const reduceMotion = useReducedMotion();
  const scroller = useRef(null);
  const firstClone = useRef(null);
  const [playing, setPlaying] = useState(!reduceMotion);
  const playingRef = useRef(playing);
  const state = useRef({ hovering: false, focused: false, holdUntil: 0, visible: true, drag: null });

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  // Width of one copy of the list: the loop jumps back by exactly this much
  const loopWidth = useCallback(() => {
    const el = scroller.current;
    const clone = firstClone.current;
    if (!el || !clone) return 0;
    return clone.offsetLeft - el.firstElementChild.firstElementChild.offsetLeft;
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return undefined;
    const s = state.current;

    // No work while the rail is off screen
    const io = new IntersectionObserver(([entry]) => {
      s.visible = entry.isIntersecting;
    });
    io.observe(el);

    let raf;
    let last = performance.now();
    let pos = el.scrollLeft;

    const tick = (now) => {
      const dt = Math.min(now - last, 64);
      last = now;
      // The visitor moved it (drag, swipe, wheel, arrows): carry on from there
      if (Math.abs(el.scrollLeft - pos) > 2) pos = el.scrollLeft;

      const running =
        playingRef.current &&
        !s.hovering &&
        !s.focused &&
        !s.drag &&
        s.visible &&
        now > s.holdUntil &&
        !document.hidden;

      if (running) {
        pos += (SPEED * dt) / 1000;
        const width = loopWidth();
        if (width > 0 && pos >= width) pos -= width;
        el.scrollLeft = pos;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [loopWidth]);

  const hold = (ms) => {
    state.current.holdUntil = performance.now() + ms;
  };

  // Mouse drag-to-scroll (touch and trackpads scroll natively)
  const onPointerDown = (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    state.current.drag = { x: e.clientX, left: scroller.current.scrollLeft, moved: false };
  };
  const onPointerMove = (e) => {
    const drag = state.current.drag;
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (Math.abs(dx) > 5) drag.moved = true;
    scroller.current.scrollLeft = drag.left - dx;
  };
  const endDrag = () => {
    if (!state.current.drag) return;
    // Clear after the click that follows a drag, so that click can be swallowed
    window.setTimeout(() => {
      state.current.drag = null;
    }, 0);
    hold(1200);
  };
  const onClickCapture = (e) => {
    if (state.current.drag?.moved) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const step = (direction) => {
    const el = scroller.current;
    const card = el?.querySelector('li');
    if (!el || !card) return;
    const amount = card.offsetWidth + 16;
    const width = loopWidth();
    hold(1400);
    // Hop by one full copy first so both directions go on forever
    if (direction < 0 && el.scrollLeft < amount) el.scrollLeft += width;
    if (direction > 0 && el.scrollLeft + el.clientWidth + amount > el.scrollWidth) el.scrollLeft -= width;
    el.scrollBy({ left: direction * amount, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  return (
    <div className="mt-12 lg:mt-16">
      <div
        ref={scroller}
        role="region"
        aria-label="Concerns"
        onPointerEnter={(e) => {
          if (e.pointerType === 'mouse') state.current.hovering = true;
        }}
        onPointerLeave={() => {
          state.current.hovering = false;
          endDrag();
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onClickCapture={onClickCapture}
        onFocus={() => {
          state.current.focused = true;
        }}
        onBlur={() => {
          state.current.focused = false;
        }}
        onTouchStart={() => hold(60_000)}
        onTouchEnd={() => hold(RESUME_AFTER_TOUCH)}
        onWheel={(e) => {
          if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) hold(RESUME_AFTER_TOUCH);
        }}
        className="mask-fade-x cursor-grab select-none overflow-x-auto no-scrollbar active:cursor-grabbing"
      >
        <ul className="flex w-max gap-4 px-4 sm:px-6 lg:px-10">
          {[...TOP_CONCERNS, ...TOP_CONCERNS].map((concern, i) => {
            const clone = i >= TOP_CONCERNS.length;
            return (
              <li
                key={`${concern.query}-${i}`}
                ref={i === TOP_CONCERNS.length ? firstClone : undefined}
                aria-hidden={clone || undefined}
                className="w-[62vw] shrink-0 sm:w-[36vw] md:w-[28vw] lg:w-[clamp(240px,21vw,320px)]"
              >
                <ConcernCard concern={concern} index={i % TOP_CONCERNS.length} clone={clone} />
              </li>
            );
          })}
        </ul>
      </div>

      <div className={cn(CONTAINER, 'mt-6 flex justify-end gap-2')}>
        <RoundButton
          label={playing ? 'Pause moving concerns' : 'Play moving concerns'}
          onClick={() => setPlaying((p) => !p)}
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </RoundButton>
        <RoundButton label="Previous concerns" onClick={() => step(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </RoundButton>
        <RoundButton label="Next concerns" onClick={() => step(1)}>
          <ArrowRight className="h-4 w-4" />
        </RoundButton>
      </div>
    </div>
  );
}

function ConcernCard({ concern, index, clone = false }) {
  return (
    <Link
      to={concernPath(concern.query)}
      draggable={false}
      tabIndex={clone ? -1 : undefined}
      className={cn(
        'group relative flex aspect-[3/4] flex-col justify-between overflow-hidden rounded-[1.75rem] p-5 sm:p-6',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        TINTS[index % TINTS.length]
      )}
    >
      <span className="flex items-start justify-between">
        <span className="font-display text-sm tabular-nums text-ink-faint">{String(index + 1).padStart(2, '0')}</span>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface/70 text-ink ring-1 ring-inset ring-line transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-45 group-hover:bg-ink group-hover:text-canvas">
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </span>

      {/* Photo sits in a circle: the concern images are small, so they stay crisp */}
      <span className="mx-auto block aspect-square w-[64%] overflow-hidden rounded-full ring-8 ring-surface/40">
        <img
          src={concern.image}
          alt=""
          draggable={false}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
        />
      </span>

      <span className="block font-display text-[clamp(1.2rem,1.6vw,1.5rem)] font-medium leading-[1.08] tracking-[-0.025em] text-ink transition-transform duration-500 group-hover:-translate-y-1">
        {concern.name}
      </span>
    </Link>
  );
}

/** Every symptom tagged on products, as quick filters */
function MoreConcerns() {
  const { data, loading } = useSymptoms();
  const [expanded, setExpanded] = useState(false);
  const symptoms = data || [];

  if (!loading && !symptoms.length) return null;

  const visible = expanded ? symptoms : symptoms.slice(0, MORE_LIMIT);
  const toggle = symptoms.length > MORE_LIMIT && (
    <button
      type="button"
      onClick={() => setExpanded((v) => !v)}
      aria-expanded={expanded}
      className="mt-5 text-sm font-medium text-on-deep underline decoration-on-deep/30 underline-offset-4 transition-colors hover:decoration-on-deep"
    >
      {expanded ? 'Show fewer' : `Show all ${symptoms.length}`}
    </button>
  );

  return (
    <div className="rounded-[1.75rem] bg-deep p-6 text-on-deep sm:p-8 lg:grid lg:grid-cols-12 lg:gap-10 lg:p-10">
      <div className="lg:col-span-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-on-deep-soft">More concerns</p>
        <p className="mt-3 font-display text-2xl font-medium leading-tight tracking-[-0.025em] sm:text-3xl">
          {symptoms.length ? `${symptoms.length} concerns, one search away.` : 'Loading concerns…'}
        </p>
        <div className="hidden lg:block">{toggle}</div>
      </div>
      <ul className="mt-6 flex flex-wrap content-start gap-2 lg:col-span-8 lg:mt-0">
        {loading
          ? Array.from({ length: 12 }, (_, i) => (
              <li key={i} className="h-9 w-24 animate-pulse rounded-full bg-on-deep/10" aria-hidden="true" />
            ))
          : visible.map((name) => (
              <li key={name}>
                <Link
                  to={concernPath(name)}
                  className="inline-flex min-h-9 items-center rounded-full px-3.5 text-[13px] text-on-deep ring-1 ring-inset ring-on-deep/15 transition-colors duration-300 hover:bg-on-deep hover:text-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {name}
                </Link>
              </li>
            ))}
      </ul>
      <div className="lg:hidden">{toggle}</div>
    </div>
  );
}
