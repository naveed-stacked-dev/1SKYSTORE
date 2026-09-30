import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ShoppingBag, ArrowUpRight, BookOpen, User } from 'lucide-react';
import productService from '@/api/product.service';
import blogService from '@/api/blog.service';
import { useAuth } from '@/context/AuthContext';
import ProductRow from '@/components/ecommerce/ProductRow';
import SymptomSection from '@/components/ecommerce/SymptomSection';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/common/PageHeader';
import Eyebrow from '@/components/home/ui/Eyebrow';
import Accent from '@/components/home/ui/Accent';
import { TextLink } from '@/components/home/ui/PillLink';
import { CONTAINER } from '@/components/home/ui/styles';
import { revealGroup, revealUp } from '@/animations/variants';
import { cn } from '@/utils/cn';

const MotionDiv = motion.div;

const QUICK_LINKS = [
  { to: '/orders', label: 'View Orders', icon: Package, tint: 'bg-tint-2' },
  { to: '/profile', label: 'My Profile', icon: User, tint: 'bg-tint-1' },
  { to: '/shop', label: 'Continue Shopping', icon: ShoppingBag, tint: 'bg-tint-3' },
];

export default function Dashboard() {
  const { user } = useAuth();
  
  const [bestProducts, setBestProducts] = useState([]);
  const [brandProducts, setBrandProducts] = useState({});
  const [categoryProducts, setCategoryProducts] = useState({});
  const [blogs, setBlogs] = useState([]);
  
  const [loadingBest, setLoadingBest] = useState(true);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingBlogs, setLoadingBlogs] = useState(true);

  useEffect(() => {
    document.title = 'Dashboard — 1SkyStore';
    
    productService.getBestProducts({ limit: 10 })
      .then((res) => setBestProducts(res.data?.data || res.data))
      .catch(console.error)
      .finally(() => setLoadingBest(false));

    productService.getProductsByBrand({ brandLimit: 3, productLimit: 10 })
      .then((res) => setBrandProducts(res.data?.data || res.data))
      .catch(console.error)
      .finally(() => setLoadingBrands(false));

    productService.getProductsByCategory({ categoryLimit: 3, productLimit: 10 })
      .then((res) => setCategoryProducts(res.data?.data || res.data))
      .catch(console.error)
      .finally(() => setLoadingCategories(false));

    blogService.getBlogs({ limit: 3 })
      .then((res) => {
        const d = res.data?.data || res.data;
        setBlogs(Array.isArray(d) ? d : d?.blogs || d?.rows || []);
      })
      .catch(console.error)
      .finally(() => setLoadingBlogs(false));
  }, []);

  return (
    <div className="min-h-screen pb-20">
      {/* ═══════════ PERSONALIZED HERO ═══════════ */}
      <PageHeader
        eyebrow="Your dashboard"
        title="Welcome back,"
        accent={user?.first_name || 'there'}
        intro="Ready to restock your wellness essentials? Explore the latest arrivals and your personalized recommendations."
      />

      {/* Quick links */}
      <div className={CONTAINER}>
        <MotionDiv
          variants={revealGroup(0.08, 0.2)}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          {QUICK_LINKS.map((tile) => (
            <MotionDiv key={tile.to} variants={revealUp}>
              <QuickLink {...tile} />
            </MotionDiv>
          ))}
        </MotionDiv>
      </div>

      {/* ═══════════ BEST SELLERS ROW ═══════════ */}
      {(bestProducts.length > 0 || loadingBest) && (
        <section className="pt-10 sm:pt-16">
          <ProductRow
            title="Best Sellers"
            products={bestProducts}
            isLoading={loadingBest}
            viewAllLink="/shop?sort=best"
          />
        </section>
      )}

      {/* ═══════════ BRAND ROWS ═══════════ */}
      {!loadingBrands && Object.entries(brandProducts).map(([brand, products]) => (
        products.length > 0 && (
          <section key={brand}>
            <ProductRow
              title={brand}
              products={products}
              viewAllLink={`/brand/${encodeURIComponent(brand)}`}
            />
          </section>
        )
      ))}

      {/* ═══════════ CATEGORY ROWS ═══════════ */}
      {!loadingCategories && Object.entries(categoryProducts).map(([category, products]) => (
        products.length > 0 && (
          <section key={category}>
            <ProductRow
              title={category}
              products={products}
              viewAllLink={`/category/${encodeURIComponent(category)}`}
            />
          </section>
        )
      ))}

      {/* ═══════════ SYMPTOMS ═══════════ */}
      <SymptomSection bgClass="mt-10 bg-mist" />

      {/* ═══════════ BLOG GRID ═══════════ */}
      {blogs.length > 0 && (
        <section className={cn(CONTAINER, 'py-16 sm:py-24')}>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
            <div>
              <Eyebrow>Journal</Eyebrow>
              <h2 className="font-display mt-4 text-[clamp(1.75rem,3.4vw,2.75rem)] font-medium leading-[1.05] tracking-[-0.03em] text-ink">
                Wellness <Accent>Reading</Accent>
              </h2>
            </div>
            <TextLink to="/blog">All Articles</TextLink>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
            {blogs.map((blog) => (
              <Link
                key={blog.id}
                to={`/blog/${blog.slug || blog.id}`}
                className="group block rounded-[1.75rem] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                <div className="aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-mist">
                  {blog.cover_image_url ? (
                    <img
                      src={blog.cover_image_url}
                      alt={blog.title}
                      className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-ink-faint" aria-hidden="true">
                      <BookOpen className="h-8 w-8" strokeWidth={1.25} />
                    </div>
                  )}
                </div>
                <div className="pt-5">
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-ink-faint">
                    {blog.category || 'Wellness'}
                  </p>
                  <h3 className="font-display mt-2 line-clamp-2 text-xl font-medium leading-snug tracking-[-0.02em] text-ink transition-colors duration-300 group-hover:text-accent">
                    {blog.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════ BOTTOM CTA ═══════════ */}
      <section className={cn(CONTAINER, 'mt-10')}>
        <div className="flex flex-col items-start gap-8 rounded-[2rem] bg-tint-4 px-6 py-12 sm:px-12 sm:py-16 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <h2 className="font-display text-[clamp(1.75rem,3.6vw,3rem)] font-medium leading-[1.05] tracking-[-0.03em] text-ink">
              Need Expert <Accent>Guidance?</Accent>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-soft sm:text-lg">
              Our wellness experts are available to help you find the right homeopathic regimen for your health goals.
            </p>
          </div>
          <Button variant="primary" size="lg" className="shrink-0">
            Contact Support
          </Button>
        </div>
      </section>
    </div>
  );
}

function QuickLink({ to, label, text, icon, tint }) {
  const Icon = icon;
  return (
    <Link
      to={to}
      className={cn(
        'group flex h-full min-h-40 flex-col justify-between gap-8 rounded-[1.75rem] p-6 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1',
        'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent',
        tint
      )}
    >
      <div className="flex items-start justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-ink" aria-hidden="true">
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </span>
        <span
          className="flex h-11 w-11 items-center justify-center rounded-full text-ink ring-1 ring-inset ring-ink/15 transition-colors duration-500 group-hover:bg-ink group-hover:text-canvas"
          aria-hidden="true"
        >
          <ArrowUpRight className="h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
      <div>
        <p className="font-display text-xl font-medium tracking-[-0.02em] text-ink">{label}</p>
        {text && <p className="mt-1 text-sm text-ink-soft">{text}</p>}
      </div>
    </Link>
  );
}
