import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, TrendingUp, BookOpen, Send, ChevronLeft, ChevronRight, Leaf, Truck, ShieldCheck, Lock, LayoutGrid, Mail } from 'lucide-react';
import productService from '@/api/product.service';
import blogService from '@/api/blog.service';
import bannerService from '@/api/banner.service';
import brandService from '@/api/brand.service';
import { fetchWithCache } from '@/utils/apiCache';
import { useAuth } from '@/context/AuthContext';
import ProductCard from '@/components/ecommerce/ProductCard';
import SymptomSection from '@/components/ecommerce/SymptomSection';
import BrandHeroGrid from '@/components/ecommerce/BrandHeroGrid';
import HeroBannerSlider from '@/components/ecommerce/HeroBannerSlider';
import TopSymptomsSection from '@/components/ecommerce/TopSymptomsSection';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import { staggerContainer, staggerItem } from '@/animations/variants';
import { getStorage, setStorage } from '@/utils/storage';
import heroImage from '@/assets/hero.png';

const EXTERNAL_URL_RE = /^(https?:)?\/\//i;
const BANNER_CACHE_KEY = 'home_banner_cache_v1';

const HERO_HIGHLIGHTS = [
  { icon: ShieldCheck, title: '100% Genuine', text: 'Trusted brands' },
  { icon: Truck, title: 'Fast Delivery', text: 'Across India' },
  { icon: Lock, title: 'Safe Checkout', text: 'Secure payments' },
];

function getCachedBanners() {
  const cached = getStorage(BANNER_CACHE_KEY);
  if (!cached || typeof cached !== 'object') {
    return { heroDesktop: [], heroMobile: [], infoDesktop: null, infoMobile: null };
  }

  return {
    heroDesktop: Array.isArray(cached.heroDesktop) ? cached.heroDesktop : [],
    heroMobile: Array.isArray(cached.heroMobile) ? cached.heroMobile : [],
    infoDesktop: cached.infoDesktop && typeof cached.infoDesktop === 'object' ? cached.infoDesktop : null,
    infoMobile: cached.infoMobile && typeof cached.infoMobile === 'object' ? cached.infoMobile : null,
  };
}

function warmBannerImages(banners = []) {
  banners.forEach((banner) => {
    if (!banner?.image_url) return;
    const image = new Image();
    image.src = banner.image_url;
  });
}

