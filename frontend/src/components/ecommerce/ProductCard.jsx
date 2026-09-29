import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import RatingStars from '@/components/ecommerce/RatingStars';
import { hoverLift } from '@/animations/variants';
import { formatPrice } from '@/utils/formatPrice';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    id,
    name,
    slug,
    images,
    image,
    price_usd,
    compare_at_price_usd,
    rating,
    category,
    brand,
  } = product;

  const imageUrl = images?.[0]?.image_url || images?.[0] || image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop';

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast('Please log in to add items to your cart', { icon: '🔒' });
      navigate('/login', { state: { from: location } });
      return;
    }

    try {
      await addToCart(product, 1);
      toast.success('Added to cart');
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  return (
    <motion.div {...hoverLift} className="flex flex-col w-full h-full">
      <Link
        to={`/product/${slug || id}`}
        className="group flex flex-col flex-1 w-full rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-soft transition-all duration-300 hover:shadow-premium hover:border-primary-100 dark:hover:border-primary-800/60"
      >
        {/* Image */}
        <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-neutral-50 to-primary-50/60 dark:from-neutral-800 dark:to-neutral-900 flex-shrink-0">
          <img
            src={imageUrl}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-neutral-950/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
          {category && (
            <span className="absolute top-3 left-3 max-w-[calc(100%-1.5rem)] truncate px-2.5 py-1 rounded-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
              {category}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex-1">
            {brand && (
              <p className="text-[11px] text-primary-500 dark:text-primary-400 font-semibold uppercase tracking-wider mb-1">{brand}</p>
            )}
            <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 line-clamp-2 leading-snug mb-2 group-hover:text-primary-500 transition-colors">
              {name}
            </h3>
            {rating != null && (
              <div className="mb-2">
                <RatingStars rating={rating} />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-auto pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <span className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              {formatPrice(price_usd)}
            </span>
            <button
              onClick={handleAddToCart}
              className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-500 transition-all duration-300 group-hover:bg-primary-500 group-hover:text-white group-hover:shadow-glow hover:bg-primary-600!dark:text-primary-300 dark:group-hover:text-white"
              aria-label="Add to cart"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
