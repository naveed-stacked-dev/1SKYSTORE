import { useRef, useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';
import productService from '@/api/product.service';
import { fetchWithCache } from '@/utils/apiCache';
import ProductGrid from '@/components/ecommerce/ProductGrid';
import Pagination from '@/components/ui/Pagination';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { pageTransition } from '@/animations/variants';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const filtersFetched = useRef(false);

  const page = parseInt(searchParams.get('page') || '1');
  const category = searchParams.get('category') || '';
  const brand = searchParams.get('brand') ? searchParams.get('brand').split(',') : [];
  const symptom = searchParams.get('symptom') ? searchParams.get('symptom').split(',') : [];
  const sort = searchParams.get('sort_by') || '';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';
  const search = searchParams.get('search') || '';

  useEffect(() => {
    document.title = search ? `"${search}" — Shop | 1SkyStore` : 'Shop — 1SkyStore';
    if (filtersFetched.current) return;
    filtersFetched.current = true;
    loadFilters();
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();
    loadProducts(controller);
    return () => controller.abort();
  }, [page, category, searchParams.get('brand'), searchParams.get('symptom'), sort, minPrice, maxPrice, search]);

  async function loadFilters() {
    try {
      const [catRes, brandRes, symRes] = await Promise.allSettled([
        fetchWithCache('categories', () => productService.getCategories()),
        fetchWithCache('brands', () => productService.getBrands()),
        fetchWithCache('symptoms', () => productService.getSymptoms()),
      ]);
      if (catRes.status === 'fulfilled') {
        const d = catRes.value.data?.data || catRes.value.data;
        setCategories(Array.isArray(d) ? d : d?.categories || []);
      }
      if (brandRes.status === 'fulfilled') {
        const d = brandRes.value.data?.data || brandRes.value.data;
        setBrands(Array.isArray(d) ? d : d?.brands || []);
      }
      if (symRes.status === 'fulfilled') {
        const d = symRes.value.data?.data || symRes.value.data;
        setSymptoms(Array.isArray(d) ? d : d?.symptoms || []);
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
      if (brand.length > 0) params.brand = brand.join(',');
      if (symptom.length > 0) params.symptom = symptom.join(',');
      if (sort) params.sort_by = sort;
      if (minPrice) params.min_price = minPrice;
      if (maxPrice) params.max_price = maxPrice;
      if (search) params.search = search;

      const res = await productService.getProducts(params, { signal: controller.signal });
      const data = res.data?.data || res.data;
      setProducts(data?.products || data?.rows || data || []);
      setTotalPages(res.data?.pagination?.totalPages || data?.totalPages || Math.ceil((data?.count || 0) / 12) || 1);
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
    if (key !== 'page') newParams.set('page', '1');
    setSearchParams(newParams);
  }

  function toggleArrayFilter(key, currentArray, value) {
    const newArray = currentArray.includes(value)
      ? currentArray.filter(i => i !== value)
      : [...currentArray, value];

    updateFilter(key, newArray.join(','));
  }

  function clearFilters() {
    setSearchParams({});
  }

  const activeFilters = [];
  if (search) {
    activeFilters.push({ label: `Search: "${search}"`, remove: () => updateFilter('search', '') });
  }
  if (category) {
    activeFilters.push({ label: category, remove: () => updateFilter('category', '') });
  }
  brand.forEach(b => {
    activeFilters.push({ label: b, remove: () => toggleArrayFilter('brand', brand, b) });
  });
  symptom.forEach(s => {
    activeFilters.push({ label: s, remove: () => toggleArrayFilter('symptom', symptom, s) });
  });
  if (minPrice || maxPrice) {
    activeFilters.push({
      label: `$${minPrice || '0'} — $${maxPrice || 'Max'}`,
      remove: () => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('min_price');
        newParams.delete('max_price');
        newParams.set('page', '1');
        setSearchParams(newParams);
      }
    });
  }

  const hasFilters = Array.from(searchParams.keys()).some(k => k !== 'page' && k !== 'sort_by');

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'name', label: 'Name: A-Z' },
  ];

  const categoryOptions = categories.map((c) => (typeof c === 'string' ? { value: c, label: c } : { value: c.slug || c.name, label: c.name }));
  const brandOptions = brands.map((b) => (typeof b === 'string' ? { value: b, label: b } : { value: b.slug || b.name, label: b.name }));
  const symptomOptions = symptoms.map((s) => (typeof s === 'string' ? { value: s, label: s } : { value: s.slug || s.name, label: s.name }));

  return (
    <motion.div {...pageTransition} className="min-h-screen">
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-neutral-950 dark:via-neutral-950 dark:to-primary-900/30 border-b border-neutral-100 dark:border-neutral-800">
        <div className="bg-grid-pattern absolute inset-0 pointer-events-none" />
        <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-secondary-200/40 blur-3xl pointer-events-none dark:bg-secondary-800/15" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {search ? (
            <>
              <h1 className="text-3xl sm:text-4xl font-heading font-bold text-neutral-900 dark:text-white">
                Results for <span className="text-primary-500">"{search}"</span>
              </h1>
              <p className="mt-2 text-neutral-500 dark:text-neutral-400">Showing all products matching your search</p>
            </>
          ) : (
            <>
              <h1 className="text-3xl sm:text-4xl font-heading font-bold text-neutral-900 dark:text-white">Shop</h1>
              <p className="mt-2 text-neutral-500 dark:text-neutral-400">Explore our premium product range</p>
            </>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
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
                  className="flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-error-500 transition-colors bg-white px-3 py-1.5 rounded-full border shadow-sm"
                >
                  Clear all <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Select
                options={sortOptions}
                value={sort}
                onChange={(e) => updateFilter('sort_by', e.target.value)}
                placeholder="Sort by..."
                className="w-44"
              />
            </div>
          </div>

          {/* Active Filter Pills */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {activeFilters.map((filter, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800/50 text-xs font-semibold text-primary-700 dark:text-primary-300 rounded-full shadow-sm">
                  {filter.label}
                  <button onClick={filter.remove} className="focus:outline-none hover:text-primary-900 dark:hover:text-primary-100 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-8 relative items-start">
          {/* Sidebar */}
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-72 flex-shrink-0 mb-8 lg:mb-0 space-y-4`}>
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm">
              <Accordion title="Category" defaultOpen>
                <FilterSearchList
                  options={categoryOptions}
                  type="radio"
                  selected={category}
                  onChange={(v) => updateFilter('category', v)}
                />
              </Accordion>

              <div className="w-full h-px bg-neutral-100 dark:bg-neutral-800" />

              <Accordion title="Price" defaultOpen>
                <PriceFilter
                  minPrice={minPrice} maxPrice={maxPrice}
                  onChange={(min, max) => {
                    updateFilter('min_price', min);
                    updateFilter('max_price', max);
                  }}
                />
              </Accordion>

              <div className="w-full h-px bg-neutral-100 dark:bg-neutral-800" />

              <Accordion title="Brand">
                <FilterSearchList
                  options={brandOptions}
                  type="checkbox"
                  selected={brand}
                  onChange={(v) => toggleArrayFilter('brand', brand, v)}
                />
              </Accordion>

              <div className="w-full h-px bg-neutral-100 dark:bg-neutral-800" />

              <Accordion title="Symptom">
                <FilterSearchList
                  options={symptomOptions}
                  type="checkbox"
                  selected={symptom}
                  onChange={(v) => toggleArrayFilter('symptom', symptom, v)}
                />
              </Accordion>

              <div className="p-5 border-t border-neutral-100 dark:border-neutral-800 lg:hidden">
                <Button className="w-full" onClick={() => setShowFilters(false)}>
                  Apply
                </Button>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1 w-full min-w-0">
            <ProductGrid products={products} loading={loading} />
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={(p) => updateFilter('page', String(p))}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Accordion({ title, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="p-5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left font-bold text-neutral-900 dark:text-neutral-100"
      >
        <span className="text-[15px]">{title}</span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterSearchList({ options, type, selected, onChange }) {
  const [q, setQ] = useState('');
  const filtered = options.filter(o => o.label.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-3 pb-1 px-[2px] pt-[2px]">
      <div className="relative">
        <input
          type="text"
          placeholder="Search..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full pl-3 pr-8 py-2 bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800 rounded-lg text-sm text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-primary-500 placeholder:text-neutral-400"
        />
      </div>
      <div className="max-h-56 overflow-y-auto space-y-2.5 pr-2">
        {type === 'radio' && (
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input
                type="radio"
                checked={selected === ''}
                onChange={() => onChange('')}
                className="peer appearance-none w-4 h-4 border border-neutral-300 dark:border-neutral-700 rounded-full checked:border-primary-500 checked:bg-white transition-all cursor-pointer"
              />
              <div className="absolute w-2 h-2 rounded-full bg-primary-500 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
            </div>
            <span className={`text-sm select-none transition-colors ${selected === '' ? 'text-neutral-900 font-medium dark:text-white' : 'text-neutral-600 group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-neutral-200'}`}>
              All Categories
            </span>
          </label>
        )}

        {filtered.map(opt => {
          const isChecked = type === 'radio' ? selected === opt.value : selected.includes(opt.value);
          return (
            <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input
                  type={type}
                  checked={isChecked}
                  onChange={() => onChange(opt.value)}
                  className={`peer appearance-none w-4 h-4 border ${type === 'radio' ? 'rounded-full' : 'rounded-sm'} border-neutral-300 dark:border-neutral-700 checked:!border-primary-500 checked:!bg-primary-500 transition-all cursor-pointer bg-white dark:bg-neutral-900`}
                />
                {type === 'radio' ? (
                  <div className="absolute w-2 h-2 rounded-full bg-primary-500 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                ) : (
                  <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                )}
              </div>
              <span className={`text-[14px] select-none transition-colors ${isChecked ? 'text-neutral-900 font-medium dark:text-white' : 'text-neutral-600 group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-neutral-200'}`}>
                {opt.label}
              </span>
            </label>
          );
        })}
        {filtered.length === 0 && <p className="text-xs text-neutral-400 italic py-2">No results found</p>}
      </div>
    </div>
  );
}

function PriceFilter({ minPrice, maxPrice, onChange }) {
  const [sliderRange, setSliderRange] = useState([
    minPrice ? Number(minPrice) : 0,
    maxPrice ? Number(maxPrice) : 1000
  ]);

  useEffect(() => {
    setSliderRange([
      minPrice ? Number(minPrice) : 0,
      maxPrice ? Number(maxPrice) : 1000
    ]);
  }, [minPrice, maxPrice]);

  const predefined = [
    { label: 'UNDER 50', min: '', max: '50' },
    { label: '50-200', min: '50', max: '200' },
    { label: '200-500', min: '200', max: '500' },
    { label: '500+', min: '500', max: '' },
  ];

  const handleChip = (min, max) => {
    if (minPrice === min && maxPrice === max) onChange('', '');
    else onChange(min, max);
  };

  const rangeActive = (min, max) => minPrice === min && maxPrice === max;

  return (
    <div className="space-y-6 flex flex-col">
      <div className="flex flex-wrap gap-2">
        {predefined.map((p, i) => (
          <button
            key={i}
            onClick={() => handleChip(p.min, p.max)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide transition-all border ${rangeActive(p.min, p.max)
                ? 'bg-primary-500 text-white border-primary-500'
                : 'bg-white text-neutral-600 border-neutral-200 hover:border-primary-300 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-300'
              }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Functional Slider using rc-slider */}
      <div className="px-2 pt-2 pb-6">
        <Slider
          range
          min={0}
          max={1000}
          value={sliderRange}
          onChange={(val) => setSliderRange(val)}
          onAfterChange={(val) => {
            const newMin = val[0] === 0 ? '' : String(val[0]);
            const newMax = val[1] === 1000 ? '' : String(val[1]);
            onChange(newMin, newMax);
          }}
          trackStyle={[{ backgroundColor: '#0A3576', height: 4 }]}
          railStyle={{ backgroundColor: '#E5E0D0', height: 4 }}
          handleStyle={[
            { borderColor: '#0A3576', height: 16, width: 16, marginTop: -6, backgroundColor: 'white', opacity: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
            { borderColor: '#0A3576', height: 16, width: 16, marginTop: -6, backgroundColor: 'white', opacity: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
          ]}
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 group">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm font-semibold transition-colors group-focus-within:text-primary-500">$</span>
          <input
            type="number"
            placeholder="0"
            value={minPrice}
            onChange={(e) => onChange(e.target.value, maxPrice)}
            className="w-full pl-7 pr-3 py-2 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>
        <div className="relative flex-1 group">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm font-semibold transition-colors group-focus-within:text-primary-500">$</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => onChange(minPrice, e.target.value)}
            className="w-full pl-7 pr-3 py-2 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>
      </div>
      <div className="text-[11px] font-medium text-neutral-500">
        Range: {minPrice || '0'} — {maxPrice || 'Max'}(Max 1000)
      </div>
    </div>
  );
}
