import { motion } from 'framer-motion';
import ProductCard from '@/components/ecommerce/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { staggerContainer, staggerItem } from '@/animations/variants';

export default function ProductGrid({ products = [], loading = false, columns = 4 }) {
  const gridCols = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  if (loading) {
    return (
      <div className={`grid grid-cols-1 ${gridCols[columns] || gridCols[4]} gap-5`}>
        {[...Array(columns * 2)].map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="text-center py-20">
        <p className="text-neutral-400 dark:text-neutral-500 text-lg">No products found</p>
        <p className="text-neutral-300 dark:text-neutral-600 text-sm mt-2">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <motion.div
      className={`grid grid-cols-1 ${gridCols[columns] || gridCols[4]} gap-5`}
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {products.map((product) => (
        <motion.div key={product.id} variants={staggerItem}>
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  );
}
