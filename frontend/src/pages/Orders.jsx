import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import orderService from '@/api/order.service';
import OrderCard from '@/components/ecommerce/OrderCard';
import shippingService from '@/api/shipping.service';
import { Skeleton } from '@/components/ui/Skeleton';
import Pagination from '@/components/ui/Pagination';
import PageHeader from '@/components/common/PageHeader';
import StatusMessage from '@/components/home/ui/StatusMessage';
import { CONTAINER } from '@/components/home/ui/styles';
import { pageTransition, staggerContainer, staggerItem } from '@/animations/variants';

const MotionDiv = motion.div;

export default function Orders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    document.title = 'Orders — 1SkyStore';
    loadOrders();
  }, [page]);

  async function loadOrders() {
    try {
      setLoading(true);
      const res = await orderService.getOrders({ page, pageSize: 10 });
      const data = res.data?.data || res.data;
      const orderList = Array.isArray(data) ? data : data?.orders || data?.rows || [];
      setTotalPages(res.data?.pagination?.totalPages || data?.totalPages || data?.total_pages || Math.ceil((data?.count || 0) / 10) || 1);

      const ordersWithTracking = await Promise.all(
        orderList.map(async (order) => {
          if (!order?.shipment?.id) {
            return order;
          }

          try {
            const trackRes = await shippingService.trackShipment(order.shipment.id);
            const trackingData = trackRes.data?.data || trackRes.data;

            return {
              ...order,
              shipment: trackingData?.shipment || order.shipment,
              liveTracking: trackingData?.tracking || null,
            };
          } catch {
            return order;
          }
        })
      );

      setOrders(ordersWithTracking);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  function handlePageChange(newPage) {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(newPage));
    setSearchParams(newParams);
  }

  if (loading) {
    return (
      <div className="pb-20 sm:pb-28">
        <PageHeader eyebrow="Account" title="My Orders" size="sm" />
        <div className={`${CONTAINER} space-y-4`} aria-label="Loading orders">
          {[...Array(3)].map((_, i) => <Skeleton key={i} variant="card" className="h-32 rounded-[1.75rem]" />)}
        </div>
      </div>
    );
  }

  return (
    <MotionDiv {...pageTransition} className="pb-20 sm:pb-28">
      <PageHeader eyebrow="Account" title="My Orders" size="sm" />
      <div className={CONTAINER}>
        {orders.length === 0 ? (
          <StatusMessage
            title="No orders yet"
            text="When you place an order, it will appear here."
            action={{ to: '/shop', label: 'Start shopping' }}
          />
        ) : (
          <>
            <MotionDiv className="space-y-4" variants={staggerContainer} initial="initial" animate="animate">
              {orders.map((order) => (
                <MotionDiv key={order.id} variants={staggerItem}>
                  <OrderCard order={order} />
                </MotionDiv>
              ))}
            </MotionDiv>

            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </MotionDiv>
  );
}
