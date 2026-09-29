import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { formatPrice } from '@/utils/formatPrice';

const statusVariants = {
  pending: 'warning',
  processing: 'info',
  pickup_scheduled: 'info',
  picked_up: 'info',
  in_transit: 'primary',
  out_for_delivery: 'primary',
  shipped: 'primary',
  delivered: 'success',
  cancelled: 'error',
  returned: 'default',
  refunded: 'default',
};

export default function OrderCard({ order }) {
  const liveStatus = order.liveTracking?.current_status;
  const shipmentStatus = order.shipment?.status;
  const fallbackStatus = order.status || order.order_status || 'Pending';
  const badgeLabel = liveStatus || shipmentStatus?.replace(/_/g, ' ') || fallbackStatus;
  const statusKey = (shipmentStatus || order.status || order.order_status || 'pending').toLowerCase();

  return (
    <Link
      to={`/orders/${order.id}`}
      className="block p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 hover:shadow-card transition-shadow group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
            <Package className="w-5 h-5 text-primary-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
              Order #{order.id}
            </p>
            <p className="text-xs text-neutral-400 mt-0.5">
              {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}
            </p>
          </div>
        </div>
        <Badge variant={statusVariants[statusKey] || 'default'}>
          {badgeLabel}
        </Badge>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
        <div>
          <p className="text-xs text-neutral-400">Total</p>
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
            {formatPrice(order.total_amount || order.total || 0, order.currency)}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-primary-500 transition-colors" />
      </div>
    </Link>
  );
}
