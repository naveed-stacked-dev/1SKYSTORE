import { useRef, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown, Search } from 'lucide-react';
import productService from '@/api/product.service';
import { fetchWithCache } from '@/utils/apiCache';
import ProductGrid from '@/components/ecommerce/ProductGrid';
import Pagination from '@/components/ui/Pagination';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/common/PageHeader';
import { CONTAINER } from '@/components/home/ui/styles';
import { pageTransition, EASE_OUT } from '@/animations/variants';
import { cn } from '@/utils/cn';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const MotionDiv = motion.div;

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

  // Header copy only: show the category's display name when one is active
  const categoryLabel = categoryOptions.find((o) => o.value === category)?.label || category;

  return (
    <MotionDiv {...pageTransition} className="min-h-screen">
      {search ? (
        <PageHeader
          eyebrow="Search"
          title="Results for"
          accent={`“${search}”`}
          intro="Showing all products matching your search"
          className="[&_h1]:[overflow-wrap:anywhere]"
        />
      ) : (
        <PageHeader
          eyebrow={category ? 'Shop · Category' : 'Shop'}
          title={category ? categoryLabel : 'Shop all'}
          accent={category ? undefined : 'remedies'}
          intro="Explore our premium product range"
          className={cn('[&_h1]:[overflow-wrap:anywhere]', category && '[&_h1]:capitalize')}
        />
      )}

      <div className={cn(CONTAINER, 'pb-24 sm:pb-32')}>
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-y border-line py-4">
          <div className="flex min-h-11 items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              aria-expanded={showFilters}
              aria-controls="shop-filters"
              className="lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" /> Filters
              {activeFilters.length > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] tabular-nums text-white">
                  {activeFilters.length}
                </span>
              )}
            </Button>
            {!loading && totalPages > 1 && (
              <p className="hidden text-[13px] tabular-nums text-ink-faint lg:block">
                Page {page} of {totalPages}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <label
              htmlFor="shop-sort"
              className="hidden text-[11px] font-medium uppercase tracking-[0.22em] text-ink-faint sm:block"
            >
              Sort
            </label>
            <div className="w-[10.5rem] sm:w-56">
              <Select
                id="shop-sort"
                options={sortOptions}
                value={sort}
                onChange={(e) => updateFilter('sort_by', e.target.value)}
                placeholder="Sort by..."
              />
            </div>
          </div>
        </div>

        {/* Active filter pills */}
        {(activeFilters.length > 0 || hasFilters) && (
          <div className="flex flex-wrap items-center gap-2 pt-5">
            {activeFilters.map((filter, idx) => (
              <button
                key={idx}
                type="button"
                onClick={filter.remove}
                aria-label={`Remove filter: ${filter.label}`}
                className="group inline-flex min-h-11 max-w-full items-center gap-2 rounded-full bg-surface py-1.5 pl-4 pr-1.5 text-[13px] font-medium text-ink ring-1 ring-inset ring-line transition-colors duration-300 hover:bg-ink hover:text-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <span className="truncate">{filter.label}</span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mist text-ink-soft transition-colors duration-300 group-hover:bg-canvas/15 group-hover:text-canvas">
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </button>
            ))}
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex min-h-11 items-center rounded-full px-3 text-[13px] font-medium text-ink-soft underline decoration-line underline-offset-4 transition-colors hover:text-ink hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Clear all
              </button>
            )}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-8 sm:mt-10 lg:flex-row lg:items-start lg:gap-12">
          {/* Sidebar */}
          <aside
            id="shop-filters"
            aria-label="Filters"
            className={cn(showFilters ? 'block' : 'hidden', 'w-full shrink-0 lg:block lg:w-72')}
          >
            <div className="overflow-hidden rounded-[1.75rem] bg-surface ring-1 ring-line">
              <p className="px-5 pt-5 text-[11px] font-medium uppercase tracking-[0.22em] text-ink-faint sm:px-6">
                Refine
              </p>
              <div className="divide-y divide-line">
                <Accordion title="Category" defaultOpen>
                  <FilterSearchList
                    options={categoryOptions}
                    type="radio"
                    selected={category}
                    onChange={(v) => updateFilter('category', v)}
                  />
                </Accordion>

                <Accordion title="Price" defaultOpen>
                  <PriceFilter
                    minPrice={minPrice} maxPrice={maxPrice}
                    onChange={(min, max) => {
                      updateFilter('min_price', min);
                      updateFilter('max_price', max);
                    }}
                  />
                </Accordion>

                <Accordion title="Brand">
                  <FilterSearchList
                    options={brandOptions}
                    type="checkbox"
                    selected={brand}
                    onChange={(v) => toggleArrayFilter('brand', brand, v)}
                  />
                </Accordion>

                <Accordion title="Symptom">
                  <FilterSearchList
                    options={symptomOptions}
                    type="checkbox"
                    selected={symptom}
                    onChange={(v) => toggleArrayFilter('symptom', symptom, v)}
                  />
                </Accordion>
              </div>

              <div className="border-t border-line p-5 lg:hidden">
                <Button size="lg" className="w-full" onClick={() => setShowFilters(false)}>
                  Apply
                </Button>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="w-full min-w-0 flex-1">
            <ProductGrid products={products} loading={loading} />
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={(p) => updateFilter('page', String(p))}
            />
          </div>
        </div>
      </div>
    </MotionDiv>
  );
}

