import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import productService from '@/api/product.service';

export default function SearchBar({ onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      searchProducts();
    } else {
      setResults([]);
    }
  }, [debouncedQuery]);

  async function searchProducts() {
    try {
      setLoading(true);
      const res = await productService.getProducts({ search: debouncedQuery, pageSize: 5 });
      const data = res.data?.data || res.data;
      setResults(data?.products || data?.rows || data || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(product) {
    const slug = product.slug || product.id;
    navigate(`/product/${slug}`);
    onClose?.();
  }

  function handleSearch() {
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/shop?search=${encodeURIComponent(trimmed)}`);
    onClose?.();
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-faint pointer-events-none" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search remedies by name…"
            aria-label="Search products"
            className="w-full min-h-12 pl-12 pr-10 py-3 rounded-full bg-mist text-[15px] text-ink placeholder:text-ink-faint ring-1 ring-inset ring-transparent transition-shadow focus:outline-none focus:ring-accent/50"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full text-ink-faint hover:text-ink hover:bg-ink/6"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={handleSearch}
          className="flex min-h-12 items-center gap-2 px-5 bg-ink hover:bg-accent text-canvas text-sm font-medium rounded-full transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <Search className="w-4 h-4 sm:hidden" aria-hidden="true" />
          <span className="max-sm:sr-only">Search</span>
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-12 w-12 items-center justify-center rounded-full text-ink ring-1 ring-inset ring-line hover:bg-ink/6 transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {(results.length > 0 || loading) && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-3 bg-surface rounded-2xl ring-1 ring-line overflow-hidden"
          >
            {loading ? (
              <div className="p-4 text-center text-sm text-ink-faint" role="status">Searching…</div>
            ) : (
              <>
                {results.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleSelect(product)}
                    type="button"
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-mist focus-visible:bg-mist focus-visible:outline-none transition-colors text-left"
                  >
                    {(() => {
                      const imageUrl = product.images?.[0]?.image_url || product.images?.[0] || product.image;
                      return imageUrl ? (
                        <span className="w-11 h-11 rounded-xl bg-plate flex-shrink-0 overflow-hidden">
                          <img
                            src={imageUrl}
                            alt=""
                            className="w-full h-full object-contain p-1 mix-blend-multiply"
                          />
                        </span>
                      ) : (
                        <span className="w-11 h-11 rounded-xl bg-plate flex-shrink-0" />
                      );
                    })()}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-ink-faint">{product.category}</p>
                    </div>
                  </button>
                ))}
                {results.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="w-full px-4 py-3 text-sm font-medium text-ink hover:bg-mist transition-colors text-center border-t border-line"
                  >
                    See all results for "{query}"
                  </button>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
