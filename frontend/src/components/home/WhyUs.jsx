import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { Check, LockKeyhole, MessagesSquare, PackageCheck, Search, ShieldCheck, Truck } from 'lucide-react';
import { EASE_OUT, revealUp, IN_VIEW } from '@/animations/variants';
import { useBrands } from '@/hooks/useStoreData';
import { cn } from '@/utils/cn';
import SectionHeading from './ui/SectionHeading';
import Accent from './ui/Accent';
import { CONTAINER, SECTION_Y } from './ui/styles';
import heroPortrait640 from '@/assets/home/globules-portrait-640.webp';
import paymentAmex from '@/assets/payments/amex-svgrepo-com.svg';
import paymentGpay from '@/assets/payments/google-pay-primary-logo-logo-svgrepo-com.svg';
import paymentMastercard from '@/assets/payments/mastercard-svgrepo-com.svg';
import paymentVisa from '@/assets/payments/visa-3-svgrepo-com.svg';

const MotionDiv = motion.div;
const MotionLi = motion.li;

const BENEFITS = [
  {
    title: 'Genuine products',
    text: 'Sealed, authentic medicines sourced from established homeopathic brands, stored and shipped with care.',
    visual: 'photo',
  },
  {
    title: 'Carefully selected brands',
    text: 'A focused catalogue of names practitioners know and trust, from dilutions to mother tinctures.',
    visual: 'brands',
  },
  {
    title: 'Convenient ordering',
    text: 'Search remedies by name or browse by brand and concern, then check out in a few taps — on any device.',
    visual: 'search',
  },
  {
    title: 'Secure payments',
    text: 'An encrypted checkout with trusted payment partners and major international cards.',
    visual: 'payments',
  },
  {
    title: 'Fast, tracked delivery',
    text: 'Every order is packed with care and tracked from dispatch to your doorstep.',
    visual: 'delivery',
  },
  {
    title: 'Support that answers',
    text: 'Questions about a remedy or an order? Message us on WhatsApp and talk to a real person.',
    visual: 'support',
  },
];

