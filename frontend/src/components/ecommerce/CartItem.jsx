import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import QuantitySelector from '@/components/ecommerce/QuantitySelector';
import { formatPrice } from '@/utils/formatPrice';

const MotionDiv = motion.div;

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
    <MotionDiv
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex gap-4 py-6 sm:gap-6"
    >
      {/* Packshot */}
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[1.25rem] bg-plate sm:h-32 sm:w-32 sm:rounded-[1.5rem]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-contain p-[12%] mix-blend-multiply"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[11px] uppercase tracking-[0.18em] text-ink-faint">
            No image
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h4 className="font-display text-base font-medium leading-snug tracking-[-0.01em] text-ink line-clamp-2 sm:text-lg">
              {name}
            </h4>
            <p className="mt-1 text-sm tabular-nums text-ink-faint">
              {formatPrice(unitPrice)} × {quantity}
            </p>
          </div>
          <p className="shrink-0 font-display text-base font-medium tabular-nums text-ink sm:text-lg">
            {formatPrice(lineTotal)}
          </p>
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
          <QuantitySelector value={quantity} onChange={(qty) => onUpdateQuantity(productId, qty)} />
          <button
            type="button"
            onClick={() => onRemove(productId)}
            className="group -mr-2 inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm text-ink-faint transition-colors duration-300 hover:text-error-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            aria-label="Remove item"
          >
            <X className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" aria-hidden="true" />
            <span className="hidden sm:inline">Remove</span>
          </button>
        </div>
      </div>
    </MotionDiv>
  );
}
