import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useGeo } from '@/context/GeoContext';
import CartItem from '@/components/ecommerce/CartItem';
import CouponInput from '@/components/ecommerce/CouponInput';
import Button from '@/components/ui/Button';
import { pageTransition } from '@/animations/variants';
import toast from 'react-hot-toast';

export default function Cart() {
  const { items, itemCount, subtotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { formatPrice } = useGeo();

  const handleUpdateQuantity = async (productId, qty) => {
    try {
      await updateQuantity(productId, qty);
    } catch {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeFromCart(productId);
      toast.success('Item removed');
    } catch {
      toast.error('Failed to remove');
    }
  };

  if (itemCount === 0) {
    return (
      <motion.div {...pageTransition} className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-6">
          <ShoppingBag className="w-8 h-8 text-neutral-400" />
        </div>
        <h2 className="text-xl font-heading font-semibold text-neutral-800 dark:text-neutral-100 mb-2">Your cart is empty</h2>
        <p className="text-sm text-neutral-500 mb-6">Explore our products and find something you love</p>
        <Link to="/shop"><Button>Start Shopping</Button></Link>
      </motion.div>
    );
  }

  return (
    <motion.div {...pageTransition} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-neutral-900 dark:text-white">
          Cart ({itemCount})
        </h1>
        <button
          onClick={clearCart}
          className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-error-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" /> Clear all
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <CartItem
                key={item.id || item.product_id}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemove}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-6 space-y-5">
            <h3 className="text-lg font-heading font-semibold text-neutral-900 dark:text-white">Order Summary</h3>

            <CouponInput onApply={(data) => toast.success(`Discount: ${data.discount || data.discount_value || ''}%`)} />

            <div className="space-y-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Subtotal</span>
                <span className="font-medium text-neutral-800 dark:text-neutral-100">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Shipping</span>
                <span className="text-neutral-400">Calculated at checkout</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <span className="font-semibold text-neutral-900 dark:text-white">Total</span>
                <span className="text-lg font-bold text-neutral-900 dark:text-white">{formatPrice(subtotal)}</span>
              </div>
            </div>

            {isAuthenticated ? (
              <Link to="/checkout" className="block">
                <Button className="w-full gap-2" size="lg">
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <div className="space-y-3">
                <Link to="/login" state={{ from: { pathname: '/checkout' } }} className="block">
                  <Button className="w-full" size="lg">Sign In to Checkout</Button>
                </Link>
                <p className="text-xs text-neutral-400 text-center">You need to be logged in to checkout</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
