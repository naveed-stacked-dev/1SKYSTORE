import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import orderService from '@/api/order.service';
import OrderCard from '@/components/ecommerce/OrderCard';
import { Skeleton } from '@/components/ui/Skeleton';
import Pagination from '@/components/ui/Pagination';
import { pageTransition, staggerContainer, staggerItem } from '@/animations/variants';

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
      setOrders(Array.isArray(data) ? data : data?.orders || data?.rows || []);
      setTotalPages(res.data?.pagination?.totalPages || data?.totalPages || data?.total_pages || Math.ceil((data?.count || 0) / 10) || 1);
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-4">
        {[...Array(3)].map((_, i) => <Skeleton key={i} variant="card" className="h-28" />)}
      </div>
    );
  }

  return (
    <motion.div {...pageTransition} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-heading font-bold text-neutral-900 dark:text-white mb-8">My Orders</h1>
      {orders.length === 0 ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
            <Package className="w-7 h-7 text-neutral-400" />
          </div>
          <p className="text-neutral-500">No orders yet</p>
        </div>
      ) : (
        <>
          <motion.div className="space-y-4" variants={staggerContainer} initial="initial" animate="animate">
            {orders.map((order) => (
              <motion.div key={order.id} variants={staggerItem}>
                <OrderCard order={order} />
              </motion.div>
            ))}
          </motion.div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </motion.div>
  );
}