export default function WhyUs() {
  const [active, setActive] = useState(0);

  return (
    <section aria-labelledby="why-title" className={`bg-canvas ${SECTION_Y}`}>
      <div className={CONTAINER}>
        <SectionHeading
          id="why-title"
          eyebrow="Why 1SKYStore"
          index="05"
          lines={['Care you can', <Accent key="c">count on.</Accent>]}
          intro="Six promises behind every order — the reasons people come back."
        />

        <div className="mt-14 lg:mt-8 lg:grid lg:grid-cols-12 lg:gap-10">
          {/* Sticky stage (desktop) */}
          <div className="hidden lg:col-span-6 lg:block">
            <div className="sticky top-[12vh] h-[76vh] overflow-hidden rounded-[2.25rem] bg-mist">
              <AnimatePresence initial={false}>
                <MotionDiv
                  key={active}
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.8, ease: EASE_OUT }}
                  className="absolute inset-0"
                >
                  <Visual type={BENEFITS[active].visual} />
                </MotionDiv>
              </AnimatePresence>

              <div className="absolute inset-x-8 bottom-7 flex items-center gap-4" aria-hidden="true">
                <span className="font-display text-sm tabular-nums text-ink">
                  {String(active + 1).padStart(2, '0')}
                  <span className="text-ink-faint"> / {String(BENEFITS.length).padStart(2, '0')}</span>
                </span>
                <span className="flex flex-1 gap-1.5">
                  {BENEFITS.map((b, i) => (
                    <span key={b.title} className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-ink/10">
                      <span
                        className={cn(
                          'absolute inset-0 origin-left rounded-full bg-ink transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]',
                          i <= active ? 'scale-x-100' : 'scale-x-0'
                        )}
                      />
                    </span>
                  ))}
                </span>
              </div>
            </div>
          </div>

          {/* Phones & tablets: a swipeable row of promise cards. Desktop: a tall
              column whose items drive the sticky stage. */}
          <ol className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 no-scrollbar sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:col-span-5 lg:col-start-8 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0 lg:pb-0">
            {BENEFITS.map((benefit, i) => (
              <Benefit key={benefit.title} benefit={benefit} index={i} active={active === i} onActive={setActive} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Benefit({ benefit, index, active, onActive }) {
  const ref = useRef(null);
  // "Active" while the item crosses the middle band of the viewport
  const centred = useInView(ref, { margin: '-45% 0px -45% 0px' });

  useEffect(() => {
    if (centred) onActive(index);
  }, [centred, index, onActive]);

  return (
    <MotionLi
      ref={ref}
      variants={revealUp}
      initial="hidden"
      whileInView="show"
      viewport={IN_VIEW}
      className="w-[84vw] shrink-0 snap-start overflow-hidden rounded-[2rem] bg-surface ring-1 ring-line sm:w-[58vw] lg:flex lg:min-h-[72vh] lg:w-auto lg:items-center lg:overflow-visible lg:rounded-none lg:bg-transparent lg:ring-0"
    >
      {/* Phones & tablets: each promise carries its own visual */}
      <div className="relative aspect-[4/3] overflow-hidden bg-mist sm:aspect-[16/9] lg:hidden">
        <Visual type={benefit.visual} compact />
      </div>

      <div
        className={cn(
          'p-6 sm:p-8 lg:p-0 lg:transition-opacity lg:duration-700',
          active ? 'lg:opacity-100' : 'lg:opacity-30'
        )}
      >
        <span className="font-display text-sm tabular-nums text-accent">{String(index + 1).padStart(2, '0')}</span>
        <h3 className="mt-3 font-display text-[clamp(1.6rem,2.8vw,2.6rem)] font-medium leading-[1.05] tracking-[-0.035em] text-ink">
          {benefit.title}
        </h3>
        <p className="mt-4 max-w-md text-base leading-relaxed text-ink-soft sm:text-lg">{benefit.text}</p>
      </div>
    </MotionLi>
  );
}

// ─── Visual compositions ─────────────────────────────────────────────────────

function Visual({ type, compact = false }) {
  switch (type) {
    case 'photo':
      return (
        <img
          src={heroPortrait640}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-[50%_45%]"
        />
      );
    case 'brands':
      return <BrandsVisual compact={compact} />;
    case 'search':
      return <SearchVisual compact={compact} />;
    case 'payments':
      return <PaymentsVisual compact={compact} />;
    case 'delivery':
      return <DeliveryVisual compact={compact} />;
    case 'support':
      return <SupportVisual compact={compact} />;
    default:
      return null;
  }
}

function Stage({ tint, compact, children }) {
  return (
    <div
      aria-hidden="true"
      className={cn('absolute inset-0 flex items-center justify-center', compact ? 'p-6' : 'p-12', tint)}
    >
      <div className="bg-grain pointer-events-none absolute inset-0" />
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  );
}

function BrandsVisual({ compact }) {
  const { data } = useBrands();
  const brands = (data || []).slice(0, compact ? 6 : 9);
  if (!brands.length) {
    return (
      <Stage tint="bg-tint-1" compact={compact}>
        <ShieldCheck className="mx-auto h-16 w-16 text-accent" strokeWidth={1.25} />
      </Stage>
    );
  }
  return (
    <Stage tint="bg-tint-1" compact={compact}>
      <div className={cn('grid gap-2.5', compact ? 'grid-cols-3' : 'grid-cols-3 gap-3')}>
        {brands.map((brand) => (
          <div
            key={brand.name}
            className={cn(
              'flex items-center justify-center rounded-2xl bg-white/85 p-3 shadow-[0_12px_30px_-18px_rgba(14,23,38,0.35)]',
              compact ? 'h-14' : 'h-24'
            )}
          >
            {brand.image_url ? (
              <img src={brand.image_url} alt="" loading="lazy" className="max-h-full max-w-full object-contain" />
            ) : (
              <span className="text-center font-display text-xs font-semibold text-[#0E1726]">{brand.name}</span>
            )}
          </div>
        ))}
      </div>
    </Stage>
  );
}

function SearchVisual({ compact }) {
  return (
    <Stage tint="bg-tint-4" compact={compact}>
      <div className="rounded-[1.4rem] bg-surface p-3 shadow-[0_30px_60px_-30px_rgba(14,23,38,0.4)] ring-1 ring-line">
        <div className="flex items-center gap-3 rounded-full bg-mist px-4 py-3">
          <Search className="h-4 w-4 text-ink-faint" />
          <span className="text-sm text-ink">
            Acidity<span className="ml-0.5 inline-block h-4 w-px translate-y-0.5 animate-pulse bg-ink" />
          </span>
        </div>
        {!compact && (
          <ul className="mt-2 divide-y divide-line">
            {['Remedies for acidity', 'Bio-Combination Tablets', 'Mother Tinctures'].map((row) => (
              <li key={row} className="flex items-center justify-between px-3 py-3 text-sm text-ink-soft">
                {row}
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {['By remedy', 'By brand', 'By concern'].map((chip) => (
          <span key={chip} className="rounded-full bg-surface/70 px-3.5 py-1.5 text-xs font-medium text-ink ring-1 ring-line">
            {chip}
          </span>
        ))}
      </div>
    </Stage>
  );
}

function PaymentsVisual({ compact }) {
  const icons = [paymentVisa, paymentMastercard, paymentAmex, paymentGpay];
  return (
    <Stage tint="bg-tint-2" compact={compact}>
      <div className="relative">
        <div className="mx-auto grid max-w-xs grid-cols-2 gap-2.5">
          {icons.map((icon) => (
            <div
              key={icon}
              className={cn(
                'flex items-center justify-center rounded-2xl bg-white p-3 shadow-[0_12px_30px_-18px_rgba(14,23,38,0.35)]',
                compact ? 'h-12' : 'h-20'
              )}
            >
              <img src={icon} alt="" className="max-h-full max-w-[70%] object-contain" />
            </div>
          ))}
        </div>
        <span className="absolute -right-3 -top-3 flex h-12 w-12 items-center justify-center rounded-full bg-ink text-canvas shadow-lg">
          <LockKeyhole className="h-5 w-5" />
        </span>
      </div>
    </Stage>
  );
}

function DeliveryVisual({ compact }) {
  const steps = [
    { icon: Check, label: 'Order confirmed' },
    { icon: PackageCheck, label: 'Packed with care' },
    { icon: Truck, label: 'On its way' },
    { icon: ShieldCheck, label: 'Delivered' },
  ];
  return (
    <Stage tint="bg-tint-3" compact={compact}>
      <ol className={cn('relative mx-auto flex max-w-xs flex-col', compact ? 'gap-2' : 'gap-5')}>
        <span className="absolute bottom-5 left-5 top-5 w-px bg-ink/15" />
        {steps.map(({ icon, label }, i) => {
          const Icon = icon;
          return (
          <li key={label} className="relative flex items-center gap-4">
            <span
              className={cn(
                'relative flex shrink-0 items-center justify-center rounded-full',
                compact ? 'h-9 w-9' : 'h-10 w-10',
                i < 3 ? 'bg-ink text-canvas' : 'bg-surface text-ink-faint ring-1 ring-line'
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span className={cn('font-display text-sm font-medium', i < 3 ? 'text-ink' : 'text-ink-faint')}>{label}</span>
          </li>
          );
        })}
      </ol>
    </Stage>
  );
}

function SupportVisual({ compact }) {
  return (
    <Stage tint="bg-tint-5" compact={compact}>
      <div className="mx-auto flex max-w-xs flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white">
            <MessagesSquare className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-display text-sm font-medium text-ink">1SKYSTORE</span>
            <span className="block text-xs text-ink-faint">Typically replies within 10 min</span>
          </span>
        </div>
        <p className="max-w-[85%] rounded-2xl rounded-tl-md bg-surface px-4 py-3 text-sm text-ink shadow-[0_12px_30px_-18px_rgba(14,23,38,0.35)]">
          Hi there! 👋 How can we help you today?
        </p>
        {!compact && (
          <p className="max-w-[80%] self-end rounded-2xl rounded-tr-md bg-ink px-4 py-3 text-sm text-canvas">
            Which potency should I choose?
          </p>
        )}
      </div>
    </Stage>
  );
}
