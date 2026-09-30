import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Truck, CreditCard, Check, Plus, Loader2, Package, ChevronRight, ShieldCheck } from 'lucide-react';
import addressService from '@/api/address.service';
import shippingService from '@/api/shipping.service';
import orderService from '@/api/order.service';
import paymentService from '@/api/payment.service';
import { useCart } from '@/context/CartContext';
import AddressCard from '@/components/ecommerce/AddressCard';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import PageHeader from '@/components/common/PageHeader';
import { CONTAINER } from '@/components/home/ui/styles';
import { pageTransition } from '@/animations/variants';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';
import { EMPTY_ADDRESS_FORM, getAddressApiErrors, validateAddressForm } from '@/utils/addressForm';
import { formatPrice } from '@/utils/formatPrice';

const MotionDiv = motion.div;

const PANEL = 'rounded-[1.75rem] bg-surface p-5 ring-1 ring-line sm:p-6';
const LABEL = 'text-[11px] font-medium uppercase tracking-[0.22em] text-ink-faint';

/** Numbered section header used for each checkout step */
function StepHeading({ index, title }) {
  return (
    <div className="mb-6 flex items-center gap-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink font-display text-sm font-medium tabular-nums text-canvas">
        {index}
      </span>
      <h2 className="font-display text-2xl font-medium leading-[1.05] tracking-[-0.03em] text-ink sm:text-[1.75rem]">{title}</h2>
    </div>
  );
}

