import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useGeo } from '@/context/GeoContext';
import { useAuth } from '@/context/AuthContext';
import RatingStars from '@/components/ecommerce/RatingStars';
import { hoverLift } from '@/animations/variants';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { getPrice } = useGeo();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    id,
    name,
    slug,
    images,
    image,
    price_inr,
    price_usd,
    compare_at_price_inr,
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
    <motion.div {...hoverLift}>
      <Link
        to={`/product/${slug || id}`}
        className="group block rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 transition-shadow hover:shadow-card"
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-neutral-100 dark:bg-neutral-800">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {category && (
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm text-[11px] font-medium text-neutral-700 dark:text-neutral-300">
              {category}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {brand && (
            <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider mb-1">{brand}</p>
          )}
          <h3 className="text-sm font-medium text-neutral-800 dark:text-neutral-100 line-clamp-2 leading-snug mb-2 group-hover:text-primary-500 transition-colors">
            {name}
          </h3>
          {rating != null && (
            <div className="mb-2">
              <RatingStars rating={rating} />
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
              {getPrice(price_inr, price_usd)}
            </span>
            <button
              onClick={handleAddToCart}
              className="p-2 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-500 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors"
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
