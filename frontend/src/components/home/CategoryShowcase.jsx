import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { revealGroup, revealUp, IN_VIEW } from '@/animations/variants';
import { useCategories, useCategoryShowcase } from '@/hooks/useStoreData';
import { categoryPath, productImages } from '@/utils/product';
import { cn } from '@/utils/cn';
import SectionHeading from './ui/SectionHeading';
import Accent from './ui/Accent';
import StatusMessage from './ui/StatusMessage';
import { CONTAINER, SECTION_Y } from './ui/styles';

const MotionDiv = motion.div;

const FEATURED_TILES = 6;

// One line of context for the store's real categories
const DESCRIPTIONS = {
  Dilutions: 'Single remedies in classic potencies',
  'Homeopathic Medicines': 'Formulations for everyday concerns',
  'Homeopathic Tablets (Trituration)': 'Triturated remedies in tablet form',
  'Mother Tinctures': 'Botanical extracts in Q potency',
  'Bio-Chemic Tablets': 'The twelve classic tissue salts',
  'Bio-Combination Tablets': 'Tissue-salt blends for common needs',
  'Beauty & Personal Care': 'Gentle care for skin and hair',
  'Bach Flower Remedies': 'Flower essences for emotional balance',
  Syrups: 'Easy-to-take liquid formulations',
  Tablets: 'Convenient everyday tablets',
};

const TINTS = ['bg-tint-1', 'bg-tint-4', 'bg-tint-3', 'bg-tint-2', 'bg-tint-5', 'bg-mist'];

// Opaque, lighter version of each tile tint for the packshot pedestal.
// It must be opaque: multiply against a translucent fill turns the packshots'
// white backgrounds into visible squares whenever Chrome composites them apart
// (e.g. mid hover transition). Dark mode seats packshots on the light plate.
const PEDESTAL_TINTS = [
  'bg-[color-mix(in_srgb,var(--c-tint-1)_45%,white)]',
  'bg-[color-mix(in_srgb,var(--c-tint-4)_45%,white)]',
  'bg-[color-mix(in_srgb,var(--c-tint-3)_45%,white)]',
  'bg-[color-mix(in_srgb,var(--c-tint-2)_45%,white)]',
  'bg-[color-mix(in_srgb,var(--c-tint-5)_45%,white)]',
  'bg-[color-mix(in_srgb,var(--c-mist)_45%,white)]',
];

// Bento placement on a 12-column grid (lg+). The first four fill two rows,
// the next row holds two tiles and the "browse all" tile.
const SPANS = [
  'md:col-span-2 lg:col-span-6 lg:row-span-2',
  'lg:col-span-3 lg:row-span-2',
  'lg:col-span-3',
  'lg:col-span-3',
  'lg:col-span-4',
  'lg:col-span-4',
];

