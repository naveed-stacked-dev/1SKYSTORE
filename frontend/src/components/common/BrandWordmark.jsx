import { cn } from '@/utils/cn';
import logo320 from '@/assets/home/logo-320.webp';
import logo640 from '@/assets/home/logo-640.webp';
import logo1280 from '@/assets/home/logo-1280.webp';

/**
 * The 1SKYSTORE logo, served as optimized WebP (master: src/assets/logo.png).
 * Size it with a height class, e.g. className="h-12"; width follows the
 * logo's ~2.3:1 ratio. `priority` loads it eagerly (use for the navbar).
 */
export default function BrandWordmark({ className, priority = false }) {
  return (
    <img
      src={logo640}
      srcSet={`${logo320} 320w, ${logo640} 640w, ${logo1280} 1280w`}
      sizes="(min-width: 640px) 240px, 160px"
      width={640}
      height={278}
      alt="1SkyStore — Homeopathic medicines & more"
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      draggable={false}
      className={cn('block h-10 w-auto select-none object-contain', className)}
    />
  );
}
