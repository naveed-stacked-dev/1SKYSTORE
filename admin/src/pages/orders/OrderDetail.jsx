import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pageTransition } from '@/animations/variants';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Select from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import orderService from '@/api/order.service';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { ORDER_STATUSES } from '@/constants/navigation';
import { ArrowLeft, Package, User, CreditCard, MapPin, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await orderService.getById(id);
        setOrder(res.data?.data || res.data);
      } catch {
        toast.error('Failed to load order');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleStatusUpdate = async (status) => {
    try {
      await orderService.updateStatus(id, status);
      setOrder((prev) => ({ ...prev, status }));
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const statusVariant = (s) => {
    const map = { pending: 'warning', processing: 'info', shipped: 'primary', delivered: 'success', cancelled: 'error' };
    return map[s?.toLowerCase()] || 'default';
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Skeleton className="h-48 col-span-2" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <p className="text-neutral-500 mb-4">Order not found</p>
        <Button variant="outline" onClick={() => navigate('/admin/orders')}>
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <motion.div {...pageTransition}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/orders')}
            className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-500" />
          </button>
          <div>
            <h1 className="text-2xl font-heading font-bold text-neutral-900 dark:text-neutral-50">
              Order #{order.id}
            </h1>
            <p className="text-sm text-neutral-500 mt-1">{formatDate(order.created_at || order.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={statusVariant(order.status || order.order_status)} className="text-sm px-3 py-1">
            {order.status || order.order_status || 'Unknown'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Items */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-2">
            <Package className="w-4 h-4 text-neutral-400" />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 font-heading">Order Items</h3>
          </div>
          <div className="divide-y divide-neutral-50 dark:divide-neutral-800/50">
            {(order.items || order.OrderItems || []).map((item, i) => (
              <div key={i} className="px-5 py-4 flex items-center gap-4">
                {item.product?.images?.[0]?.image_url || item.product?.images?.[0] || item.image ? (
                  <img src={item.product?.images?.[0]?.image_url || item.product?.images?.[0] || item.image} alt="" className="w-12 h-12 rounded-lg object-cover bg-neutral-100 dark:bg-neutral-800" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-neutral-100 dark:bg-neutral-800" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    {item.product?.name || item.product_name || item.name}
                  </p>
                  <p className="text-xs text-neutral-400">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                  {formatCurrency(item.unit_price || item.price || item.price_inr, order.currency)}
                </p>
              </div>
            ))}
          </div>
          <div className="px-5 py-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-500">Total</span>
            <span className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
              {formatCurrency(order.total || order.total_amount, order.currency)}
            </span>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-5">
          {/* Customer Info */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-neutral-400" />
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 font-heading">Customer</h3>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-neutral-800 dark:text-neutral-200 font-medium">
                {order.user?.first_name || order.address?.full_name || order.customer_name || '—'} {order.user?.last_name || ''}
              </p>
              <p className="text-neutral-500">{order.user?.email || order.customer_email}</p>
              <p className="text-neutral-500">{order.address?.phone || order.user?.phone || order.customer_phone || '—'}</p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-4 h-4 text-neutral-400" />
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 font-heading">Payment</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Provider</span>
                <span className="text-neutral-800 dark:text-neutral-200 font-medium capitalize">
                  {order.payments?.[0]?.provider || order.payment_provider || order.paymentProvider || 'Razorpay'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Status</span>
                <Badge variant={order.payment_status === 'paid' ? 'success' : 'warning'}>
                  {order.payment_status || order.paymentStatus || 'pending'}
                </Badge>
              </div>
              <div className="my-3 border-t border-neutral-100 dark:border-neutral-800" />
              <div className="flex justify-between text-neutral-500">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal, order.currency)}</span>
              </div>
              {parseFloat(order.shipping_charge) > 0 && (
                <div className="flex justify-between text-neutral-500">
                  <span>Shipping</span>
                  <span>{formatCurrency(order.shipping_charge, order.currency)}</span>
                </div>
              )}
              {parseFloat(order.discount) > 0 && (
                <div className="flex justify-between text-primary-500 font-medium">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discount, order.currency)}</span>
                </div>
              )}
              {parseFloat(order.tax) > 0 && (
                <div className="flex justify-between text-neutral-500">
                  <span>Tax</span>
                  <span>{formatCurrency(order.tax, order.currency)}</span>
                </div>
              )}
              <div className="flex justify-between pt-3 mt-2 border-t border-neutral-100 dark:border-neutral-800 text-base font-semibold text-neutral-900 dark:text-white">
                <span>Total</span>
                <span className="text-primary-500">{formatCurrency(order.total_amount || order.total, order.currency)}</span>
              </div>
            </div>
          </div>

          {/* Shipping */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-neutral-400" />
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 font-heading">Shipping</h3>
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-300">
              <span className="font-medium text-neutral-800 dark:text-neutral-200">{order.address?.full_name || order.shipping_address?.full_name}</span><br />
              {order.address?.address_line1 || order.shipping_address?.address_line1}<br />
              {order.address?.address_line2 && <>{order.address.address_line2}<br /></>}
              {order.address?.landmark && <><span className="text-xs text-neutral-400">Landmark: {order.address.landmark}</span><br /></>}
              {order.address?.city || order.shipping_address?.city}, {order.address?.state || order.shipping_address?.state} {order.address?.postal_code || order.shipping_address?.postal_code}
            </div>
          </div>

          {/* Shipment Details */}
          {order.shipment && (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="w-4 h-4 text-neutral-400" />
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 font-heading">Shipment Details</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-neutral-500">Shipment Status</span>
                  <span className="capitalize font-medium text-neutral-800 dark:text-neutral-100">
                    {order.shipment.status || 'Pending'}
                  </span>
                </div>
                {order.shipment.estimated_delivery && (
                  <div className="flex justify-between gap-4">
                    <span className="text-neutral-500">Expected Delivery</span>
                    <span className="text-right text-neutral-800 dark:text-neutral-100">
                      {formatDate(order.shipment.estimated_delivery)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <span className="text-neutral-500">Courier</span>
                  <span className="text-right text-neutral-800 dark:text-neutral-100">
                    {order.shipment.courier_name || 'Will be assigned soon'}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-neutral-500">AWB / Tracking No.</span>
                  <span className="text-right text-neutral-800 dark:text-neutral-100">
                    {order.shipment.awb_code || 'Not generated yet'}
                  </span>
                </div>
                {order.shipment.tracking_url && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(order.shipment.tracking_url, '_blank', 'noopener,noreferrer')}
                    className="mt-4 w-full"
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
