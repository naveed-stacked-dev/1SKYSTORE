import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Truck, CreditCard, Check, Plus, Loader2 } from 'lucide-react';
import addressService from '@/api/address.service';
import shippingService from '@/api/shipping.service';
import orderService from '@/api/order.service';
import paymentService from '@/api/payment.service';
import { useCart } from '@/context/CartContext';
import { useGeo } from '@/context/GeoContext';
import AddressCard from '@/components/ecommerce/AddressCard';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { pageTransition } from '@/animations/variants';
import toast from 'react-hot-toast';

const STEPS = [
  { id: 'address', label: 'Address', icon: MapPin },
  { id: 'shipping', label: 'Shipping', icon: Truck },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'confirm', label: 'Confirm', icon: Check },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { currency, formatPrice } = useGeo();
  const [step, setStep] = useState(0);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [shippingCost, setShippingCost] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ full_name: '', phone: '', address_line1: '', city: '', state: '', country: '', postal_code: '' });
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    document.title = 'Checkout — 1SkyStore';
    loadAddresses();
  }, []);

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
    try {
      setLoading(true);
      await addressService.createAddress(newAddress);
      await loadAddresses();
      setShowAddForm(false);
      setNewAddress({ full_name: '', phone: '', address_line1: '', city: '', state: '', country: '', postal_code: '' });
      toast.success('Address added');
    } catch (err) {
      toast.error(err.message || 'Failed to add address');
    } finally {
      setLoading(false);
    }
  }

  async function handlePlaceOrder() {
    try {
      setLoading(true);
      const paymentProvider = currency === 'INR' ? 'razorpay' : 'stripe';
      const res = await orderService.placeOrder({
        address_id: selectedAddress.id,
        payment_provider: paymentProvider,
      });
      const data = res.data?.data || res.data;
      const oid = data?.order?.id || data?.id;
      setOrderId(oid);

      // Process payment
      if (paymentProvider === 'razorpay') {
        await handleRazorpay(oid, data);
      } else {
        await handleStripe(oid, data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to place order');
      setLoading(false);
    }
  }

  async function handleRazorpay(oid, orderData) {
    try {
      const rpRes = await paymentService.razorpayCreateOrder({
        order_id: oid,
        amount: (subtotal + shippingCost) * 100,
        currency: 'INR',
      });
      const rpData = rpRes.data?.data || rpRes.data;

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: rpData.amount,
          currency: 'INR',
          name: '1SkyStore',
          order_id: rpData.razorpay_order_id || rpData.id,
          handler: async (response) => {
            try {
              await paymentService.razorpayVerify(response);
              toast.success('Payment successful!');
              clearCart();
              navigate(`/orders/${oid}`);
            } catch {
              toast.error('Payment verification failed');
            }
          },
          modal: { ondismiss: () => { setLoading(false); toast.error('Payment cancelled'); } },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      };
      document.body.appendChild(script);
    } catch (err) {
      toast.error('Payment initiation failed');
      setLoading(false);
    }
  }

  async function handleStripe(oid) {
    try {
      const stripeRes = await paymentService.stripeCreateIntent({
        order_id: oid,
        amount: subtotal + shippingCost,
        currency: 'USD',
      });
      const stripeData = stripeRes.data?.data || stripeRes.data;
      toast.success('Order placed! Payment intent created.');
      clearCart();
      navigate(`/orders/${oid}`);
    } catch (err) {
      toast.error('Stripe payment failed');
    } finally {
      setLoading(false);
    }
  }

  const total = subtotal + shippingCost;

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
                <Input label="Full Name" value={newAddress.full_name} onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })} />
                <Input label="Phone" value={newAddress.phone} onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} />
                <Input label="Address" className="sm:col-span-2" value={newAddress.address_line1} onChange={(e) => setNewAddress({ ...newAddress, address_line1: e.target.value })} />
                <Input label="City" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} />
                <Input label="State" value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} />
                <Input label="Country" value={newAddress.country} onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })} />
                <Input label="Postal Code" value={newAddress.postal_code} onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })} />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleAddAddress} loading={loading}>Save Address</Button>
                <Button variant="ghost" onClick={() => setShowAddForm(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setShowAddForm(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Add New Address
            </Button>
          )}
          <div className="mt-6">
            <Button onClick={() => { if (!selectedAddress) { toast.error('Select an address'); return; } setStep(1); }} size="lg">
              Continue to Shipping
            </Button>
          </div>
        </div>
      )}

      {/* Step 1: Shipping */}
      {step === 1 && (
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Shipping</h2>
          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 mb-6">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-primary-500" />
              <div>
                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100">Standard Shipping</p>
                <p className="text-xs text-neutral-400">Estimated 5-7 business days</p>
              </div>
              <span className="ml-auto text-sm font-semibold text-neutral-900 dark:text-white">
                {shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setStep(0)}>Back</Button>
            <Button onClick={() => setStep(2)} size="lg">Continue to Payment</Button>
          </div>
        </div>
      )}

      {/* Step 2: Payment */}
      {step === 2 && (
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Payment Method</h2>
          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-primary-200 dark:border-primary-800 mb-6">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-primary-500" />
              <div>
                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                  {currency === 'INR' ? 'Razorpay' : 'Stripe'}
                </p>
                <p className="text-xs text-neutral-400">
                  {currency === 'INR' ? 'UPI, Cards, Net Banking' : 'Credit/Debit Card'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={() => setStep(3)} size="lg">Review Order</Button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Order Review</h2>
          <div className="space-y-4 mb-6">
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
              <p className="text-sm text-neutral-500 mb-2">Delivering to</p>
              <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100">{selectedAddress?.full_name}</p>
              <p className="text-xs text-neutral-400">{selectedAddress?.address_line1}, {selectedAddress?.city}</p>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Subtotal ({items.length} items)</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Shipping</span>
                <span>{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <span className="font-semibold text-neutral-900 dark:text-white">Total</span>
                <span className="text-xl font-bold text-neutral-900 dark:text-white">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
            <Button onClick={handlePlaceOrder} loading={loading} size="lg" className="gap-2">
              {loading ? 'Processing...' : 'Place Order'} {!loading && <Check className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
