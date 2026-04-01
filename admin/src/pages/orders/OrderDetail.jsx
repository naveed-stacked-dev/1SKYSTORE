import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pageTransition } from '@/animations/variants';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Select from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import orderService from '@/api/order.service';
import { formatINR, formatDate } from '@/utils/formatters';
import { ORDER_STATUSES } from '@/constants/navigation';
import { ArrowLeft, Package, User, CreditCard, MapPin } from 'lucide-react';
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
          <Badge variant={statusVariant(order.status)} className="text-sm px-3 py-1">
            {order.status}
          </Badge>
          <Select
            value={order.status}
            onChange={(e) => handleStatusUpdate(e.target.value)}
            options={ORDER_STATUSES.map((s) => ({ label: s.charAt(0).toUpperCase() + s.slice(1), value: s }))}
            className="!py-1.5 min-w-[140px]"
          />
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
                {item.product?.images?.[0] || item.image ? (
                  <img src={item.product?.images?.[0] || item.image} alt="" className="w-12 h-12 rounded-lg object-cover bg-neutral-100 dark:bg-neutral-800" />
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
                  {formatINR(item.price || item.price_inr)}
                </p>
              </div>
            ))}
          </div>
          <div className="px-5 py-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-500">Total</span>
            <span className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
              {formatINR(order.total || order.total_amount)}
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
                {order.user?.first_name || order.customer_name || '—'} {order.user?.last_name || ''}
              </p>
              <p className="text-neutral-500">{order.user?.email || order.customer_email}</p>
              <p className="text-neutral-500">{order.user?.phone || order.customer_phone}</p>
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
                  {order.payment_provider || order.paymentProvider || '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Status</span>
                <Badge variant={order.payment_status === 'paid' ? 'success' : 'warning'}>
                  {order.payment_status || order.paymentStatus || 'pending'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Shipping */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-neutral-400" />
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 font-heading">Shipping</h3>
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-300 space-y-1">
              <p>{order.address?.full_name || order.shipping_address?.full_name}</p>
              <p>{order.address?.address_line1 || order.shipping_address?.address_line1}</p>
              <p>
                {order.address?.city || order.shipping_address?.city}, {order.address?.state || order.shipping_address?.state}
              </p>
              <p>{order.address?.postal_code || order.shipping_address?.postal_code}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
