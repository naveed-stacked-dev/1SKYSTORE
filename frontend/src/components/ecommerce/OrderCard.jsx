import { Link } from 'react-router-dom';
import { Package, ArrowUpRight } from 'lucide-react';
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
      className="group flex flex-col gap-5 rounded-[1.75rem] bg-surface p-5 ring-1 ring-line transition-shadow duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:ring-ink/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:flex-row sm:items-center sm:gap-6 sm:p-6"
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-mist text-ink-soft transition-colors duration-500 group-hover:bg-accent-soft group-hover:text-accent">
          <Package className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="font-display text-lg font-medium tracking-[-0.02em] text-ink">
            Order #{order.id}
          </p>
          <p className="mt-0.5 text-sm tabular-nums text-ink-faint">
            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-line pt-4 sm:contents">
        <Badge variant={statusVariants[statusKey] || 'default'} className="capitalize sm:order-none">
          {badgeLabel}
        </Badge>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="text-right">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-ink-faint">Total</p>
            <p className="mt-0.5 font-display text-lg font-medium tabular-nums text-ink">
              {formatPrice(order.total_amount || order.total || 0, order.currency)}
            </p>
          </div>
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full text-ink ring-1 ring-inset ring-line transition-colors duration-500 group-hover:bg-ink group-hover:text-canvas"
            aria-hidden="true"
          >
            <ArrowUpRight className="h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
