import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import CartItem from '@/components/ecommerce/CartItem';
import CouponInput from '@/components/ecommerce/CouponInput';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/common/PageHeader';
import PillLink, { TextLink } from '@/components/home/ui/PillLink';
import Accent from '@/components/home/ui/Accent';
import { CONTAINER } from '@/components/home/ui/styles';
import { pageTransition } from '@/animations/variants';
import { formatPrice } from '@/utils/formatPrice';
import toast from 'react-hot-toast';

const MotionDiv = motion.div;

export default function Cart() {
  const { items, itemCount, subtotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [discount, setDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState(null);

  const total = subtotal - discount;

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

  const handleCouponApply = (data) => {
    setDiscount(data.discount || 0);
    setCouponCode(data.code || null);
  };

  const handleCouponRemove = () => {
    setDiscount(0);
    setCouponCode(null);
  };

  if (itemCount === 0) {
    return (
      <MotionDiv {...pageTransition} className={`${CONTAINER} py-10 sm:py-16`}>
        <div className="relative overflow-hidden rounded-[2rem] bg-surface px-6 py-16 text-center ring-1 ring-line sm:px-12 sm:py-24">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-plate" aria-hidden="true">
            <ShoppingBag className="h-8 w-8 text-ink-soft" strokeWidth={1.5} />
          </div>
          <p className="mt-8 text-[11px] font-medium uppercase tracking-[0.22em] text-ink-faint">Your cart</p>
          <h1 className="font-display mt-4 text-[clamp(2rem,5vw,3.25rem)] font-medium leading-[1.05] tracking-[-0.03em] text-ink">
            Your cart is <Accent>empty</Accent>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-ink-soft">
            Explore our products and find something you love
          </p>
          <div className="mt-10 flex justify-center">
            <PillLink to="/shop">Start Shopping</PillLink>
          </div>
        </div>
      </MotionDiv>
    );
  }

  return (
    <MotionDiv {...pageTransition} className="pb-20 sm:pb-28">
      <PageHeader
        eyebrow={`${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
        title="Your cart"
        size="sm"
      >
        <button
          type="button"
          onClick={clearCart}
          className="group inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-medium text-ink-soft ring-1 ring-inset ring-line transition-colors duration-300 hover:text-error-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" /> Clear all
        </button>
      </PageHeader>

      <div className={CONTAINER}>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="flex items-center justify-between border-b border-line pb-4 text-[11px] font-medium uppercase tracking-[0.22em] text-ink-faint">
              <span>Product</span>
              <span className="tabular-nums">Total</span>
            </div>
            <div className="divide-y divide-line border-b border-line">
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
            <div className="mt-6">
              <TextLink to="/shop">Continue shopping</TextLink>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="space-y-6 rounded-[2rem] bg-surface p-6 ring-1 ring-line sm:p-8 lg:sticky lg:top-28">
              <h3 className="font-display text-2xl font-medium leading-[1.05] tracking-[-0.03em] text-ink">Order Summary</h3>

              <CouponInput onApply={handleCouponApply} onRemove={handleCouponRemove} />

              <dl className="space-y-3 border-t border-line pt-6 text-[15px]">
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-soft">Subtotal</dt>
                  <dd className="font-medium tabular-nums text-ink">{formatPrice(subtotal)}</dd>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-accent">Discount ({couponCode})</dt>
                    <dd className="font-medium tabular-nums text-accent">-{formatPrice(discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-soft">Shipping</dt>
                  <dd className="text-right text-ink-faint">Calculated at checkout</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 border-t border-line pt-5">
                  <dt className="font-medium text-ink">Total</dt>
                  <dd className="font-display text-3xl font-medium tracking-[-0.03em] tabular-nums text-ink">{formatPrice(total)}</dd>
                </div>
              </dl>

              {isAuthenticated ? (
                <Link to="/checkout" state={{ couponCode, discount }} className="block">
                  <Button className="w-full gap-2" size="lg">
                    Proceed to Checkout <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <div className="space-y-3">
                  <Link to="/login" state={{ from: { pathname: '/checkout' } }} className="block">
                    <Button className="w-full" size="lg">Sign In to Checkout</Button>
                  </Link>
                  <p className="text-center text-xs text-ink-faint">You need to be logged in to checkout</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MotionDiv>
  );
}
