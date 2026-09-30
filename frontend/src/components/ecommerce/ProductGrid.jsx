import { motion } from 'framer-motion';
import { PackageSearch } from 'lucide-react';
import ProductCard from '@/components/ecommerce/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { staggerContainer, staggerItem } from '@/animations/variants';

const MotionDiv = motion.div;

export default function ProductGrid({ products = [], loading = false, columns = 4 }) {
  const gridCols = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };
  const grid = `grid grid-cols-2 ${gridCols[columns] || gridCols[4]} gap-x-3 gap-y-10 sm:gap-x-5 sm:gap-y-12`;

  if (loading) {
    return (
      <div className={grid}>
        {[...Array(columns * 2)].map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="flex flex-col items-center rounded-[2rem] border border-dashed border-line px-6 py-20 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-mist text-ink-soft">
          <PackageSearch className="h-6 w-6" aria-hidden="true" />
        </span>
        <p className="mt-5 font-display text-xl font-medium tracking-[-0.02em] text-ink">No products found</p>
        <p className="mt-1.5 text-sm text-ink-faint">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <MotionDiv className={grid} variants={staggerContainer} initial="initial" animate="animate">
      {products.map((product) => (
        <MotionDiv key={product.id} variants={staggerItem} className="flex h-full w-full flex-col">
          <ProductCard product={product} />
        </MotionDiv>
      ))}
    </MotionDiv>
  );
}