export default function Home() {
  const MotionDiv = motion.div;
  const MotionH1 = motion.h1;
  const MotionP = motion.p;
  const { isAuthenticated } = useAuth();
  const cachedBanners = useMemo(() => getCachedBanners(), []);
  const [products, setProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [heroDesktop, setHeroDesktop] = useState(cachedBanners.heroDesktop);
  const [heroMobile, setHeroMobile] = useState(cachedBanners.heroMobile);
  const [infoDesktop, setInfoDesktop] = useState(cachedBanners.infoDesktop);
  const [infoMobile, setInfoMobile] = useState(cachedBanners.infoMobile);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const brandsScrollRef = useRef(null);
  const [isBrandsHovered, setIsBrandsHovered] = useState(false);

  // ─── Trending Now carousel ────────────────────────────────────────────────
  const trendingScrollRef = useRef(null);
  const [trendingArrows, setTrendingArrows] = useState({ left: false, right: false });

  // An arrow only shows when there's actually room to move that way
  const updateTrendingArrows = useCallback(() => {
    const el = trendingScrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setTrendingArrows({
      left: el.scrollLeft > 4,
      right: el.scrollLeft < maxScroll - 4, // tolerance for sub-pixel widths
    });
  }, []);

  const scrollTrending = (direction) => {
    const el = trendingScrollRef.current;
    if (!el) return;
    // Advance by most of a viewport so a partly visible card isn't skipped
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  useEffect(() => {
    updateTrendingArrows();
    window.addEventListener('resize', updateTrendingArrows);
    return () => window.removeEventListener('resize', updateTrendingArrows);
  }, [trendingProducts, updateTrendingArrows]);

  const hasFetched = useRef(false);

  useEffect(() => {
    document.title = '1SkyStore — Natural Wellness & Homeopathy';
    if (hasFetched.current) return;
    hasFetched.current = true;
    loadData();
  }, []);

  useEffect(() => {
    const bannersToWarm = [
      ...heroDesktop, 
      ...heroMobile, 
      ...(infoDesktop ? [infoDesktop] : []), 
      ...(infoMobile ? [infoMobile] : [])
    ];
    warmBannerImages(bannersToWarm);
  }, [heroDesktop, heroMobile, infoDesktop, infoMobile]);

  useEffect(() => {
    if (!brandsScrollRef.current) return;
    const container = brandsScrollRef.current;
    let animationId;
    
    const scroll = () => {
      if (!isBrandsHovered) {
        container.scrollLeft += 1;
        // If we hit the end, smoothly reset to start
        if (container.scrollLeft >= container.scrollWidth - container.clientWidth - 1) {
          container.scrollLeft = 0;
        }
      }
      animationId = requestAnimationFrame(scroll);
    };
    
    animationId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationId);
  }, [isBrandsHovered, brands]);

  async function loadData() {
    try {
      setLoading(true);
      const [productsRes, trendingRes, brandsRes, blogsRes, bannersRes] = await Promise.allSettled([
        productService.getProducts({ pageSize: 4, is_featured: true }),
        productService.getProducts({ pageSize: 8, is_trending: true }),
        brandService.getBrands(),
        blogService.getBlogs({ limit: 3 }),
        bannerService.getBanners(),
      ]);

      if (productsRes.status === 'fulfilled') {
        const data = productsRes.value.data?.data || productsRes.value.data;
        setProducts(data?.products || data?.rows || data || []);
      }
      
      if (trendingRes.status === 'fulfilled') {
        const data = trendingRes.value.data?.data || trendingRes.value.data;
        setTrendingProducts(data?.products || data?.rows || data || []);
      }

      if (brandsRes.status === 'fulfilled') {
        const data = brandsRes.value.data?.data || brandsRes.value.data;
        setBrands(Array.isArray(data) ? data : []);
      }

      if (blogsRes.status === 'fulfilled') {
        const data = blogsRes.value.data?.data || blogsRes.value.data;
        setBlogs(Array.isArray(data) ? data : data?.blogs || data?.rows || []);
      }

      if (bannersRes.status === 'fulfilled') {
        const data = bannersRes.value.data?.data;
        const nextHeroDesktop = data?.heroDesktop || data?.hero || [];
        const nextHeroMobile = data?.heroMobile || data?.hero || [];
        const nextInfoDesktop = data?.infoDesktop || data?.info || null;
        const nextInfoMobile = data?.infoMobile || data?.info || null;

        setHeroDesktop(nextHeroDesktop);
        setHeroMobile(nextHeroMobile);
        setInfoDesktop(nextInfoDesktop);
        setInfoMobile(nextInfoMobile);
        setStorage(BANNER_CACHE_KEY, {
          heroDesktop: nextHeroDesktop,
          heroMobile: nextHeroMobile,
          infoDesktop: nextInfoDesktop,
          infoMobile: nextInfoMobile,
          updatedAt: Date.now(),
        });
      }
    } finally {
      setLoading(false);
    }
  }

  const featuredProducts = useMemo(() => products.slice(0, 4), [products]);

  const defaultHeroSlide = (
    <section className="relative overflow-hidden min-h-[calc(100vh-140px)] sm:min-h-[60vh] flex flex-col justify-center">
      {/* Layered background: soft gradient, masked grid, colour glows */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-neutral-950 dark:via-neutral-950 dark:to-primary-900/30" />
      <div className="bg-grid-pattern absolute inset-0" />
      <div className="absolute -top-32 right-[-10%] h-[520px] w-[520px] rounded-full bg-secondary-200/40 blur-3xl dark:bg-secondary-800/15" />
      <div className="absolute -bottom-40 -left-24 h-[440px] w-[440px] rounded-full bg-primary-200/35 blur-3xl dark:bg-primary-800/15" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary-200 to-transparent dark:via-primary-800/60" />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 w-full">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-8">
          <MotionDiv
            className="max-w-2xl"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            {isAuthenticated ? (
              <MotionDiv
                variants={staggerItem}
                className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white/80 py-1.5 pl-1.5 pr-4 shadow-sm backdrop-blur dark:border-primary-800/50 dark:bg-primary-900/30"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-white">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
                <Link to="/dashboard" className="text-sm font-semibold text-primary-600 transition hover:text-primary-700 dark:text-primary-300">
                  Go to your Dashboard →
                </Link>
              </MotionDiv>
            ) : (
              <MotionDiv
                variants={staggerItem}
                className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary-100 bg-white/80 py-1.5 pl-1.5 pr-4 shadow-sm backdrop-blur dark:border-primary-800/50 dark:bg-primary-900/30"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-white">
                  <Leaf className="h-3.5 w-3.5" />
                </span>
                <span className="text-xs font-semibold tracking-wide text-primary-700 dark:text-primary-200 sm:text-sm">
                  100% genuine homeopathic medicines
                </span>
              </MotionDiv>
            )}

            <MotionH1
              variants={staggerItem}
              className="font-heading text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.4rem] xl:text-[4.25rem]"
            >
              <span className="bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent dark:from-primary-300 dark:to-primary-400">
                Natural{' '}
              </span>
              <span className="relative isolate inline-block whitespace-nowrap">
                {/* Highlighter stroke sits behind the word, clear of the descenders */}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 220 24"
                  preserveAspectRatio="none"
                  className="absolute -left-[0.04em] bottom-[0.16em] -z-10 h-[0.34em] w-[104%] text-secondary-200/80 dark:text-primary-800/60"
                >
                  <path d="M4 16C40 7 120 3 216 9L212 22C140 16 60 17 8 22Z" fill="currentColor" />
                </svg>
                <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent dark:from-primary-400 dark:to-secondary-400">
                  healing,
                </span>
              </span>
              <br />
              <span className="text-neutral-900 dark:text-white">
                modern living.
              </span>
            </MotionH1>

            <MotionP
              variants={staggerItem}
              className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-500 dark:text-neutral-400 sm:text-xl"
            >
              Premium homeopathy remedies and wellness essentials — curated for your holistic health journey.
            </MotionP>

            <MotionDiv
              variants={staggerItem}
              className="mt-8 flex flex-wrap gap-3 sm:gap-4"
            >
              <Link to="/shop">
                <Button size="lg" className="group gap-2">
                  Shop Now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/shop">
                <Button
                  variant="ghost"
                  size="lg"
                  className="border border-neutral-200 bg-white/80 shadow-sm backdrop-blur hover:border-primary-300 dark:border-neutral-700 dark:bg-neutral-900/60"
                >
                  <LayoutGrid className="h-4 w-4 text-primary-500" />
                  Explore Categories
                </Button>
              </Link>
            </MotionDiv>

            <MotionDiv
              variants={staggerItem}
              className="mt-9 flex items-center gap-4 sm:gap-5"
            >
              <div className="flex -space-x-2.5">
                {[5,6,7,8,9,10,11].map((i) => (
                  <img
                    key={i}
                    src={`https://i.pravatar.cc/80?img=${i + 10}`}
                    alt={`Customer ${i}`}
                    className="h-9 w-9 rounded-full border-2 border-white object-cover shadow-sm dark:border-neutral-900"
                  />
                ))}
              </div>
              <div className="border-l border-neutral-200 pl-4 dark:border-neutral-800 sm:pl-5">
                <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">10,000+ happy customers</p>
                <p className="text-xs text-neutral-400">Trusted worldwide</p>
              </div>
            </MotionDiv>

            <MotionDiv
              variants={staggerItem}
              className="mt-9 grid max-w-2xl grid-cols-3 gap-2 sm:gap-3"
            >
              {HERO_HIGHLIGHTS.map(({ icon, title, text }) => {
                const Icon = icon;
                return (
                <div
                  key={title}
                  className="flex flex-col items-start gap-2 rounded-2xl border border-white/80 bg-white/60 p-3 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:gap-3 dark:border-neutral-800 dark:bg-neutral-900/50"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/40 dark:text-primary-300">
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-100 sm:text-sm">{title}</p>
                    <p className="text-[11px] leading-snug text-neutral-500 dark:text-neutral-400 sm:text-xs">{text}</p>
                  </div>
                </div>
                );
              })}
            </MotionDiv>
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="relative hidden lg:block"
          >
            {/* Halo + orbit ring behind the product shot */}
            <div className="absolute left-1/2 top-1/2 h-[440px] w-[440px] -translate-x-[42%] -translate-y-1/2 rounded-full bg-gradient-to-br from-primary-100 via-secondary-50 to-white shadow-[inset_0_0_60px_rgba(21,101,192,0.08)] dark:from-primary-900/40 dark:via-neutral-900 dark:to-neutral-950" />
            <div className="animate-spin-slower absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-[42%] -translate-y-1/2 rounded-full border border-dashed border-primary-200/80 dark:border-primary-800/50" />

            <img
              src={heroImage}
              alt="Homeopathy Bottles"
              className="relative max-h-[600px] w-full object-contain drop-shadow-2xl"
            />

            {/* Floating info cards */}
            <MotionDiv
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="absolute left-[4%] top-[14%]"
            >
              <div className="animate-float flex items-center gap-3 rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-elevated backdrop-blur-md dark:border-neutral-700/60 dark:bg-neutral-900/80">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-sm">
                  <Leaf className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">Natural remedies</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Gentle &amp; effective care</p>
                </div>
              </div>
            </MotionDiv>

            <MotionDiv
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="absolute bottom-[12%] right-[2%]"
            >
              <div className="animate-float-delayed flex items-center gap-3 rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-elevated backdrop-blur-md dark:border-neutral-700/60 dark:bg-neutral-900/80">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 text-white shadow-sm">
                  <Truck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">Fast delivery</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Shipped across India</p>
                </div>
              </div>
            </MotionDiv>
          </MotionDiv>
        </div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen">
      <div className="hidden sm:block">
        <HeroBannerSlider
          initialSlide={defaultHeroSlide}
          banners={heroDesktop}
          loading={loading}
        />
      </div>
      <div className="block sm:hidden">
        <HeroBannerSlider
          initialSlide={defaultHeroSlide}
          banners={heroMobile}
          loading={loading}
        />
      </div>


      {/* <BrandHeroGrid /> */}



      <section className="bg-neutral-50/50 py-16 dark:bg-neutral-900/30 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="Curated"
            title="Featured Products"
            action={{ label: 'Shop all', to: '/shop' }}
          />
          <div className="mt-8">
            {loading ? (
              <div className="flex overflow-x-auto items-stretch snap-x snap-mandatory gap-5 pb-4 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4 no-scrollbar">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex flex-none w-[85vw] snap-center sm:w-auto">
                    <ProductCardSkeleton />
                  </div>
                ))}
              </div>
            ) : featuredProducts.length > 0 ? (
              <MotionDiv
                className="flex items-stretch overflow-x-auto snap-x snap-mandatory gap-5 pb-4 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4 no-scrollbar"
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, margin: '-100px' }}
              >
                {featuredProducts.map((product) => (
                  <MotionDiv key={product.id} variants={staggerItem} className="flex flex-none w-[85vw] snap-center sm:w-auto">
                    <ProductCard product={product} />
                  </MotionDiv>
                ))}
              </MotionDiv>
            ) : (
              <EmptyState text="Products coming soon" />
            )}
          </div>
        </div>
      </section>

      <BrandHeroGrid />


      {trendingProducts.length > 0 && (
        <section className="overflow-hidden py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              label="Popular"
              title={<span className="flex items-center gap-2"><TrendingUp className="h-6 w-6 text-primary-500" /> Trending Now</span>}
            />
            <div className="relative mt-8">
              {trendingArrows.left && (
                <button
                  type="button"
                  onClick={() => scrollTrending(-1)}
                  aria-label="Scroll trending products left"
                  className="absolute left-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-neutral-200 bg-white/95 p-3 text-neutral-700 shadow-lg backdrop-blur-sm transition-colors hover:text-primary-500 dark:border-neutral-800 dark:bg-neutral-900/95 dark:text-neutral-300 sm:block"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}

              {trendingArrows.right && (
                <button
                  type="button"
                  onClick={() => scrollTrending(1)}
                  aria-label="Scroll trending products right"
                  className="absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-neutral-200 bg-white/95 p-3 text-neutral-700 shadow-lg backdrop-blur-sm transition-colors hover:text-primary-500 dark:border-neutral-800 dark:bg-neutral-900/95 dark:text-neutral-300 sm:block"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}

              <div
                ref={trendingScrollRef}
                onScroll={updateTrendingArrows}
                className="overflow-x-auto no-scrollbar pb-4"
              >
                <MotionDiv
                  className="flex items-stretch gap-5"
                  variants={staggerContainer}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                >
                  {trendingProducts.map((product) => (
                    <MotionDiv
                      key={product.id}
                      variants={staggerItem}
                      className="w-[260px] flex-shrink-0 sm:w-[280px] flex"
                    >
                      <ProductCard product={product} />
                    </MotionDiv>
                  ))}
                </MotionDiv>
              </div>
            </div>
          </div>
        </section>
      )}

      <TopSymptomsSection />

      {brands.length > 0 && (
        <section className="relative py-16 sm:py-24 overflow-hidden">
          {/* Decorative blurred colour blobs */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#eef4fb] via-[#f4f8fd] to-[#e8f1fa] dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-200/40 dark:bg-primary-900/20 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary-200/30 dark:bg-secondary-900/20 rounded-full blur-3xl translate-y-1/2 pointer-events-none" />
          <div className="absolute top-1/2 left-0 w-60 h-60 bg-primary-100/50 dark:bg-primary-900/10 rounded-full blur-2xl -translate-y-1/2 pointer-events-none" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader label="Trusted" title="Our Brands" />
            <MotionDiv
              ref={brandsScrollRef}
              onMouseEnter={() => setIsBrandsHovered(true)}
              onMouseLeave={() => setIsBrandsHovered(false)}
              onTouchStart={() => setIsBrandsHovered(true)}
              onTouchEnd={() => setIsBrandsHovered(false)}
              className="mt-12 flex overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 gap-4 sm:gap-5 items-stretch no-scrollbar"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {brands.map((brand, i) => {
                const name = typeof brand === 'string' ? brand : brand.name;
                const slug = typeof brand === 'string' ? encodeURIComponent(brand) : (brand.slug || encodeURIComponent(brand.name));
                const imageUrl = typeof brand === 'object' ? brand.image_url : null;
                const key = typeof brand === 'string' ? brand : (brand.id || brand.name || i);

                return (
                  <MotionDiv key={key} variants={staggerItem} className="flex-shrink-0">
                    <Link
                      to={`/brand/${slug}`}
                      className="group relative flex w-[150px] sm:w-[190px] h-[90px] sm:h-[110px] items-center justify-center rounded-2xl border border-white/60 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.07)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)] transition-all duration-300 hover:scale-105 hover:bg-white/80 dark:hover:bg-white/10 hover:shadow-[0_8px_32px_rgba(19,77,22,0.15)] hover:border-primary-200/80 dark:hover:border-primary-500/30 overflow-hidden"
                    >
                      {/* Inner glass shine */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/50 via-transparent to-transparent dark:from-white/5 pointer-events-none" />
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={name}
                          className="relative z-10 max-h-[75%] max-w-[85%] object-contain transition-all duration-300 group-hover:scale-105"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <span className="relative z-10 text-base font-heading font-bold text-neutral-800 group-hover:text-primary-600 dark:text-neutral-200 dark:group-hover:text-primary-400 transition-colors duration-300 text-center leading-tight px-4">
                          {name}
                        </span>
                      )}
                    </Link>
                  </MotionDiv>
                );
              })}
            </MotionDiv>
          </div>
        </section>
      )}

       {infoDesktop?.image_url && (
        <section className="bg-white py-6 dark:bg-neutral-950 hidden sm:block">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <InfoBanner banner={infoDesktop} />
          </div>
        </section>
      )}

      {infoMobile?.image_url && (
        <section className="bg-white py-4 dark:bg-neutral-950 block sm:hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <InfoBanner banner={infoMobile} />
          </div>
        </section>
      )}


      {blogs.length > 0 && (
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              label="Read"
              title={<span className="flex items-center gap-2"><BookOpen className="h-6 w-6 text-primary-500" /> From Our Blog</span>}
              action={{ label: 'Read all', to: '/blog' }}
            />
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {blogs.slice(0, 3).map((blog) => (
                <Link
                  key={blog.id}
                  to={`/blog/${blog.slug || blog.id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary-100 hover:shadow-premium dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-primary-800/60"
                >
                  {blog.cover_image_url && (
                    <div className="relative aspect-video overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                      <img
                        src={blog.cover_image_url}
                        alt={blog.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/25 via-transparent to-transparent" />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <p className="mb-3 inline-flex w-fit items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-primary-600 dark:bg-primary-900/30 dark:text-primary-300">
                      {blog.category || 'Wellness'}
                    </p>
                    <h3 className="line-clamp-2 text-base font-semibold text-neutral-800 transition-colors group-hover:text-primary-500 dark:text-neutral-100">
                      {blog.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">
                      {blog.excerpt || blog.description}
                    </p>
                    <div className="mt-auto flex items-center gap-2 pt-4 text-xs font-semibold text-primary-500">
                      Read more <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 px-8 py-16 text-center shadow-premium sm:px-16 sm:py-20">
            <div className="bg-dots-light absolute inset-0 opacity-50" />
            <div className="absolute -left-16 -top-16 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
            <div className="absolute -bottom-20 -right-10 h-96 w-96 rounded-full bg-secondary-300/20 blur-3xl" />
            <div className="absolute right-10 top-10 hidden h-24 w-24 rounded-full border border-white/15 sm:block" />
            <div className="absolute bottom-10 left-12 hidden h-14 w-14 rounded-full border border-white/15 sm:block" />

            <div className="relative z-10 mx-auto max-w-xl">
              <span className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/25 backdrop-blur">
                <Mail className="h-6 w-6" />
              </span>
              <h2 className="mb-4 font-heading text-3xl font-bold text-white sm:text-4xl">
                Stay in the loop
              </h2>
              <p className="mb-8 text-base leading-relaxed text-white/75">
                Get exclusive deals, new product alerts, and wellness tips delivered to your inbox.
              </p>
              <div className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row sm:gap-2 sm:rounded-2xl sm:bg-white/10 sm:p-1.5 sm:ring-1 sm:ring-white/20 sm:backdrop-blur-sm">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 rounded-xl border border-white/20 bg-white/10 px-5 py-3.5 text-sm text-white placeholder:text-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/30 sm:border-transparent sm:bg-transparent"
                />
                <button className="flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-primary-600 shadow-lg shadow-primary-900/20 transition-all hover:bg-primary-50">
                  <Send className="h-4 w-4" /> Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SymptomSection bgClass="bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800" />
    </div>
  );
}

function SectionHeader({ label, title, action }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        {label && (
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary-600 ring-1 ring-inset ring-primary-100 dark:bg-primary-900/30 dark:text-primary-300 dark:ring-primary-800/60">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-500 dark:bg-primary-400" />
            {label}
          </p>
        )}
        <h2 className="font-heading text-2xl font-bold text-neutral-900 dark:text-neutral-50 sm:text-3xl">
          {title}
        </h2>
      </div>
      {action && (
        <Link
          to={action.to}
          className="group hidden shrink-0 items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-primary-600 shadow-sm transition-all hover:border-primary-300 hover:shadow-card dark:border-neutral-700 dark:bg-neutral-900 dark:text-primary-400 dark:hover:border-primary-700 sm:flex"
        >
          {action.label} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

function InfoBanner({ banner }) {
  const image = (
    <div className="overflow-hidden rounded-3xl border border-neutral-200/70 bg-neutral-100 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <img
        src={banner.image_url}
        alt="Info banner"
        className="h-auto w-full object-cover"
        loading="lazy"
      />
    </div>
  );

  if (banner.link) {
    if (EXTERNAL_URL_RE.test(banner.link)) {
      return (
        <a href={banner.link} target="_blank" rel="noreferrer" className="block transition-transform hover:scale-[1.01]">
          {image}
        </a>
      );
    }

    return (
      <Link to={banner.link} className="block transition-transform hover:scale-[1.01]">
        {image}
      </Link>
    );
  }

  return image;
}

function EmptyState({ text }) {
  return (
    <div className="py-16 text-center">
      <p className="text-neutral-400 dark:text-neutral-500">{text}</p>
    </div>
  );
}
