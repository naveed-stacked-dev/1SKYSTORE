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

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-12 pr-12 py-3.5 rounded-2xl border border-neutral-200 bg-white text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-100 dark:placeholder:text-neutral-500"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {(results.length > 0 || loading) && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-2 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-elevated overflow-hidden"
          >
            {loading ? (
              <div className="p-4 text-center text-sm text-neutral-500">Searching...</div>
            ) : (
              results.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleSelect(product)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-left"
                >
                  {product.images?.[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100 truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-neutral-500">{product.category}</p>
                  </div>
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
