import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, MapPin, CreditCard, Truck } from 'lucide-react';
import orderService from '@/api/order.service';
import shippingService from '@/api/shipping.service';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import PageHeader from '@/components/common/PageHeader';
import StatusMessage from '@/components/home/ui/StatusMessage';
import { CONTAINER } from '@/components/home/ui/styles';
import { pageTransition } from '@/animations/variants';
import { formatPrice } from '@/utils/formatPrice';
import { cn } from '@/utils/cn';

const MotionDiv = motion.div;

const PANEL = 'rounded-[1.75rem] bg-surface p-5 ring-1 ring-line sm:p-7';

/** Small icon + display title heading each detail panel */
function PanelTitle({ id, icon, children }) {
  const Icon = icon;
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mist text-ink-soft" aria-hidden="true">
        <Icon className="h-4 w-4" />
      </span>
      <h3 id={id} className="font-display text-lg font-medium tracking-[-0.02em] text-ink">{children}</h3>
    </div>
  );
}

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
    return (
      <div className={cn(CONTAINER, 'space-y-6 py-12 sm:py-16')} aria-label="Loading order">
        <Skeleton variant="title" className="h-12 w-2/3 max-w-md" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <Skeleton variant="card" className="h-72 rounded-[1.75rem] lg:col-span-7" />
          <Skeleton variant="card" className="h-72 rounded-[1.75rem] lg:col-span-5" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={cn(CONTAINER, 'flex min-h-[60vh] items-center py-16')}>
        <StatusMessage className="w-full" title="Order not found" action={{ to: '/orders', label: 'Back to Orders' }} />
      </div>
    );
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

  // Timeline entries come only from what the order already reports
  const timeline = [
    order.createdAt && {
      label: 'Order placed',
      value: new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    },
    orderStatus && { label: 'Order status', value: orderStatus },
    shipment && shipmentStatus && { label: 'Shipment', value: shipmentStatus },
    liveTracking?.current_status && { label: 'Latest update', value: liveTracking.current_status },
  ].filter(Boolean);

  return (
    <MotionDiv {...pageTransition} className="pb-20 sm:pb-28">
      <div className={cn(CONTAINER, 'pt-6 sm:pt-8')}>
        <Link
          to="/orders"
          className="group -ml-1 inline-flex min-h-11 items-center gap-2 rounded-full px-1 text-sm font-medium text-ink-soft transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" /> Back to Orders
        </Link>
      </div>

      <PageHeader
        className="pt-4 sm:pt-6"
        size="sm"
        eyebrow={order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : undefined}
        title={`Order #${order.id}`}
      >
        <Badge variant={statusColor[orderStatus?.toLowerCase()] || 'default'} className="px-4 py-2 text-sm capitalize">
          {orderStatus}
        </Badge>
      </PageHeader>

      <div className={CONTAINER}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="space-y-6 lg:col-span-7">
            {/* Status timeline — built only from the dates and statuses the order carries */}
            {timeline.length > 0 && (
              <section className={PANEL} aria-labelledby="order-status-title">
                <PanelTitle id="order-status-title" icon={Truck}>Status</PanelTitle>
                <ol className="relative">
                  {timeline.map((entry, i) => {
                    const last = i === timeline.length - 1;
                    return (
                      <li key={entry.label} className="relative flex gap-4 pb-6 last:pb-0">
                        {!last && <span className="absolute left-[7px] top-5 h-[calc(100%-0.75rem)] w-px bg-line" aria-hidden="true" />}
                        <span
                          className={cn(
                            'relative mt-1 flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full',
                            last ? 'bg-accent' : 'bg-surface ring-1 ring-inset ring-line'
                          )}
                          aria-hidden="true"
                        >
                          {last ? (
                            <span className="h-1.5 w-1.5 rounded-full bg-canvas" />
                          ) : (
                            <span className="h-1.5 w-1.5 rounded-full bg-ink-faint" />
                          )}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-ink-faint">{entry.label}</p>
                          <p className={cn('mt-1 text-[15px] capitalize', last ? 'font-medium text-ink' : 'text-ink-soft')}>{entry.value}</p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </section>
            )}

            {/* Items */}
            <section className={PANEL} aria-labelledby="order-items-title">
              <PanelTitle id="order-items-title" icon={Package}>Items</PanelTitle>
              <div className="divide-y divide-line">
                {(order.items || []).map((item, i) => (
                  <div key={i} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-plate sm:h-20 sm:w-20">
                      {item.product?.images?.[0]?.image_url && (
                        <img src={item.product.images[0].image_url} alt="" className="absolute inset-0 h-full w-full object-contain p-2 mix-blend-multiply" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-medium text-ink">{item.product_name}</p>
                      <p className="mt-0.5 text-sm tabular-nums text-ink-faint">Qty: {item.quantity}</p>
                    </div>
                    <p className="shrink-0 text-[15px] font-medium tabular-nums text-ink">{formatPrice(item.unit_price || item.price, order.currency)}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Address + Payment */}
          <div className="space-y-6 lg:col-span-5">
            {order.address && (
              <section className={PANEL} aria-labelledby="order-address-title">
                <PanelTitle id="order-address-title" icon={MapPin}>Delivery Address</PanelTitle>
                <p className="text-[15px] leading-relaxed text-ink-soft">
                  <span className="font-medium text-ink">{order.address.full_name}</span><br />
                  {order.address.address_line1}<br />
                  {order.address.address_line2 && <>{order.address.address_line2}<br /></>}
                  {order.address.landmark && <><span className="text-sm text-ink-faint">Landmark: {order.address.landmark}</span><br /></>}
                  {order.address.city}, {order.address.state} {order.address.postal_code}
                </p>
              </section>
            )}

            <section className={PANEL} aria-labelledby="order-payment-title">
              <PanelTitle id="order-payment-title" icon={CreditCard}>Payment</PanelTitle>
              <div className="space-y-3 text-[15px]">
                {order.payments && order.payments.length > 0 && (
                  <div className="flex justify-between gap-4">
                    <span className="text-ink-soft">Method</span>
                    <span className="capitalize text-ink">{order.payments[0].provider || 'Razorpay'}</span>
                  </div>
                )}
                <div className="flex items-center justify-between gap-4">
                  <span className="text-ink-soft">Status</span>
                  <Badge variant={order.payment_status === 'paid' ? 'success' : 'warning'} className="capitalize">
                    {order.payment_status || 'pending'}
                  </Badge>
                </div>
                <div className="my-5! border-t border-line" />
                <div className="flex justify-between gap-4 text-ink-soft">
                  <span>Subtotal</span>
                  <span className="tabular-nums text-ink">{formatPrice(order.subtotal, order.currency)}</span>
                </div>
                {parseFloat(order.shipping_charge) > 0 && (
                  <div className="flex justify-between gap-4 text-ink-soft">
                    <span>Shipping</span>
                    <span className="tabular-nums text-ink">{formatPrice(order.shipping_charge, order.currency)}</span>
                  </div>
                )}
                {parseFloat(order.discount) > 0 && (
                  <div className="flex justify-between gap-4 font-medium text-accent">
                    <span>Discount</span>
                    <span className="tabular-nums">-{formatPrice(order.discount, order.currency)}</span>
                  </div>
                )}
                {parseFloat(order.tax) > 0 && (
                  <div className="flex justify-between gap-4 text-ink-soft">
                    <span>Tax</span>
                    <span className="tabular-nums text-ink">{formatPrice(order.tax, order.currency)}</span>
                  </div>
                )}
                <div className="mt-5! flex items-baseline justify-between gap-4 border-t border-line pt-5">
                  <span className="font-medium text-ink">Total</span>
                  <span className="font-display text-3xl font-medium tracking-[-0.03em] tabular-nums text-ink">{formatPrice(order.total_amount, order.currency)}</span>
                </div>
              </div>
            </section>

            {shipment && (
              <section className={PANEL} aria-labelledby="order-shipment-title">
                <PanelTitle id="order-shipment-title" icon={Truck}>Shipment Details</PanelTitle>
                <dl className="space-y-3 text-[15px]">
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink-soft">Shipment Status</dt>
                    <dd className="text-right font-medium capitalize text-ink">
                      {shipmentStatus || 'Pending'}
                    </dd>
                  </div>
                  {formattedEstimatedDelivery && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-ink-soft">Expected Delivery</dt>
                      <dd className="text-right tabular-nums text-ink">
                        {formattedEstimatedDelivery}
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink-soft">Courier</dt>
                    <dd className="text-right text-ink">
                      {shipment.courier_name || liveTracking?.courier_name || 'Will be assigned soon'}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="shrink-0 text-ink-soft">AWB / Tracking No.</dt>
                    <dd className="min-w-0 break-all text-right tabular-nums text-ink">
                      {shipment.awb_code || liveTracking?.awb_code || 'Not generated yet'}
                    </dd>
                  </div>
                  {liveTracking?.current_status && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-ink-soft">Latest Update</dt>
                      <dd className="text-right text-ink">{liveTracking.current_status}</dd>
                    </div>
                  )}
                </dl>
                {trackingUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => window.open(trackingUrl, '_blank', 'noopener,noreferrer')}
                    className="mt-6 w-full sm:w-fit"
                  >
                    Track Order
                  </Button>
                )}
              </section>
            )}
          </div>
        </div>
      </div>
    </MotionDiv>
  );
}
