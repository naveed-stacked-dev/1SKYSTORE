import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, MapPin, CreditCard, Truck } from 'lucide-react';
import orderService from '@/api/order.service';
import shippingService from '@/api/shipping.service';
import { useGeo } from '@/context/GeoContext';
import Badge from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { pageTransition } from '@/animations/variants';

export default function OrderDetail() {
  const { id } = useParams();
  const { formatPrice } = useGeo();
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

      if (data?.shipment_id) {
        try {
          const trackRes = await shippingService.trackShipment(data.shipment_id);
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
        <Badge variant={statusColor[order.status?.toLowerCase()] || 'default'}>
          {order.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Items */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2 mb-4">
            <Package className="w-4 h-4 text-primary-500" /> Items
          </h3>
          <div className="space-y-3">
            {(order.items || order.OrderItems || []).map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                  {(item.image || item.Product?.images?.[0]) && (
                    <img src={item.image || item.Product?.images?.[0]} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-neutral-800 dark:text-neutral-100">{item.name || item.Product?.name}</p>
                  <p className="text-xs text-neutral-400">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-medium">{formatPrice(item.price || item.unit_price)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Address + Payment */}
        <div className="space-y-4">
          {order.Address && (
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-primary-500" /> Delivery Address
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {order.Address.full_name}<br />
                {order.Address.address_line1}<br />
                {order.Address.city}, {order.Address.state} {order.Address.postal_code}
              </p>
            </div>
          )}

          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-primary-500" /> Payment
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Method</span>
                <span className="capitalize">{order.payment_provider}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Status</span>
                <span className="capitalize">{order.payment_status || 'pending'}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800 font-semibold">
                <span>Total</span>
                <span>{formatPrice(order.total_amount || order.total)}</span>
              </div>
            </div>
          </div>

          {tracking && (
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2 mb-3">
                <Truck className="w-4 h-4 text-primary-500" /> Tracking
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {tracking.tracking_number || tracking.awb_number || 'Tracking info will be available soon'}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
