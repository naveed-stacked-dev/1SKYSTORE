import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, MapPin, CreditCard, Truck } from 'lucide-react';
import orderService from '@/api/order.service';
import shippingService from '@/api/shipping.service';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { pageTransition } from '@/animations/variants';
import { formatPrice } from '@/utils/formatPrice';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = `Order #${id} — 1SkyStore`;
    loadOrder();
  }, [id]);

  async function loadOrder() {
    try {
      const res = await orderService.getOrderDetail(id);
      const data = res.data?.data || res.data;
      setOrder(data);

      if (data?.shipment?.id) {
        try {
          const trackRes = await shippingService.trackShipment(
            data.shipment.id,
          );
          setTracking(trackRes.data?.data || trackRes.data);
        } catch {}
      }
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-12 space-y-4"><Skeleton variant="card" className="h-64" /></div>;
  }

  if (!order) {
    return <div className="min-h-[60vh] flex items-center justify-center"><p className="text-neutral-500">Order not found</p></div>;
  }

  const statusColor = {
    pending: 'warning', processing: 'info', shipped: 'primary', delivered: 'success', cancelled: 'error'
  };
  const shipment = tracking?.shipment || order.shipment;
  const liveTracking = tracking?.tracking || null;
  const orderStatus = order.status || order.order_status;
  const shipmentStatus = shipment?.status?.replace(/_/g, ' ');
  const trackingUrl = shipment?.tracking_url || liveTracking?.track_url || null;
  const estimatedDelivery = shipment?.estimated_delivery || liveTracking?.etd || null;

  const formatEstimatedDelivery = (value) => {
    if (!value) return null;

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(parsedDate);
  };

  const formattedEstimatedDelivery = formatEstimatedDelivery(estimatedDelivery);

  return (
    <motion.div {...pageTransition} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Link to="/orders" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-primary-500 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-heading font-bold text-neutral-900 dark:text-white">Order #{order.id}</h1>
          <p className="text-sm text-neutral-400 mt-1">
            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
          </p>
        </div>
        <Badge variant={statusColor[orderStatus?.toLowerCase()] || 'default'}>
          {orderStatus}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Items */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2 mb-4">
            <Package className="w-4 h-4 text-primary-500" /> Items
          </h3>
          <div className="space-y-3">
            {(order.items || []).map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-neutral-100 dark:bg-neutral-800 overflow-hidden shrink-0">
                  {item.product?.images?.[0]?.image_url && (
                    <img src={item.product.images[0].image_url} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100 truncate">{item.product_name}</p>
                  <p className="text-xs text-neutral-400">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold">{formatPrice(item.unit_price || item.price, order.currency)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Address + Payment */}
        <div className="space-y-4">
          {order.address && (
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-primary-500" /> Delivery Address
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                <span className="font-medium text-neutral-800 dark:text-neutral-200">{order.address.full_name}</span><br />
                {order.address.address_line1}<br />
                {order.address.address_line2 && <>{order.address.address_line2}<br /></>}
                {order.address.landmark && <><span className="text-xs text-neutral-400">Landmark: {order.address.landmark}</span><br /></>}
                {order.address.city}, {order.address.state} {order.address.postal_code}
              </p>
            </div>
          )}

          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-primary-500" /> Payment
            </h3>
            <div className="space-y-2 text-sm">
              {order.payments && order.payments.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">Method</span>
                  <span className="capitalize">{order.payments[0].provider || 'Razorpay'}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-neutral-500">Status</span>
                <span className={`capitalize ${order.payment_status === 'paid' ? 'text-green-500 font-medium' : 'text-amber-500 font-medium'}`}>
                  {order.payment_status || 'pending'}
                </span>
              </div>
              <div className="my-3 border-t border-neutral-100 dark:border-neutral-800" />
              <div className="flex justify-between text-neutral-500">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal, order.currency)}</span>
              </div>
              {parseFloat(order.shipping_charge) > 0 && (
                <div className="flex justify-between text-neutral-500">
                  <span>Shipping</span>
                  <span>{formatPrice(order.shipping_charge, order.currency)}</span>
                </div>
              )}
              {parseFloat(order.discount) > 0 && (
                <div className="flex justify-between text-primary-500 font-medium">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discount, order.currency)}</span>
                </div>
              )}
              {parseFloat(order.tax) > 0 && (
                <div className="flex justify-between text-neutral-500">
                  <span>Tax</span>
                  <span>{formatPrice(order.tax, order.currency)}</span>
                </div>
              )}
              <div className="flex justify-between pt-3 mt-2 border-t border-neutral-100 dark:border-neutral-800 text-base font-semibold text-neutral-900 dark:text-white">
                <span>Total</span>
                <span className="text-primary-500">{formatPrice(order.total_amount, order.currency)}</span>
              </div>
            </div>
          </div>

          {shipment && (
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2 mb-3">
                <Truck className="w-4 h-4 text-primary-500" /> Shipment Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-neutral-500">Shipment Status</span>
                  <span className="capitalize font-medium text-neutral-800 dark:text-neutral-100">
                    {shipmentStatus || 'Pending'}
                  </span>
                </div>
                {formattedEstimatedDelivery && (
                  <div className="flex justify-between gap-4">
                    <span className="text-neutral-500">Expected Delivery</span>
                    <span className="text-right text-neutral-800 dark:text-neutral-100">
                      {formattedEstimatedDelivery}
                    </span>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <span className="text-neutral-500">Courier</span>
                  <span className="text-right text-neutral-800 dark:text-neutral-100">
                    {shipment.courier_name || liveTracking?.courier_name || 'Will be assigned soon'}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-neutral-500">AWB / Tracking No.</span>
                  <span className="text-right text-neutral-800 dark:text-neutral-100">
                    {shipment.awb_code || liveTracking?.awb_code || 'Not generated yet'}
                  </span>
                </div>
                {liveTracking?.current_status && (
                  <div className="flex justify-between gap-4">
                    <span className="text-neutral-500">Latest Update</span>
                    <span className="text-right text-neutral-800 dark:text-neutral-100">{liveTracking.current_status}</span>
                  </div>
                )}
                {trackingUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(trackingUrl, '_blank', 'noopener,noreferrer')}
                    className="mt-2 w-fit"
                  >
                    Track Order
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
