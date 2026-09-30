import { Link } from 'react-router-dom';
import { useBrands } from '@/hooks/useStoreData';
import { brandPath } from '@/utils/product';
import { cn } from '@/utils/cn';
import Eyebrow from './ui/Eyebrow';
import { CONTAINER } from './ui/styles';

// Enough tiles that one copy of the track is wider than any screen
const MIN_TILES = 14;

export default function BrandMarquee() {
  const { data, loading } = useBrands();
  const brands = data || [];

  if (loading) {
    return <div className="h-[184px] bg-canvas" aria-hidden="true" />;
  }
  if (!brands.length) return null;

  const repeats = Math.max(1, Math.ceil(MIN_TILES / brands.length));
  const track = Array.from({ length: repeats }, () => brands).flat();

  return (
    <section aria-labelledby="brands-title" className="bg-canvas py-16 sm:py-20">
      <div className={cn(CONTAINER, 'mb-8 flex items-end justify-between gap-6')}>
        <Eyebrow>
          <span id="brands-title">Brands we carry</span>
        </Eyebrow>
        <p className="hidden text-sm text-ink-faint sm:block">
          {brands.length} established homeopathic houses
        </p>
      </div>

      <div className="mask-fade-x overflow-hidden motion-reduce:overflow-x-auto">
        <div className="animate-marquee flex w-max gap-3 [--marquee-duration:60s] sm:gap-4">
          {[0, 1].map((copy) => (
            <ul
              key={copy}
              className="flex shrink-0 gap-3 sm:gap-4"
              aria-hidden={copy === 1 || undefined}
            >
              {track.map((brand, i) => (
                <li key={`${brand.name}-${i}`}>
                  <Link
                    to={brandPath(brand.name)}
                    tabIndex={copy === 1 || i >= brands.length ? -1 : undefined}
                    className="group flex h-20 w-40 items-center justify-center rounded-2xl bg-surface px-5 ring-1 ring-inset ring-line transition-colors duration-500 hover:bg-plate dark:bg-plate dark:hover:bg-[#EEEBE4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:h-24 sm:w-48"
                  >
                    {brand.image_url ? (
                      <img
                        src={brand.image_url}
                        alt={copy === 1 || i >= brands.length ? '' : brand.name}
                        loading="lazy"
                        decoding="async"
                        className="max-h-[60%] max-w-full object-contain opacity-70 grayscale transition duration-500 group-hover:opacity-100 group-hover:grayscale-0"
                      />
                    ) : (
                      <span className="text-center font-display text-[15px] font-medium tracking-[-0.01em] text-ink-soft transition-colors group-hover:text-ink dark:text-[#4A5566] dark:group-hover:text-[#0E1726]">
                        {brand.name}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
