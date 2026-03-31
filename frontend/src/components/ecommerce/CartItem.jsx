import { Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import QuantitySelector from '@/components/ecommerce/QuantitySelector';
import { useGeo } from '@/context/GeoContext';

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  const { getPrice } = useGeo();

  const imageUrl = item.images?.[0] || item.image || item.Product?.images?.[0] || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&h=100&fit=crop';
  const name = item.name || item.Product?.name || 'Product';
  const productId = item.product_id || item.id;
  const priceInr = item.price_inr || item.Product?.price_inr || 0;
  const priceUsd = item.price_usd || item.Product?.price_usd || 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="flex gap-4 p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800"
    >
      {/* Image */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex-shrink-0">
        <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-neutral-800 dark:text-neutral-100 line-clamp-2">{name}</h4>
        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 mt-1">
          {getPrice(priceInr, priceUsd)}
        </p>

        <div className="flex items-center justify-between mt-3">
          <QuantitySelector
            value={item.quantity || 1}
            onChange={(qty) => onUpdateQuantity(productId, qty)}
            className="scale-90 origin-left"
          />
          <button
            onClick={() => onRemove(productId)}
            className="p-2 rounded-xl text-neutral-400 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10 transition-colors"
            aria-label="Remove item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
