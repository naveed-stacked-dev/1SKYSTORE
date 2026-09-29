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
import { pageTransition } from '@/animations/variants';
import toast from 'react-hot-toast';
import { EMPTY_ADDRESS_FORM, getAddressApiErrors, validateAddressForm } from '@/utils/addressForm';
import { formatPrice } from '@/utils/formatPrice';

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
        color: '#16a34a', // primary green
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
    <motion.div {...pageTransition} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-heading font-bold text-neutral-900 dark:text-white mb-8">Checkout</h1>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-10 overflow-x-auto no-scrollbar">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                i <= step
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'
              }`}
            >
              <s.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <div className="w-8 h-px bg-neutral-200 dark:bg-neutral-700" />}
          </div>
        ))}
      </div>

      {/* Step 0: Address */}
      {step === 0 && (
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Select Delivery Address</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {addresses.map((addr) => (
              <AddressCard key={addr.id} address={addr} selected={selectedAddress?.id === addr.id} onSelect={setSelectedAddress} />
            ))}
          </div>
          {showAddForm ? (
            <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-700 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Full Name" error={addressErrors.full_name} value={newAddress.full_name} onChange={(e) => updateAddressField('full_name', e.target.value)} />
                <Input label="Phone" error={addressErrors.phone} value={newAddress.phone} onChange={(e) => updateAddressField('phone', e.target.value)} />
                <Input label="Address Line 1" error={addressErrors.address_line1} className="sm:col-span-2" value={newAddress.address_line1} onChange={(e) => updateAddressField('address_line1', e.target.value)} />
                <Input label="Address Line 2 (Optional)" error={addressErrors.address_line2} className="sm:col-span-2" value={newAddress.address_line2} onChange={(e) => updateAddressField('address_line2', e.target.value)} />
                <Input label="Landmark" error={addressErrors.landmark} className="sm:col-span-2" value={newAddress.landmark} onChange={(e) => updateAddressField('landmark', e.target.value)} placeholder="e.g. Near City Hospital" />
                <Input label="City" error={addressErrors.city} value={newAddress.city} onChange={(e) => updateAddressField('city', e.target.value)} />
                <Input label="State" error={addressErrors.state} value={newAddress.state} onChange={(e) => updateAddressField('state', e.target.value)} />
                <Input label="Postal Code (Pincode)" error={addressErrors.postal_code} value={newAddress.postal_code} onChange={(e) => updateAddressField('postal_code', e.target.value)} />
                <Input label="Country" error={addressErrors.country} value="India" disabled />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleAddAddress} loading={loading}>Save Address</Button>
                <Button variant="ghost" onClick={() => { setShowAddForm(false); setAddressErrors({}); }}>Cancel</Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" onClick={() => { setShowAddForm(true); setNewAddress(EMPTY_ADDRESS_FORM); setAddressErrors({}); }} className="gap-2">
              <Plus className="w-4 h-4" /> Add New Address
            </Button>
          )}
          <div className="mt-6">
            <Button onClick={goToShipping} size="lg" disabled={!selectedAddress} className="gap-2">
              Continue to Shipping <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 1: Shipping */}
      {step === 1 && (
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Select Shipping Option</h2>

          {shippingLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
              <p className="text-sm text-neutral-400">Fetching shipping options from couriers...</p>
            </div>
          ) : shippingOptions.length > 0 ? (
            <div className="space-y-3 mb-6">
              {shippingOptions.map((option) => (
                <div
                  key={option.courier_id}
                  onClick={() => setSelectedShipping(option)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedShipping?.courier_id === option.courier_id
                      ? 'border-primary-500 bg-primary-50/30 dark:bg-primary-900/10'
                      : 'border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-200 dark:hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
                      <Truck className="w-4 h-4 text-neutral-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100">{option.courier_name}</p>
                      <p className="text-xs text-neutral-400">
                        {option.etd || `${option.estimated_delivery_days} days`}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                        {option.rate === 0 ? 'Free' : formatPrice(option.rate)}
                      </p>
                    </div>
                    {selectedShipping?.courier_id === option.courier_id && (
                      <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 mb-6">
              <p className="text-sm text-neutral-500 text-center">No shipping options available for this address. Please try a different address.</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setStep(0)}>Back</Button>
            <Button onClick={goToConfirm} size="lg" disabled={!selectedShipping} className="gap-2">
              Review Order <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Confirm & Pay */}
      {step === 2 && (
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Order Review</h2>
          <div className="space-y-4 mb-6">

            {/* Address */}
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
              <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">Delivering to</p>
              <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100">{selectedAddress?.full_name}</p>
              <p className="text-xs text-neutral-500 mt-1">
                {selectedAddress?.address_line1}
                {selectedAddress?.address_line2 && `, ${selectedAddress.address_line2}`}
              </p>
              {selectedAddress?.landmark && (
                <p className="text-xs text-neutral-400 mt-0.5">Landmark: {selectedAddress.landmark}</p>
              )}
              <p className="text-xs text-neutral-500">
                {selectedAddress?.city}, {selectedAddress?.state} {selectedAddress?.postal_code}
              </p>
            </div>

            {/* Cart Items */}
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
              <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-3">Items ({items.length})</p>
              <div className="space-y-3">
                {items.map((item) => {
                  const product = item.product || {};
                  const name = item.name || product.name || 'Product';
                  const price = parseFloat(item.price || item.price_usd || product.price_usd || 0);
                  const image = item.image || product.images?.[0]?.image_url || null;

                  return (
                    <div key={item.product_id || item.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex-shrink-0">
                        {image ? (
                          <img src={image} alt={name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-4 h-4 text-neutral-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-neutral-800 dark:text-neutral-100 line-clamp-1">{name}</p>
                        <p className="text-[11px] text-neutral-400">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-100">
                        {formatPrice(price * item.quantity)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shipping */}
            {selectedShipping && (
              <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">Shipping</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100">{selectedShipping.courier_name}</p>
                    <p className="text-xs text-neutral-400">{selectedShipping.etd || `${selectedShipping.estimated_delivery_days} days`}</p>
                  </div>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                    {shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
                  </p>
                </div>
              </div>
            )}

            {/* Price Breakdown */}
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 space-y-3">
              <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1">Price Breakdown</p>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Subtotal</span>
                <span className="font-medium text-neutral-800 dark:text-neutral-100">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-primary-500">Discount {couponCode && `(${couponCode})`}</span>
                  <span className="text-primary-500 font-medium">-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Shipping</span>
                <span className="font-medium text-neutral-800 dark:text-neutral-100">
                  {shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <span className="font-semibold text-neutral-900 dark:text-white">Total</span>
                <span className="text-xl font-bold text-neutral-900 dark:text-white">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Security badge */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-50/50 dark:bg-primary-900/10">
              <ShieldCheck className="w-4 h-4 text-primary-500" />
              <p className="text-xs text-primary-600 dark:text-primary-400">Secure payment via Razorpay. Your data is protected.</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={handlePlaceOrder} loading={orderLoading} size="lg" className="gap-2">
              {orderLoading ? 'Processing...' : 'Pay & Place Order'}
              {!orderLoading && <CreditCard className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