function Accordion({ title, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="px-5 sm:px-6">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="group flex min-h-14 w-full items-center justify-between gap-4 rounded-sm py-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <span className="font-display text-[15px] font-medium tracking-[-0.01em] text-ink">{title}</span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-soft ring-1 ring-inset ring-line transition-colors duration-300 group-hover:bg-ink group-hover:text-canvas">
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
              isOpen && 'rotate-180'
            )}
            aria-hidden="true"
          />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <MotionDiv
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE_OUT }}
            className="overflow-hidden"
          >
            <div className="pb-5 pt-1">{children}</div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
}

/** One radio / checkbox row with a custom hairline control */
function ChoiceRow({ type, checked, onChange, label }) {
  const radio = type === 'radio';
  return (
    <label className="group flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-2 transition-colors duration-200 hover:bg-mist">
      <span className="relative flex h-[18px] w-[18px] shrink-0 items-center justify-center">
        <input
          type={type}
          checked={checked}
          onChange={onChange}
          className={cn(
            'peer absolute inset-0 m-0 cursor-pointer appearance-none border border-ink/25 bg-surface transition-colors duration-200 checked:border-ink',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
            radio ? 'rounded-full' : 'rounded-[5px] checked:bg-ink'
          )}
        />
        {radio ? (
          <span className="pointer-events-none relative h-2 w-2 rounded-full bg-ink opacity-0 transition-opacity duration-200 peer-checked:opacity-100" />
        ) : (
          <svg className="pointer-events-none relative h-3 w-3 text-canvas opacity-0 transition-opacity duration-200 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        )}
      </span>
      <span
        className={cn(
          'select-none text-sm leading-snug transition-colors duration-200',
          checked ? 'font-medium text-ink' : 'text-ink-soft group-hover:text-ink'
        )}
      >
        {label}
      </span>
    </label>
  );
}

function FilterSearchList({ options, type, selected, onChange }) {
  const [q, setQ] = useState('');
  const filtered = options.filter(o => o.label.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
        <input
          type="text"
          placeholder="Search..."
          aria-label="Search options"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="h-11 w-full rounded-full border border-line bg-canvas pl-10 pr-4 text-base text-ink transition-[border-color,box-shadow] duration-200 placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15 sm:text-sm"
        />
      </div>
      <div className="-mx-2 max-h-64 overflow-y-auto overscroll-contain">
        {type === 'radio' && (
          <ChoiceRow
            type="radio"
            checked={selected === ''}
            onChange={() => onChange('')}
            label="All Categories"
          />
        )}

        {filtered.map(opt => {
          const isChecked = type === 'radio' ? selected === opt.value : selected.includes(opt.value);
          return (
            <ChoiceRow
              key={opt.value}
              type={type}
              checked={isChecked}
              onChange={() => onChange(opt.value)}
              label={opt.label}
            />
          );
        })}
        {filtered.length === 0 && <p className="px-2 py-3 text-[13px] text-ink-faint">No results found</p>}
      </div>
    </div>
  );
}

// rc-slider takes inline styles; CSS variables keep it in step with the theme
const SLIDER_HANDLE = {
  borderColor: 'var(--c-ink)',
  borderWidth: 1.5,
  height: 20,
  width: 20,
  marginTop: -8,
  backgroundColor: 'var(--c-surface)',
  opacity: 1,
  boxShadow: '0 2px 8px -2px rgba(14, 23, 38, 0.3)',
};

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
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-2">
        {predefined.map((p, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleChip(p.min, p.max)}
            aria-pressed={rangeActive(p.min, p.max)}
            className={cn(
              'min-h-11 rounded-full px-4 text-[11px] font-medium tracking-[0.12em] ring-1 ring-inset transition-colors duration-300',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
              rangeActive(p.min, p.max)
                ? 'bg-ink text-canvas ring-ink'
                : 'text-ink-soft ring-line hover:text-ink hover:ring-ink/40'
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Functional Slider using rc-slider */}
      <div className="px-2.5 py-3">
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
          trackStyle={[{ backgroundColor: 'var(--c-accent)', height: 4 }]}
          railStyle={{ backgroundColor: 'var(--c-line)', height: 4 }}
          handleStyle={[SLIDER_HANDLE, SLIDER_HANDLE]}
        />
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-ink-faint">$</span>
          <input
            type="number"
            placeholder="0"
            aria-label="Minimum price"
            value={minPrice}
            onChange={(e) => onChange(e.target.value, maxPrice)}
            className="h-11 w-full min-w-0 rounded-2xl border border-line bg-canvas pl-7 pr-3 text-base tabular-nums text-ink transition-[border-color,box-shadow] duration-200 placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15 sm:text-sm"
          />
        </div>
        <span className="text-ink-faint" aria-hidden="true">–</span>
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-ink-faint">$</span>
          <input
            type="number"
            placeholder="Max"
            aria-label="Maximum price"
            value={maxPrice}
            onChange={(e) => onChange(minPrice, e.target.value)}
            className="h-11 w-full min-w-0 rounded-2xl border border-line bg-canvas pl-7 pr-3 text-base tabular-nums text-ink transition-[border-color,box-shadow] duration-200 placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15 sm:text-sm"
          />
        </div>
      </div>
      <p className="text-[12px] tabular-nums text-ink-faint">
        Range: {minPrice || '0'} — {maxPrice || 'Max'} (Max 1000)
      </p>
    </div>
  );
}
