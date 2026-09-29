import { Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import QuantitySelector from '@/components/ecommerce/QuantitySelector';
import { formatPrice } from '@/utils/formatPrice';

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  // Extract data from normalized item or nested product
  const product = item.product || {};
  const imageUrl = item.image || product.images?.[0]?.image_url || product.image || null;
  const name = item.name || product.name || 'Product';
  const productId = item.product_id || product.id || item.id;
  const unitPrice = parseFloat(item.price_usd || item.price || product.price_usd || 0);
  const quantity = item.quantity || 1;
  const lineTotal = unitPrice * quantity;

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
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs">
            No Image
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-neutral-800 dark:text-neutral-100 line-clamp-2">{name}</h4>
        <p className="text-xs text-neutral-400 mt-0.5">
          {formatPrice(unitPrice)} × {quantity}
        </p>
        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 mt-1">
          {formatPrice(lineTotal)}
        </p>

        <div className="flex items-center justify-between mt-3">
          <QuantitySelector
            value={quantity}
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
