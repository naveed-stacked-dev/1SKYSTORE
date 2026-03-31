import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import ProductCard from '@/components/ecommerce/ProductCard';
import { staggerContainer, staggerItem } from '@/animations/variants';

export default function ProductRow({ title, products, isLoading, viewAllLink }) {
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -viewportWidth() : viewportWidth();
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const viewportWidth = () => {
    return scrollRef.current ? scrollRef.current.clientWidth * 0.8 : 300;
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5); // 5px tolerance
    }
  };

  return (
    <div className="relative w-full py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-2xl font-heading font-bold text-neutral-900 dark:text-neutral-50">
          {title}
        </h2>
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors flex items-center gap-1"
          >
            See All <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="flex gap-4 overflow-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex-shrink-0 w-[240px] sm:w-[280px] aspect-[3/4] rounded-2xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
          ))}
        </div>
      ) : products?.length > 0 ? (
        <div className="relative group max-w-[1400px] mx-auto">
          {/* Scroll Arrows */}
          {showLeftArrow && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/90 dark:bg-neutral-900/90 shadow-lg text-neutral-700 dark:text-neutral-300 hover:text-primary-500 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block border border-neutral-200 dark:border-neutral-800"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          
          {showRightArrow && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/90 dark:bg-neutral-900/90 shadow-lg text-neutral-700 dark:text-neutral-300 hover:text-primary-500 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block border border-neutral-200 dark:border-neutral-800"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Scrolling Container */}
          <motion.div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory no-scrollbar px-4 sm:px-6 lg:px-8 pb-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-100px' }}
          >
            {products.map((product) => (
              <motion.div
                key={product.id}
                variants={staggerItem}
                className="flex-shrink-0 w-[240px] sm:w-[280px] snap-start"
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      ) : (
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <p className="text-neutral-500 text-sm">No products found.</p>
        </div>
      )}
    </div>
  );
}
