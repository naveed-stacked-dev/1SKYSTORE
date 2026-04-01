import { useRef, useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import productService from '@/api/product.service';
import { fetchWithCache } from '@/utils/apiCache';
import ProductGrid from '@/components/ecommerce/ProductGrid';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { pageTransition } from '@/animations/variants';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const filtersFetched = useRef(false);

  const page = parseInt(searchParams.get('page') || '1');
  const category = searchParams.get('category') || '';
  const brand = searchParams.get('brand') || '';
  const sort = searchParams.get('sort') || '';

  useEffect(() => {
    document.title = 'Shop — 1SkyStore';
    if (filtersFetched.current) return;
    filtersFetched.current = true;
    loadFilters();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadProducts(controller);
    return () => controller.abort();
  }, [page, category, brand, sort]);

  async function loadFilters() {
    try {
      const [catRes, brandRes] = await Promise.allSettled([
        fetchWithCache('categories', () => productService.getCategories()),
        fetchWithCache('brands', () => productService.getBrands()),
      ]);
      if (catRes.status === 'fulfilled') {
        const d = catRes.value.data?.data || catRes.value.data;
        setCategories(Array.isArray(d) ? d : d?.categories || []);
      }
      if (brandRes.status === 'fulfilled') {
        const d = brandRes.value.data?.data || brandRes.value.data;
        setBrands(Array.isArray(d) ? d : d?.brands || []);
      }
    } catch (err) {
      console.error('Failed to load filters', err);
    }
  }

  async function loadProducts(controller) {
    try {
      setLoading(true);
      const params = { page, pageSize: 12 };
      if (category) params.category = category;
      if (brand) params.brand = brand;
      if (sort) params.sort = sort;

      const res = await productService.getProducts(params, { signal: controller.signal });
      const data = res.data?.data || res.data;
      setProducts(data?.products || data?.rows || data || []);
      setTotalPages(data?.totalPages || Math.ceil((data?.count || 0) / 12) || 1);
    } catch (err) {
      if (err.name !== 'CanceledError') {
        setProducts([]);
      }
    } finally {
      setLoading(false);
    }
  }

  function updateFilter(key, value) {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  }

  function clearFilters() {
    setSearchParams({});
  }

  const hasFilters = category || brand || sort;

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'name_asc', label: 'Name: A-Z' },
  ];

  const categoryOptions = categories.map((c) => ({ value: c.slug || c.name, label: c.name }));
  const brandOptions = brands.map((b) => ({ value: b.slug || b.name, label: b.name }));

  return (
    <motion.div {...pageTransition} className="min-h-screen">
      {/* Header */}
      <div className="bg-neutral-50/50 dark:bg-neutral-900/30 border-b border-neutral-100 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-neutral-900 dark:text-white">Shop</h1>
          <p className="mt-2 text-neutral-500 dark:text-neutral-400">Explore our premium product range</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </Button>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-neutral-500 hover:text-error-500 transition-colors"
              >
                Clear all <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Select
              options={sortOptions}
              value={sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              placeholder="Sort by..."
              className="w-44"
            />
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters (desktop) */}
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-60 flex-shrink-0 space-y-6`}>
            <FilterSection
              title="Category"
              options={categoryOptions}
              value={category}
              onChange={(v) => updateFilter('category', v)}
            />
            <FilterSection
              title="Brand"
              options={brandOptions}
              value={brand}
              onChange={(v) => updateFilter('brand', v)}
            />
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <ProductGrid products={products} loading={loading} />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => updateFilter('page', String(i + 1)) || searchParams.set('page', String(i + 1))}
                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                      page === i + 1
                        ? 'bg-primary-500 text-white'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function FilterSection({ title, options, value, onChange }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">{title}</h4>
      <div className="space-y-1">
        <button
          onClick={() => onChange('')}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
            !value
              ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 font-medium'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
          }`}
        >
          All {title}
        </button>
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value === value ? '' : opt.value)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              value === opt.value
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 font-medium'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
