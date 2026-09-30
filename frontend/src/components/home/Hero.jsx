import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Leaf } from 'lucide-react';
import { EASE_OUT, EASE_IN_OUT } from '@/animations/variants';
import { useAuth } from '@/context/AuthContext';
import { useFeaturedProducts } from '@/hooks/useStoreData';
import { formatPrice } from '@/utils/formatPrice';
import { concernPath, productImages, productPath, productPricing } from '@/utils/product';
import MaskLines from './ui/MaskLines';
import Accent from './ui/Accent';
import PillLink, { TextLink } from './ui/PillLink';
import { CONTAINER } from './ui/styles';
import heroPortrait640 from '@/assets/home/globules-portrait-640.webp';
import heroPortrait980 from '@/assets/home/globules-portrait-980.webp';

const MotionDiv = motion.div;
const MotionP = motion.p;
const MotionImg = motion.img;
const MotionSvg = motion.svg;

// Exact symptom values stored on products (see constants/concerns.js)
const QUICK_CONCERNS = [
  { label: 'Hair fall', query: 'Hair Fall' },
  { label: 'Acidity', query: 'Acidity' },
  { label: 'Migraine', query: 'Headache & Migraine' },
  { label: 'Sinusitis', query: 'Sinusitis & Blocked Nose' },
];

const enter = (delay, y = 18) => ({
  initial: { opacity: 0, y },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1, delay, ease: EASE_OUT },
});

