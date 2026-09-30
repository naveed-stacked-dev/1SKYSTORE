import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useBrands, useCategories } from '@/hooks/useStoreData';
import { brandPath, categoryPath } from '@/utils/product';
import botanical640 from '@/assets/home/botanical-640.webp';
import { EASE } from './styles';

const MotionDiv = motion.div;

const BRAND_LIMIT = 8;

/** Desktop mega panel: categories, brands and a journal feature */
export default function CategoriesPanel({ id, onNavigate }) {
  const categories = useCategories();
  const brands = useBrands();

  return (
    <MotionDiv
      id={id}
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="overflow-hidden"
    >
      <div className="grid grid-cols-12 gap-8 border-t border-line px-6 pb-6 pt-7">
        <div className="col-span-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-ink-faint">Shop by category</p>
          <ul className="mt-4 grid grid-cols-2 gap-x-6">
            {categories.loading
              ? Array.from({ length: 8 }, (_, i) => (
                  <li key={i} className="skeleton-shimmer my-2.5 h-4 w-3/4 rounded-full" aria-hidden="true" />
                ))
              : (categories.data || []).map((name) => (
                  <li key={name}>
                    <PanelLink to={categoryPath(name)} onNavigate={onNavigate}>
                      {name}
                    </PanelLink>
                  </li>
                ))}
          </ul>
        </div>

        <div className="col-span-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-ink-faint">Popular brands</p>
          <ul className="mt-4 grid grid-cols-2 gap-x-6">
            {(brands.data || []).slice(0, BRAND_LIMIT).map((brand) => (
              <li key={brand.name}>
                <PanelLink to={brandPath(brand.name)} onNavigate={onNavigate}>
                  {brand.name}
                </PanelLink>
              </li>
            ))}
          </ul>
          <Link
            to="/shop"
            onClick={onNavigate}
            className="group mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            All products
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>

        <Link
          to="/blog"
          onClick={onNavigate}
          className="group relative col-span-3 flex min-h-56 flex-col justify-end overflow-hidden rounded-[1.5rem] p-5 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <img
            src={botanical640}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" aria-hidden="true" />
          <span className="relative text-[11px] font-medium uppercase tracking-[0.2em] text-white/75">The journal</span>
          <span className="relative mt-1 font-display text-lg font-medium leading-snug">
            New to homeopathy? Start with our guides.
          </span>
        </Link>
      </div>
    </MotionDiv>
  );
}

function PanelLink({ to, onNavigate, children }) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className="group flex items-center justify-between gap-2 rounded-lg py-2 text-[15px] text-ink-soft transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <span className="truncate">{children}</span>
      <ArrowUpRight
        className="h-3.5 w-3.5 shrink-0 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
        aria-hidden="true"
      />
    </Link>
  );
}