const STEPS = [
  { id: 'address', label: 'Address', icon: MapPin },
  { id: 'shipping', label: 'Shipping', icon: Truck },
  { id: 'confirm', label: 'Confirm', icon: Check },
];

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, subtotal, clearCart, fetchCart } = useCart();

  // Coupon from cart page
  const couponFromCart = location.state?.couponCode || null;
  const discountFromCart = location.state?.discount || 0;

  const [step, setStep] = useState(0);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState(EMPTY_ADDRESS_FORM);
  const [addressErrors, setAddressErrors] = useState({});

  // Shipping
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [shippingLoading, setShippingLoading] = useState(false);

  // Coupon
  const [couponCode, setCouponCode] = useState(couponFromCart);
  const [discount, setDiscount] = useState(discountFromCart);

  // Order
  const [orderLoading, setOrderLoading] = useState(false);

  useEffect(() => {
    document.title = 'Checkout — 1SkyStore';
    loadAddresses();
  }, []);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  async function loadAddresses() {
    try {
      const res = await addressService.getAddresses();
      const data = res.data?.data || res.data;
      const addrs = Array.isArray(data) ? data : data?.addresses || [];
      setAddresses(addrs);
      const defaultAddr = addrs.find((a) => a.is_default) || addrs[0];
      if (defaultAddr) setSelectedAddress(defaultAddr);
    } catch {}
  }

  async function handleAddAddress() {
    const { values, errors, isValid } = validateAddressForm(newAddress);
    setAddressErrors(errors);

    if (!isValid) {
      toast.error('Please fix the highlighted address fields');
      return;
    }

    try {
      setLoading(true);
      await addressService.createAddress(values);
      await loadAddresses();
      setShowAddForm(false);
      setNewAddress(EMPTY_ADDRESS_FORM);
      setAddressErrors({});
      toast.success('Address added');
    } catch (err) {
      const apiErrors = getAddressApiErrors(err);
      if (Object.keys(apiErrors).length > 0) {
        setAddressErrors(apiErrors);
        toast.error('Please check the address details and try again');
      } else {
        toast.error(err.message || 'Failed to add address');
      }
    } finally {
      setLoading(false);
    }
  }

  function updateAddressField(field, value) {
    setNewAddress((prev) => ({ ...prev, [field]: value }));
    setAddressErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  // Fetch shipping options from Shiprocket when moving to shipping step
  async function fetchShippingOptions() {
    if (!selectedAddress) return;
    try {
      setShippingLoading(true);
      setShippingOptions([]);
      setSelectedShipping(null);
      const res = await shippingService.calculateShipping({ address_id: selectedAddress.id });
      const data = res.data?.data || res.data || [];
      const options = Array.isArray(data) ? data : [];
      setShippingOptions(options);
      // Auto-select cheapest
      if (options.length > 0) {
        const sorted = [...options].sort((a, b) => a.rate - b.rate);
        setSelectedShipping(sorted[0]);
      }
    } catch (err) {
      toast.error('Failed to fetch shipping options');
      console.error('Shipping fetch error:', err);
    } finally {
      setShippingLoading(false);
    }
  }

  function goToShipping() {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }
    setStep(1);
    fetchShippingOptions();
  }

  function goToConfirm() {
    if (!selectedShipping) {
      toast.error('Please select a shipping option');
      return;
    }
    setStep(2);
  }

  // Calculate totals
  const shippingCost = selectedShipping?.rate || 0;
  const total = subtotal - discount + shippingCost;

  async function handlePlaceOrder() {
    try {
      setOrderLoading(true);

      // 1. Create order on backend (backend calculates everything server-side)
      const res = await orderService.placeOrder({
        address_id: selectedAddress.id,
        coupon_code: couponCode || undefined,
        shipping_courier_id: selectedShipping?.courier_id || undefined,
        shipping_cost: shippingCost || 0,
        payment_provider: 'razorpay',
      });

      const data = res.data?.data || res.data;
      const order = data?.order;
      const paymentData = data?.paymentData;

      if (!paymentData?.razorpay_order_id) {
        throw new Error('Payment order not created');
      }

      // 2. Open Razorpay checkout
      await openRazorpay(order, paymentData);
    } catch (err) {
      toast.error(err.message || 'Failed to place order');
      setOrderLoading(false);
    }
  }

  function openRazorpay(order, paymentData) {
    return new Promise((resolve, reject) => {
      // Load Razorpay script if not already loaded
      if (window.Razorpay) {
        launchRazorpay(order, paymentData, resolve, reject);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => launchRazorpay(order, paymentData, resolve, reject);
      script.onerror = () => {
        setOrderLoading(false);
        toast.error('Failed to load payment gateway');
        reject(new Error('Razorpay script load failed'));
      };
      document.body.appendChild(script);
    });
  }

  function launchRazorpay(order, paymentData, resolve, reject) {
    const options = {
      key: paymentData.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: paymentData.amount,
      currency: paymentData.currency || 'USD',
      name: '1SkyStore',
      description: `Order ${order?.order_number || ''}`,
      order_id: paymentData.razorpay_order_id,
      handler: async (response) => {
        try {
          // 3. Verify payment on backend
          await paymentService.razorpayVerify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          toast.success('Payment successful! 🎉');

          // Navigate immediately to prevent the empty-cart useEffect from bouncing us to /cart
          navigate(`/orders`, { replace: true });

          // Refresh the cart context silently in the background
          fetchCart();
          resolve();
        } catch {
          toast.error('Payment verification failed. Please contact support.');
          setOrderLoading(false);
          reject(new Error('Verification failed'));
        }
      },
      modal: {
        ondismiss: () => {
          setOrderLoading(false);
          toast.error('Payment cancelled');
          reject(new Error('Payment cancelled'));
        },
      },
      theme: {
        color: '#1565C0', // brand blue
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (response) => {
      toast.error('Payment failed: ' + (response.error?.description || 'Unknown error'));
      setOrderLoading(false);
      reject(new Error('Payment failed'));
    });
    rzp.open();
  }

  return (
    <MotionDiv {...pageTransition} className="pb-20 sm:pb-28">
      <PageHeader eyebrow="Secure checkout" title="Checkout" size="sm" />

      <div className={CONTAINER}>
        {/* Step Indicator */}
        <ol className="mb-10 flex items-center gap-2 overflow-x-auto no-scrollbar sm:mb-12" aria-label="Checkout progress">
          {STEPS.map((s, i) => {
            const done = i < step;
            const current = i === step;
            return (
              <li key={s.id} className="flex shrink-0 items-center gap-2">
                <div
                  aria-current={current ? 'step' : undefined}
                  className={cn(
                    'flex min-h-11 items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-4 text-sm font-medium transition-colors duration-500',
                    current && 'bg-ink text-canvas',
                    done && 'bg-accent-soft text-accent',
                    !current && !done && 'text-ink-faint ring-1 ring-inset ring-line'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full text-xs tabular-nums',
                      current && 'bg-canvas text-ink',
                      done && 'bg-accent text-canvas',
                      !current && !done && 'bg-mist'
                    )}
                  >
                    {done ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : `0${i + 1}`}
                  </span>
                  <span className={cn(!current && 'hidden sm:inline')}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && <div className="h-px w-6 bg-line sm:w-10" aria-hidden="true" />}
              </li>
            );
          })}
        </ol>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="min-w-0 lg:col-span-7 xl:col-span-8">
            {/* Step 0: Address */}
            {step === 0 && (
              <section>
                <StepHeading index="01" title="Select Delivery Address" />
                <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {addresses.map((addr) => (
                    <AddressCard key={addr.id} address={addr} selected={selectedAddress?.id === addr.id} onSelect={setSelectedAddress} />
                  ))}
                </div>
                {showAddForm ? (
                  <div className={cn(PANEL, 'space-y-6')}>
                    <p className="font-display text-lg font-medium tracking-[-0.02em] text-ink">Add New Address</p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Input label="Full Name" error={addressErrors.full_name} value={newAddress.full_name} onChange={(e) => updateAddressField('full_name', e.target.value)} />
                      <Input label="Phone" error={addressErrors.phone} value={newAddress.phone} onChange={(e) => updateAddressField('phone', e.target.value)} />
                      <div className="sm:col-span-2">
                        <Input label="Address Line 1" error={addressErrors.address_line1} value={newAddress.address_line1} onChange={(e) => updateAddressField('address_line1', e.target.value)} />
                      </div>
                      <div className="sm:col-span-2">
                        <Input label="Address Line 2 (Optional)" error={addressErrors.address_line2} value={newAddress.address_line2} onChange={(e) => updateAddressField('address_line2', e.target.value)} />
                      </div>
                      <div className="sm:col-span-2">
                        <Input label="Landmark" error={addressErrors.landmark} value={newAddress.landmark} onChange={(e) => updateAddressField('landmark', e.target.value)} placeholder="e.g. Near City Hospital" />
                      </div>
                      <Input label="City" error={addressErrors.city} value={newAddress.city} onChange={(e) => updateAddressField('city', e.target.value)} />
                      <Input label="State" error={addressErrors.state} value={newAddress.state} onChange={(e) => updateAddressField('state', e.target.value)} />
                      <Input label="Postal Code (Pincode)" error={addressErrors.postal_code} value={newAddress.postal_code} onChange={(e) => updateAddressField('postal_code', e.target.value)} />
                      <Input label="Country" error={addressErrors.country} value="India" disabled />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button onClick={handleAddAddress} loading={loading}>Save Address</Button>
                      <Button variant="ghost" onClick={() => { setShowAddForm(false); setAddressErrors({}); }}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="outline" onClick={() => { setShowAddForm(true); setNewAddress(EMPTY_ADDRESS_FORM); setAddressErrors({}); }} className="gap-2">
                    <Plus className="w-4 h-4" /> Add New Address
                  </Button>
                )}
                <div className="mt-10 border-t border-line pt-8">
                  <Button onClick={goToShipping} size="lg" disabled={!selectedAddress} className="w-full gap-2 sm:w-auto">
                    Continue to Shipping <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </section>
            )}

            {/* Step 1: Shipping */}
            {step === 1 && (
              <section>
                <StepHeading index="02" title="Select Shipping Option" />

                {shippingLoading ? (
                  <div className={cn(PANEL, 'flex flex-col items-center justify-center gap-3 py-14')}>
                    <Loader2 className="h-7 w-7 animate-spin text-accent" />
                    <p className="text-center text-sm text-ink-soft">Fetching shipping options from couriers...</p>
                  </div>
                ) : shippingOptions.length > 0 ? (
                  <div className="mb-6 space-y-3" role="radiogroup" aria-label="Shipping options">
                    {shippingOptions.map((option) => {
                      const isSelected = selectedShipping?.courier_id === option.courier_id;
                      return (
                        <button
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          key={option.courier_id}
                          onClick={() => setSelectedShipping(option)}
                          className={cn(
                            'block w-full rounded-[1.5rem] bg-surface p-4 text-left transition-[box-shadow,background-color] duration-300 sm:p-5',
                            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                            isSelected ? 'ring-2 ring-accent' : 'ring-1 ring-line hover:ring-ink/25'
                          )}
                        >
                          <div className="flex items-center gap-3 sm:gap-4">
                            <div
                              className={cn(
                                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors',
                                isSelected ? 'bg-accent-soft text-accent' : 'bg-mist text-ink-soft'
                              )}
                            >
                              <Truck className="h-4 w-4" aria-hidden="true" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[15px] font-medium text-ink">{option.courier_name}</p>
                              <p className="text-sm text-ink-faint">
                                {option.etd || `${option.estimated_delivery_days} days`}
                              </p>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="font-display text-base font-medium tabular-nums text-ink">
                                {option.rate === 0 ? 'Free' : formatPrice(option.rate)}
                              </p>
                            </div>
                            <span
                              className={cn(
                                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors',
                                isSelected ? 'bg-accent text-canvas' : 'ring-1 ring-inset ring-line'
                              )}
                              aria-hidden="true"
                            >
                              {isSelected && <Check className="h-3.5 w-3.5" />}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mb-6 rounded-[1.75rem] border border-dashed border-line p-8">
                    <p className="text-center text-[15px] text-ink-soft">No shipping options available for this address. Please try a different address.</p>
                  </div>
                )}

                <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-line pt-8">
                  <Button variant="ghost" onClick={() => setStep(0)}>Back</Button>
                  <Button onClick={goToConfirm} size="lg" disabled={!selectedShipping} className="gap-2">
                    Review Order <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </section>
            )}

            {/* Step 2: Confirm & Pay */}
            {step === 2 && (
              <section>
                <StepHeading index="03" title="Order Review" />
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">

                  {/* Address */}
                  <div className={PANEL}>
                    <div className="mb-3 flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-ink-faint" aria-hidden="true" />
                      <p className={LABEL}>Delivering to</p>
                    </div>
                    <p className="text-[15px] font-medium text-ink">{selectedAddress?.full_name}</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                      {selectedAddress?.address_line1}
                      {selectedAddress?.address_line2 && `, ${selectedAddress.address_line2}`}
                    </p>
                    {selectedAddress?.landmark && (
                      <p className="mt-0.5 text-sm text-ink-faint">Landmark: {selectedAddress.landmark}</p>
                    )}
                    <p className="text-sm text-ink-soft">
                      {selectedAddress?.city}, {selectedAddress?.state} {selectedAddress?.postal_code}
                    </p>
                  </div>

                  {/* Shipping */}
                  {selectedShipping && (
                    <div className={PANEL}>
                      <div className="mb-3 flex items-center gap-2">
                        <Truck className="h-3.5 w-3.5 text-ink-faint" aria-hidden="true" />
                        <p className={LABEL}>Shipping</p>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[15px] font-medium text-ink">{selectedShipping.courier_name}</p>
                          <p className="mt-1 text-sm text-ink-soft">{selectedShipping.etd || `${selectedShipping.estimated_delivery_days} days`}</p>
                        </div>
                        <p className="shrink-0 text-[15px] font-medium tabular-nums text-ink">
                          {shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Security badge */}
                <div className="flex items-center gap-3 rounded-2xl bg-accent-soft px-4 py-3">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                  <p className="text-sm text-ink-soft">Secure payment via Razorpay. Your data is protected.</p>
                </div>

                <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-line pt-8">
                  <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                  <Button onClick={handlePlaceOrder} loading={orderLoading} size="lg" className="gap-2">
                    {orderLoading ? 'Processing...' : 'Pay & Place Order'}
                    {!orderLoading && <CreditCard className="w-4 h-4" />}
                  </Button>
                  <p className="ml-auto text-sm text-ink-soft lg:hidden">
                    Total <span className="ml-1 font-display text-lg font-medium tabular-nums text-ink">{formatPrice(total)}</span>
                  </p>
                </div>
              </section>
            )}
          </div>

          {/* Order summary — items and price breakdown, sticky beside the steps on desktop */}
          <aside className="lg:col-span-5 xl:col-span-4" aria-label="Order summary">
            <div className="rounded-[2rem] bg-surface p-6 ring-1 ring-line sm:p-8 lg:sticky lg:top-28">
              <h3 className="font-display text-2xl font-medium leading-[1.05] tracking-[-0.03em] text-ink">Order Summary</h3>

              {/* Cart Items */}
              <p className={cn(LABEL, 'mt-6')}>Items ({items.length})</p>
              <div className="mt-4 max-h-88 space-y-4 overflow-y-auto pr-1">
                {items.map((item) => {
                  const product = item.product || {};
                  const name = item.name || product.name || 'Product';
                  const price = parseFloat(item.price || item.price_usd || product.price_usd || 0);
                  const image = item.image || product.images?.[0]?.image_url || null;

                  return (
                    <div key={item.product_id || item.id} className="flex items-center gap-4">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-plate">
                        {image ? (
                          <img src={image} alt={name} className="absolute inset-0 h-full w-full object-contain p-1.5 mix-blend-multiply" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Package className="h-4 w-4 text-ink-faint" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-medium text-ink">{name}</p>
                        <p className="text-xs tabular-nums text-ink-faint">Qty: {item.quantity}</p>
                      </div>
                      <p className="shrink-0 text-sm font-medium tabular-nums text-ink">
                        {formatPrice(price * item.quantity)}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Price Breakdown */}
              <dl className="mt-6 space-y-3 border-t border-line pt-6 text-[15px]">
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-soft">Subtotal</dt>
                  <dd className="font-medium tabular-nums text-ink">{formatPrice(subtotal)}</dd>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-accent">Discount {couponCode && `(${couponCode})`}</dt>
                    <dd className="font-medium tabular-nums text-accent">-{formatPrice(discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-soft">Shipping</dt>
                  <dd className="text-right font-medium tabular-nums text-ink">
                    {selectedShipping ? (
                      shippingCost === 0 ? 'Free' : formatPrice(shippingCost)
                    ) : (
                      <span className="font-normal text-ink-faint">Select an option</span>
                    )}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 border-t border-line pt-5">
                  <dt className="font-medium text-ink">Total</dt>
                  <dd className="font-display text-3xl font-medium tracking-[-0.03em] tabular-nums text-ink">{formatPrice(total)}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </MotionDiv>
  );
}
