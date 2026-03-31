import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { useGeo } from '@/context/GeoContext';

const statusVariants = {
  pending: 'warning',
  processing: 'info',
  shipped: 'primary',
  delivered: 'success',
  cancelled: 'error',
  refunded: 'default',
};

export default function OrderCard({ order }) {
  const { formatPrice } = useGeo();
  const status = order.status?.toLowerCase() || 'pending';

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
        <Badge variant={statusVariants[status] || 'default'}>
          {order.status || 'Pending'}
        </Badge>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
        <div>
          <p className="text-xs text-neutral-400">Total</p>
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
            {formatPrice(order.total_amount || order.total || 0)}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-primary-500 transition-colors" />
      </div>
    </Link>
  );
}