export default function Hero() {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const { user, isAuthenticated } = useAuth();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });

  const depth = reduceMotion ? 0 : 1;
  const frameY = useTransform(scrollYProgress, [0, 1], [0, 90 * depth]);
  const photoY = useTransform(scrollYProgress, [0, 1], [0, -70 * depth]);
  const leafY = useTransform(scrollYProgress, [0, 1], [0, 180 * depth]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, 40 * depth]);

  return (
    <section
      ref={ref}
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden bg-canvas pb-16 pt-28 sm:pt-32 lg:flex lg:min-h-[min(100svh,960px)] lg:items-center lg:pb-24 lg:pt-32"
    >
      {/* Backdrop: two soft light pools + grain */}
      <MotionDiv
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, ease: EASE_OUT }}
      >
        <div className="absolute -right-[18%] -top-[30%] h-[80vmax] w-[80vmax] rounded-full bg-[radial-gradient(closest-side,var(--c-accent-soft),transparent)]" />
        <div className="absolute -bottom-[45%] -left-[25%] h-[70vmax] w-[70vmax] rounded-full bg-[radial-gradient(closest-side,var(--c-tint-4),transparent)] opacity-80" />
        <div className="bg-grain absolute inset-0" />
      </MotionDiv>

      <div className={`${CONTAINER} grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-6`}>
        {/* ── Copy ─────────────────────────────────────── */}
        <MotionDiv style={{ y: copyY }} className="relative z-10 lg:col-span-7">
          <MotionDiv {...enter(0.1, 10)}>
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="group inline-flex items-center gap-2.5 rounded-full bg-surface/70 py-1.5 pl-2 pr-4 text-[12px] font-medium text-ink ring-1 ring-inset ring-line backdrop-blur transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <EyebrowDot />
                Welcome back{user?.first_name ? `, ${user.first_name}` : ''} — your dashboard
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            ) : (
              <p className="inline-flex items-center gap-2.5 rounded-full bg-surface/70 py-1.5 pl-2 pr-4 text-[12px] font-medium text-ink-soft ring-1 ring-inset ring-line backdrop-blur">
                <EyebrowDot />
                Homeopathy &amp; everyday wellness
              </p>
            )}
          </MotionDiv>

          <MaskLines
            as="h1"
            id="hero-title"
            onMount
            delay={0.2}
            stagger={0.12}
            lines={[
              'Better care.',
              <Accent key="n" className="text-[1.06em] leading-[0.9]">
                Naturally.
              </Accent>,
            ]}
            className="mt-7 font-display text-[clamp(2.75rem,14.5vw,5.25rem)] font-medium leading-[0.92] tracking-[-0.045em] text-ink lg:text-[clamp(4.5rem,6.9vw,7rem)]"
          />

          <MotionP
            {...enter(0.55)}
            className="mt-7 max-w-[34rem] text-[17px] leading-relaxed text-ink-soft sm:text-lg"
          >
            Discover trusted homeopathic medicines and wellness essentials from established brands —
            thoughtfully selected for your everyday care.
          </MotionP>

          <MotionDiv {...enter(0.7)} className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
            <PillLink to="/shop">Shop medicines</PillLink>
            <TextLink href="#categories">Explore categories</TextLink>
          </MotionDiv>

          <MotionDiv {...enter(0.85)} className="mt-12 max-w-xl border-t border-line pt-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-ink-faint">Popular concerns</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {QUICK_CONCERNS.map((c) => (
                <li key={c.query}>
                  <Link
                    to={concernPath(c.query)}
                    className="inline-flex min-h-10 items-center rounded-full bg-surface/60 px-4 text-[13px] font-medium text-ink ring-1 ring-inset ring-line backdrop-blur transition-colors duration-300 hover:bg-ink hover:text-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </MotionDiv>
        </MotionDiv>

        {/* ── Visual ───────────────────────────────────── */}
        <div className="relative mx-auto w-full max-w-[460px] sm:max-w-[520px] lg:col-span-5 lg:max-w-none">
          {/* Botanical line drawing drifting behind the arch */}
          <MotionSvg
            aria-hidden="true"
            style={{ y: leafY }}
            viewBox="0 0 200 320"
            fill="none"
            className="absolute -left-16 top-[8%] hidden h-[62%] text-accent/40 lg:block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.6, delay: 1, ease: EASE_OUT }}
          >
            <path d="M100 318C98 230 102 140 100 4" stroke="currentColor" strokeWidth="1.2" />
            <path d="M100 250C60 238 34 206 30 164c38 4 64 32 70 86ZM100 186c42-10 66-40 70-82-40 6-66 34-70 82ZM100 122C66 112 48 86 46 52c32 6 50 30 54 70Z" stroke="currentColor" strokeWidth="1.2" />
          </MotionSvg>

          <MotionDiv style={{ y: frameY }} className="relative">
            {/* Arch frame: curtain reveal + slow settle */}
            <MotionDiv
              initial={reduceMotion ? false : { clipPath: 'inset(100% 0% 0% 0%)' }}
              animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
              transition={{ duration: 1.5, delay: 0.25, ease: EASE_IN_OUT }}
              className="relative aspect-square overflow-hidden rounded-b-[2rem] rounded-t-[999px] bg-mist shadow-[0_40px_80px_-40px_rgba(14,23,38,0.35)] sm:aspect-[4/5]"
            >
              <MotionDiv
                className="absolute inset-0"
                initial={{ scale: 1.25 }}
                animate={{ scale: 1 }}
                transition={{ duration: 2.2, delay: 0.25, ease: EASE_OUT }}
              >
                <MotionImg
                  style={{ y: photoY }}
                  src={heroPortrait980}
                  srcSet={`${heroPortrait640} 640w, ${heroPortrait980} 784w`}
                  sizes="(min-width: 1024px) 38vw, 90vw"
                  alt="Homeopathic globules spilling from an amber bottle onto a green leaf beside a wooden spoon"
                  fetchPriority="high"
                  decoding="async"
                  className="absolute inset-x-0 -top-[8%] h-[116%] w-full object-cover object-[50%_40%]"
                />
              </MotionDiv>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent" />
            </MotionDiv>

            <RotatingSeal />
            <FeaturedChip />
          </MotionDiv>
        </div>
      </div>

      {/* Scroll cue */}
      <MotionDiv
        {...enter(1.4, 0)}
        className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 text-[10px] font-medium uppercase tracking-[0.3em] text-ink-faint lg:flex"
        aria-hidden="true"
      >
        Scroll
        <span className="relative h-10 w-px overflow-hidden bg-line">
          <MotionDiv
            className="absolute inset-x-0 top-0 h-1/2 bg-ink"
            animate={reduceMotion ? undefined : { y: ['-100%', '200%'] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: EASE_IN_OUT }}
          />
        </span>
      </MotionDiv>
    </section>
  );
}

function EyebrowDot() {
  return (
    <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-accent-soft text-accent">
      <span className="animate-breathe absolute inset-0 rounded-full bg-accent/25" aria-hidden="true" />
      <Leaf className="relative h-3 w-3" aria-hidden="true" />
    </span>
  );
}

function RotatingSeal() {
  return (
    <MotionDiv
      initial={{ opacity: 0, scale: 0.6, rotate: -40 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 1.2, delay: 1.1, ease: EASE_OUT }}
      className="absolute -right-2 top-[6%] sm:-right-6"
      aria-hidden="true"
    >
      <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-surface/80 ring-1 ring-line backdrop-blur-md sm:h-28 sm:w-28">
        <svg viewBox="0 0 100 100" className="animate-spin-slowest absolute inset-0 h-full w-full text-ink">
          <defs>
            <path id="seal-circle" d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0" />
          </defs>
          {/* textLength = the circle's circumference, so the phrase closes the loop exactly */}
          <text className="fill-current font-display text-[8.6px] font-medium uppercase">
            <textPath href="#seal-circle" textLength="228" lengthAdjust="spacing">
              Genuine homeopathy • Trusted brands •
            </textPath>
          </text>
        </svg>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-white sm:h-10 sm:w-10">
          <Leaf className="h-4 w-4" />
        </span>
      </div>
    </MotionDiv>
  );
}

/** Glass chip showing a real featured product — hidden until one exists */
function FeaturedChip() {
  const { data } = useFeaturedProducts();
  const product = data?.[0];
  if (!product) return null;

  const [image] = productImages(product);
  const { price } = productPricing(product);

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.3, ease: EASE_OUT }}
      className="absolute -bottom-6 left-3 right-3 sm:-left-8 sm:right-auto sm:max-w-[330px]"
    >
      <Link
        to={productPath(product)}
        className="group flex items-center gap-3.5 rounded-[1.4rem] bg-surface/80 p-2.5 pr-5 shadow-[0_24px_60px_-24px_rgba(14,23,38,0.4)] ring-1 ring-line backdrop-blur-xl transition-transform duration-500 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <span className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-plate">
          {image && (
            <img
              src={image}
              alt=""
              className="h-full w-full object-contain p-1.5 mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
            />
          )}
        </span>
        <span className="min-w-0">
          <span className="block text-[10px] font-medium uppercase tracking-[0.2em] text-accent">Featured</span>
          <span className="mt-0.5 block truncate font-display text-sm font-medium text-ink">{product.name}</span>
          {price && <span className="block text-[13px] tabular-nums text-ink-soft">{formatPrice(price)}</span>}
        </span>
      </Link>
    </MotionDiv>
  );
}
