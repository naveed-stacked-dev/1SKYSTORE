import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ShoppingBag, ArrowRight, BookOpen } from 'lucide-react';
import productService from '@/api/product.service';
import blogService from '@/api/blog.service';
import { useAuth } from '@/context/AuthContext';
import ProductRow from '@/components/ecommerce/ProductRow';
import Button from '@/components/ui/Button';
import { staggerContainer, staggerItem } from '@/animations/variants';

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
      <section className="relative overflow-hidden bg-primary-900 border-b border-primary-800">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-800 to-neutral-950 opacity-90" />
        
        {/* Decorative background vectors */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="max-w-3xl"
          >
            <motion.h1 
              variants={staggerItem}
              className="text-4xl sm:text-5xl font-heading font-bold text-white mb-4"
            >
              Welcome back, {user?.first_name || 'there'}!
            </motion.h1>
            <motion.p 
              variants={staggerItem}
              className="text-lg text-primary-100/80 mb-8"
            >
              Ready to restock your wellness essentials? Explore the latest arrivals and your personalized recommendations.
            </motion.p>
            
            <motion.div variants={staggerItem} className="flex flex-wrap gap-4">
              <Link to="/orders">
                <Button size="lg" variant="ghost" className="bg-white text-primary-900 hover:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-primary-900 gap-2 shadow-sm">
                  <Package className="w-5 h-5" /> View Orders
                </Button>
              </Link>
              <Link to="/shop">
                <Button size="lg" variant="outline" className="text-white border-white/20 hover:bg-white/10 gap-2 backdrop-blur-sm">
                  <ShoppingBag className="w-5 h-5" /> Continue Shopping
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ BEST SELLERS ROW ═══════════ */}
      {(bestProducts.length > 0 || loadingBest) && (
        <section className="pt-10">
          <ProductRow 
            title="🔥 Best Sellers" 
            products={bestProducts} 
            isLoading={loadingBest} 
            viewAllLink="/shop?sort=best"
          />
        </section>
      )}

      {/* ═══════════ BRAND ROWS ═══════════ */}
      {!loadingBrands && Object.entries(brandProducts).map(([brand, products]) => (
        products.length > 0 && (
          <section key={brand} className="pt-4">
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
          <section key={category} className="pt-4 bg-neutral-50/50 dark:bg-neutral-900/30">
            <ProductRow 
              title={category} 
              products={products} 
              viewAllLink={`/category/${encodeURIComponent(category)}`}
            />
          </section>
        )
      ))}

      {/* ═══════════ BLOG GRID ═══════════ */}
      {blogs.length > 0 && (
        <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-neutral-100 dark:border-neutral-800 mt-10">
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-heading font-semibold text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary-500" /> Wellness Reading
            </h2>
            <Link to="/blog" className="text-sm font-medium text-primary-500 hover:text-primary-600 flex items-center gap-1 transition-colors hidden sm:flex">
              All Articles <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <Link
                key={blog.id}
                to={`/blog/${blog.slug || blog.id}`}
                className="group rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 hover:shadow-card transition-all"
              >
                {blog.cover_image_url && (
                  <div className="aspect-video overflow-hidden">
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
                  <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-100 line-clamp-2 leading-snug group-hover:text-primary-500 transition-colors">
                    {blog.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════ BOTTOM CTA ═══════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="relative rounded-3xl overflow-hidden bg-neutral-900 text-center py-16 px-6 sm:px-16 flex flex-col items-center">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/40 to-transparent" />
          <h2 className="relative z-10 text-3xl font-heading font-bold text-white mb-4">
            Need Expert Guidance?
          </h2>
          <p className="relative z-10 text-neutral-400 mb-8 max-w-lg mx-auto">
            Our wellness experts are available to help you find the right homeopathic regimen for your health goals.
          </p>
          <Button variant="primary" size="lg" className="relative z-10 rounded-full px-8">
            Contact Support
          </Button>
        </div>
      </section>
    </div>
  );
}
