import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import productService from '@/api/product.service';
import ProductGrid from '@/components/ecommerce/ProductGrid';
import { pageTransition } from '@/animations/variants';

export default function BrandPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = `${decodeURIComponent(slug)} — 1SkyStore`;
    loadProducts();
  }, [slug]);

  async function loadProducts() {
    try {
      setLoading(true);
      const res = await productService.getProducts({ brand: slug, pageSize: 20 });
      const data = res.data?.data || res.data;
      setProducts(data?.products || data?.rows || data || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div {...pageTransition}>
      <div className="bg-neutral-50/50 dark:bg-neutral-900/30 border-b border-neutral-100 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <p className="text-xs font-medium text-primary-500 uppercase tracking-widest mb-2">Brand</p>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-neutral-900 dark:text-white capitalize">
            {decodeURIComponent(slug).replace(/-/g, ' ')}
          </h1>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <ProductGrid products={products} loading={loading} />
      </div>
    </motion.div>
  );
}
