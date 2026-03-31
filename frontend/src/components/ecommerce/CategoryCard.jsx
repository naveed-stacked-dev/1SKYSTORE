import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { hoverScale } from '@/animations/variants';

export default function CategoryCard({ category, index = 0 }) {
  const {
    name,
    slug,
    image,
    product_count,
  } = category;

  const fallbackImages = [
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=400&h=300&fit=crop',
  ];

  const imageUrl = image || fallbackImages[index % fallbackImages.length];

  return (
    <motion.div {...hoverScale}>
      <Link
        to={`/category/${slug || encodeURIComponent(name)}`}
        className="group relative block rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 min-h-[200px] sm:min-h-[240px]"
      >
        <img
          src={imageUrl}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className="text-lg font-heading font-semibold text-white mb-0.5">{name}</h3>
          {product_count != null && (
            <p className="text-xs text-white/70">{product_count} products</p>
          )}
        </div>
        <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/40 transition-colors">
          <ArrowUpRight className="w-4 h-4 text-white" />
        </div>
      </Link>
    </motion.div>
  );
}
