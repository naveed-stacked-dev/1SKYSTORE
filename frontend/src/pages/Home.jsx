import { useRef, useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, TrendingUp, BookOpen, Send } from 'lucide-react';
import productService from '@/api/product.service';
import blogService from '@/api/blog.service';
import { fetchWithCache } from '@/utils/apiCache';
import { useAuth } from '@/context/AuthContext';
import { useGeo } from '@/context/GeoContext';
import ProductCard from '@/components/ecommerce/ProductCard';
import CategoryCard from '@/components/ecommerce/CategoryCard';
import BrandHeroGrid from '@/components/ecommerce/BrandHeroGrid';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import { staggerContainer, staggerItem, slideUp } from '@/animations/variants';
import heroImage from '@/assets/hero.png';

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { currency } = useGeo();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  
  const hasFetched = useRef(false);

  useEffect(() => {
    document.title = '1SkyStore — Natural Wellness & Homeopathy';
    if (hasFetched.current) return;
    hasFetched.current = true;
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [productsRes, categoriesRes, brandsRes, blogsRes] = await Promise.allSettled([
        productService.getProducts({ pageSize: 8 }),
        fetchWithCache('categories', () => productService.getCategories()),
        fetchWithCache('brands', () => productService.getBrands()),
        blogService.getBlogs({ limit: 3 }),
      ]);

      if (productsRes.status === 'fulfilled') {
        const d = productsRes.value.data?.data || productsRes.value.data;
        setProducts(d?.products || d?.rows || d || []);
      }
      if (categoriesRes.status === 'fulfilled') {
        const d = categoriesRes.value.data?.data || categoriesRes.value.data;
        setCategories(Array.isArray(d) ? d : d?.categories || []);
      }
      if (brandsRes.status === 'fulfilled') {
        const d = brandsRes.value.data?.data || brandsRes.value.data;
        setBrands(Array.isArray(d) ? d : d?.brands || []);
      }
      if (blogsRes.status === 'fulfilled') {
        const d = blogsRes.value.data?.data || blogsRes.value.data;
        setBlogs(Array.isArray(d) ? d : d?.blogs || d?.rows || []);
      }
    } finally {
      setLoading(false);
    }
  }

  const featuredProducts = useMemo(() => products.slice(0, 4), [products]);
  const trendingProducts = useMemo(() => products.slice(0, 8), [products]);

  return (
    <div className="min-h-screen">
      {/* ═══════════ HERO SECTION ═══════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-secondary-50 to-white dark:from-primary-900/20 dark:via-neutral-950 dark:to-neutral-950" />
        <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-secondary-200/30 dark:bg-secondary-800/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-10 w-[400px] h-[400px] bg-primary-200/20 dark:bg-primary-900/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* LEFT COLUMN - TEXT */}
            <motion.div
              className="max-w-2xl"
              initial="initial"
              animate="animate"
              variants={staggerContainer}
            >
              {isAuthenticated && (
                <motion.div
                  variants={staggerItem}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800/50 mb-8"
                >
                  <Sparkles className="w-4 h-4 text-primary-500" />
                  <Link to="/dashboard" className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 transition">
                    Go to your Dashboard →
                  </Link>
                </motion.div>
              )}

              <motion.h1
                variants={staggerItem}
                className="text-4xl sm:text-5xl lg:text-7xl font-heading font-bold tracking-tight leading-[1.1]"
              >
                <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 bg-clip-text text-transparent">
                  Natural healing,
                </span>
                <br />
                <span className="text-neutral-900 dark:text-white">
                  modern living.
                </span>
              </motion.h1>

              <motion.p
                variants={staggerItem}
                className="mt-6 text-lg sm:text-xl text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xl"
              >
                Premium homeopathy remedies and wellness essentials — curated for your holistic health journey.
              </motion.p>

              <motion.div
                variants={staggerItem}
                className="mt-8 flex flex-wrap gap-4"
              >
                <Link to="/shop">
                  <Button size="lg" className="gap-2">
                    Shop Now <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/shop">
                  <Button variant="outline" size="lg">
                    Explore Categories
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                variants={staggerItem}
                className="mt-10 flex items-center gap-6"
              >
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <img
                      key={i}
                      src={`https://i.pravatar.cc/80?img=${i + 10}`}
                      alt={`Customer ${i}`}
                      className="w-9 h-9 rounded-full border-2 border-white dark:border-neutral-900 object-cover"
                    />
                  ))}
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">10,000+ happy customers</p>
                  <p className="text-xs text-neutral-400">Trusted worldwide</p>
                </div>
              </motion.div>
            </motion.div>

            {/* RIGHT COLUMN - IMAGE */}
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              className="relative hidden lg:block"
            >
              <img 
                src={heroImage} 
                alt="Homeopathy Bottles" 
                className="w-full h-auto object-contain max-h-[600px] drop-shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ BRAND HERO GRID ═══════════ */}
      <BrandHeroGrid />

      {/* ═══════════ CATEGORIES ═══════════ */}
      {(categories.length > 0 || loading) && (
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              label="Browse"
              title="Shop by Category"
              action={{ label: 'View all', to: '/shop' }}
            />
            <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {loading
                ? [...Array(4)].map((_, i) => (
                    <div key={i} className="skeleton-shimmer rounded-2xl h-[200px] sm:h-[240px]" />
                  ))
                : categories.slice(0, 4).map((cat, i) => (
                    <CategoryCard key={cat.id || cat.name} category={cat} index={i} />
                  ))
              }
            </div>
          </div>
        </section>
      )}

      {/* ═══════════ FEATURED PRODUCTS ═══════════ */}
      <section className="py-16 sm:py-20 bg-neutral-50/50 dark:bg-neutral-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="Curated"
            title="Featured Products"
            action={{ label: 'Shop all', to: '/shop' }}
          />
          <div className="mt-8">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : featuredProducts.length > 0 ? (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, margin: '-100px' }}
              >
                {featuredProducts.map((product) => (
                  <motion.div key={product.id} variants={staggerItem}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <EmptyState text="Products coming soon" />
            )}
          </div>
        </div>
      </section>

      {/* ═══════════ TRENDING CAROUSEL ═══════════ */}
      {trendingProducts.length > 0 && (
        <section className="py-16 sm:py-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              label="Popular"
              title={<span className="flex items-center gap-2"><TrendingUp className="w-6 h-6 text-primary-500" /> Trending Now</span>}
            />
            <div className="mt-8 overflow-x-auto no-scrollbar pb-4">
              <motion.div
                className="flex gap-5"
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                {trendingProducts.map((product, i) => (
                  <motion.div
                    key={product.id}
                    variants={staggerItem}
                    className="flex-shrink-0 w-[260px] sm:w-[280px]"
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════ BRANDS ═══════════ */}
      {brands.length > 0 && (
        <section className="py-16 sm:py-20 bg-neutral-50/50 dark:bg-neutral-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader label="Trusted" title="Our Brands" />
            <motion.div
              className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {brands.slice(0, 6).map((brand, i) => {
                const name = typeof brand === 'string' ? brand : brand.name;
                const slug = typeof brand === 'string' ? encodeURIComponent(brand) : (brand.slug || encodeURIComponent(brand.name));
                const key = typeof brand === 'string' ? brand : (brand.id || brand.name || i);
                
                return (
                  <motion.div key={key} variants={staggerItem}>
                    <Link
                      to={`/brand/${slug}`}
                      className="flex items-center justify-center h-20 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 hover:shadow-card hover:border-primary-200 dark:hover:border-primary-800 transition-all"
                    >
                      <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        {name}
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>
      )}

      {/* ═══════════ BLOG PREVIEW ═══════════ */}
      {blogs.length > 0 && (
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              label="Read"
              title={<span className="flex items-center gap-2"><BookOpen className="w-6 h-6 text-primary-500" /> From Our Blog</span>}
              action={{ label: 'Read all', to: '/blog' }}
            />
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.slice(0, 3).map((blog) => (
                <Link
                  key={blog.id}
                  to={`/blog/${blog.slug || blog.id}`}
                  className="group rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 hover:shadow-card transition-shadow"
                >
                  {blog.cover_image_url && (
                    <div className="aspect-video overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                      <img
                        src={blog.cover_image_url}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <p className="text-xs text-primary-500 font-medium uppercase tracking-wider mb-2">
                      {blog.category || 'Wellness'}
                    </p>
                    <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-100 line-clamp-2 group-hover:text-primary-500 transition-colors">
                      {blog.title}
                    </h3>
                    <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
                      {blog.excerpt || blog.description}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-primary-500 font-medium">
                      Read more <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════ NEWSLETTER CTA ═══════════ */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 px-8 py-16 sm:px-16 sm:py-20 text-center">
            <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary-200/10 rounded-full blur-3xl" />

            <div className="relative z-10 max-w-xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-4">
                Stay in the loop
              </h2>
              <p className="text-base text-white/70 mb-8 leading-relaxed">
                Get exclusive deals, new product alerts, and wellness tips delivered to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 px-5 py-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                />
                <button className="px-6 py-3.5 rounded-xl bg-white text-primary-600 font-medium text-sm hover:bg-white/90 transition-colors flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" /> Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ── Helper Components ──

function SectionHeader({ label, title, action }) {
  return (
    <div className="flex items-end justify-between">
      <div>
        {label && (
          <p className="text-xs font-medium text-primary-500 uppercase tracking-widest mb-2">{label}</p>
        )}
        <h2 className="text-2xl sm:text-3xl font-heading font-semibold text-neutral-900 dark:text-neutral-50">
          {title}
        </h2>
      </div>
      {action && (
        <Link
          to={action.to}
          className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors"
        >
          {action.label} <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="text-center py-16">
      <p className="text-neutral-400 dark:text-neutral-500">{text}</p>
    </div>
  );
}