export default function CategoryShowcase() {
  const showcase = useCategoryShowcase();
  const names = useCategories();

  // The showcase (ordered by size, with packshots) is the source; plain names
  // are only a fallback if it fails. Rendering names first and then swapping
  // order would make snap-scrolling rows jump to the old first tile.
  const categories = showcase.error
    ? (names.data || []).map((name) => ({ name, products: [] }))
    : showcase.data || [];
  const loading = showcase.loading || (showcase.error && names.loading);
  const failed = !loading && !categories.length && Boolean(showcase.error);

  const tiles = categories.slice(0, FEATURED_TILES);
  const rest = categories.slice(FEATURED_TILES);
  const bento = tiles.length === FEATURED_TILES;

  const retry = () => {
    showcase.retry();
    names.retry();
  };

  return (
    <section id="categories" aria-labelledby="categories-title" className={cn('scroll-mt-24 bg-canvas', SECTION_Y)}>
      <div className={CONTAINER}>
        <SectionHeading
          id="categories-title"
          eyebrow="Shop by category"
          index="01"
          lines={['Every remedy,', <>in its <Accent>right form.</Accent></>]}
          intro="From classic dilutions to botanical mother tinctures — browse the range the way homeopathy is practised."
        />

        <div className="mt-14 lg:mt-20">
          {loading ? (
            <CategorySkeleton />
          ) : failed ? (
            <StatusMessage
              title="We couldn't load categories"
              text="Check your connection and try again."
              onRetry={retry}
            />
          ) : !categories.length ? (
            <StatusMessage
              title="Categories are on their way"
              text="In the meantime, the full catalogue is ready to browse."
              action={{ to: '/shop', label: 'Browse all products' }}
            />
          ) : (
            <>
              <MotionDiv
                variants={revealGroup(0.07)}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.1 }}
                className={cn(
                  // Phones: swipeable row. Tablets: two columns. Desktop: bento.
                  '-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 no-scrollbar sm:-mx-6 sm:scroll-px-6 sm:px-6',
                  'md:mx-0 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:px-0 md:pb-0 md:auto-rows-[260px]',
                  bento ? 'lg:grid-cols-12 lg:auto-rows-[228px]' : 'lg:grid-cols-3 lg:auto-rows-[300px]'
                )}
              >
                {tiles.map((category, i) => (
                  <CategoryTile
                    key={category.name}
                    category={category}
                    index={i}
                    shape={bento ? (i === 0 ? 'large' : i === 1 ? 'tall' : 'small') : 'small'}
                    className={cn(bento ? SPANS[i] : i === 0 && 'md:col-span-2 lg:col-span-1', TINTS[i % TINTS.length])}
                  />
                ))}
                <BrowseAllTile count={categories.length} className={bento ? 'lg:col-span-4' : undefined} />
              </MotionDiv>

              {rest.length > 0 && (
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <p className="shrink-0 text-[11px] font-medium uppercase tracking-[0.22em] text-ink-faint">Also explore</p>
                  <ul className="flex flex-wrap gap-2">
                    {rest.map((c) => (
                      <li key={c.name}>
                        <Link
                          to={categoryPath(c.name)}
                          className="inline-flex min-h-10 items-center rounded-full px-4 text-[13px] font-medium text-ink ring-1 ring-inset ring-line transition-colors duration-300 hover:bg-ink hover:text-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                        >
                          {c.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

// Pedestal placement per tile shape. It sits top-right so names at the
// bottom-left never collide with it; sizes follow each breakpoint's tile shape.
const PEDESTAL = {
  // phones: tall card · tablets: wide card · desktop: by bento slot
  base: '-right-[14%] -top-[6%] h-[58%] md:-right-[8%] md:-top-[22%] md:h-[88%]',
  large: 'lg:-right-[3%] lg:-top-[10%] lg:h-[84%]',
  tall: 'lg:-right-[20%] lg:-top-[5%] lg:h-[60%]',
  small: 'lg:-right-[14%] lg:-top-[26%] lg:h-[76%]',
};

function CategoryTile({ category, index, shape = 'small', className }) {
  const packshots = category.products
    .map((p) => productImages(p)[0])
    .filter(Boolean)
    .slice(0, 3);
  const description = DESCRIPTIONS[category.name] || 'Explore the range';
  const large = shape === 'large';

  return (
    <MotionDiv
      variants={revealUp}
      className={cn('relative h-[380px] w-[76vw] shrink-0 snap-start overflow-hidden rounded-[2rem] sm:w-[48vw] md:h-auto md:w-auto', className)}
    >
      <Link
        to={categoryPath(category.name)}
        className="group absolute inset-0 flex flex-col justify-between p-6 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-accent sm:p-7 lg:p-8"
      >
        {/* Hover wash */}
        <span className="absolute inset-0 bg-ink/0 transition-colors duration-700 group-hover:bg-ink/4" aria-hidden="true" />

        {/* Pedestal with up to three real packshots, fanning out on hover */}
        {packshots.length > 0 && (
          <span
            aria-hidden="true"
            className={cn(
              'absolute aspect-square rounded-full dark:bg-plate',
              PEDESTAL_TINTS[index % PEDESTAL_TINTS.length],
              PEDESTAL.base,
              PEDESTAL[shape]
            )}
          >
            {packshots.map((src, k) => (
              <img
                key={src}
                src={src}
                alt=""
                loading="lazy"
                decoding="async"
                className={cn(
                  'absolute top-[36%] h-[46%] w-[46%] object-contain mix-blend-multiply transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
                  packshots.length === 1 && 'left-[24%] h-[52%] w-[52%] group-hover:scale-105',
                  packshots.length > 1 && k === 0 && 'left-[27%] z-10 group-hover:-translate-y-[6%] group-hover:scale-105',
                  packshots.length > 1 && k === 1 && 'left-[8%] top-[41%] -rotate-6 group-hover:-translate-x-[10%] group-hover:-rotate-12',
                  packshots.length > 1 && k === 2 && 'left-[46%] top-[41%] rotate-6 group-hover:translate-x-[10%] group-hover:rotate-12'
                )}
              />
            ))}
          </span>
        )}

        <span className="relative font-display text-sm tabular-nums text-ink-faint">{String(index + 1).padStart(2, '0')}</span>

        <span className="relative flex items-end justify-between gap-4">
          <span
            className={cn(
              'transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1.5',
              large ? 'max-w-[34rem]' : 'max-w-[16rem]'
            )}
          >
            <span
              className={cn(
                'block text-balance font-display font-medium leading-[1.02] tracking-[-0.03em] text-ink',
                large ? 'text-[clamp(1.75rem,3.2vw,3rem)]' : 'text-[clamp(1.35rem,1.8vw,1.75rem)]'
              )}
            >
              {category.name}
            </span>
            <span className="mt-2 block text-[13px] leading-snug text-ink-soft sm:text-sm">{description}</span>
          </span>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-canvas transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:translate-y-2 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-focus-visible:translate-y-0 lg:group-focus-visible:opacity-100">
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </span>
      </Link>
    </MotionDiv>
  );
}

function BrowseAllTile({ count, className }) {
  return (
    <MotionDiv
      variants={revealUp}
      className={cn('relative h-[380px] w-[76vw] shrink-0 snap-start overflow-hidden rounded-[2rem] bg-deep sm:w-[48vw] md:h-auto md:w-auto', className)}
    >
      <Link
        to="/shop"
        className="group absolute inset-0 flex flex-col justify-between p-6 text-on-deep focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-accent sm:p-7 lg:p-8"
      >
        <span
          className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(closest-side,rgba(107,164,226,0.35),transparent)] transition-transform duration-1000 group-hover:scale-125"
          aria-hidden="true"
        />
        <span className="relative text-[11px] font-medium uppercase tracking-[0.22em] text-on-deep-soft">
          {count} categories
        </span>
        <span className="relative flex items-end justify-between gap-4">
          <span className="font-display text-[clamp(1.5rem,2.2vw,2.1rem)] font-medium leading-[1.02] tracking-[-0.03em]">
            Browse the full <span className="font-serif italic font-normal">catalogue</span>
          </span>
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-on-deep text-deep transition-transform duration-500 group-hover:rotate-45">
            <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
          </span>
        </span>
      </Link>
    </MotionDiv>
  );
}

function CategorySkeleton() {
  return (
    <ul
      aria-label="Loading categories"
      className="-mx-4 flex gap-3 overflow-hidden px-4 sm:-mx-6 sm:px-6 md:mx-0 md:grid md:grid-cols-2 md:gap-4 md:px-0 md:auto-rows-[260px] lg:grid-cols-12 lg:auto-rows-[228px]"
    >
      {SPANS.map((span, i) => (
        <li
          key={i}
          className={cn('skeleton-shimmer h-[380px] w-[76vw] shrink-0 rounded-[2rem] sm:w-[48vw] md:h-auto md:w-auto', span)}
        />
      ))}
      <li className="skeleton-shimmer hidden rounded-[2rem] lg:col-span-4 lg:block" />
    </ul>
  );
}
