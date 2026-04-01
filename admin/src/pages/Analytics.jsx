import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { pageTransition, staggerContainer } from '@/animations/variants';
import LineChartCard from '@/components/charts/LineChartCard';
import BarChartCard from '@/components/charts/BarChartCard';
import PieChartCard from '@/components/charts/PieChartCard';
import StatsCard from '@/components/charts/StatsCard';
import analyticsService from '@/api/analytics.service';
import { formatINR, formatCompact } from '@/utils/formatters';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { DollarSign, ShoppingCart, Users, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [sales, setSales] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [dashRes, salesRes, revRes, topRes, usersRes] = await Promise.allSettled([
          analyticsService.getDashboard(),
          analyticsService.getSales(),
          analyticsService.getRevenue(),
          analyticsService.getTopProducts(),
          analyticsService.getUserGrowth(),
        ]);

        if (dashRes.status === 'fulfilled') setDashboard(dashRes.value.data?.data || dashRes.value.data);
        if (salesRes.status === 'fulfilled') {
          const d = salesRes.value.data?.data || salesRes.value.data || [];
          setSales(Array.isArray(d) ? d : []);
        }
        if (revRes.status === 'fulfilled') {
          const d = revRes.value.data?.data || revRes.value.data || [];
          setRevenue(Array.isArray(d) ? d : []);
        }
        if (topRes.status === 'fulfilled') {
          const d = topRes.value.data?.data || topRes.value.data || [];
          setTopProducts(Array.isArray(d) ? d : []);
        }
        if (usersRes.status === 'fulfilled') {
          const d = usersRes.value.data?.data || usersRes.value.data || [];
          setUserGrowth(Array.isArray(d) ? d : []);
        }
      } catch {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Transform API data for chart consumption
  const salesData = sales.length > 0
    ? sales.map((s) => ({ name: s.name || s.month || s.period, orders: s.orders || s.count || s.value || 0, revenue: s.revenue || s.total || 0 }))
    : [];

  const revenueData = revenue.length > 0
    ? revenue.map((r) => ({ name: r.name || r.month || r.period, inr: r.inr || r.total_inr || 0, usd: r.usd || r.total_usd || 0 }))
    : [];

  const topProductsData = topProducts.length > 0
    ? topProducts.slice(0, 6).map((p) => ({ name: p.name || p.product_name || 'Unknown', value: p.sales || p.total_sold || p.count || 0 }))
    : [];

  const userGrowthData = userGrowth.length > 0
    ? userGrowth.map((u) => ({ name: u.name || u.month || u.period, users: u.users || u.count || u.new_users || 0 }))
    : [];

  const hasNoData = !loading && salesData.length === 0 && revenueData.length === 0 && topProductsData.length === 0 && userGrowthData.length === 0;

  return (
    <motion.div {...pageTransition}>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-neutral-900 dark:text-neutral-50">Analytics</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">In-depth performance metrics and insights</p>
      </div>

      {/* Stats */}
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6" variants={staggerContainer} initial="initial" animate="animate">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatsCard title="Total Revenue" value={formatINR(dashboard?.totalRevenue || dashboard?.total_revenue || 0)} change={dashboard?.revenueGrowth || 0} icon={DollarSign} color="primary" />
            <StatsCard title="Total Orders" value={formatCompact(dashboard?.totalOrders || dashboard?.total_orders || 0)} change={dashboard?.orderGrowth || 0} icon={ShoppingCart} color="success" />
            <StatsCard title="Total Users" value={formatCompact(dashboard?.totalUsers || dashboard?.total_users || 0)} change={dashboard?.userGrowth || 0} icon={Users} color="info" />
            <StatsCard title="Avg. Order Value" value={formatINR(dashboard?.avgOrderValue || dashboard?.avg_order_value || 0)} change={dashboard?.aovGrowth || 0} icon={TrendingUp} color="warning" />
          </>
        )}
      </motion.div>

      {hasNoData && (
        <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800">
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">No analytics data available yet. Data will appear as orders and users are created.</p>
        </div>
      )}

      {/* Charts */}
      {!hasNoData && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
            {salesData.length > 0 && (
              <LineChartCard
                title="Sales Trend"
                data={salesData}
                lines={[
                  { dataKey: 'orders', stroke: '#1C4D8D', name: 'Orders' },
                  { dataKey: 'revenue', stroke: '#2CB2DD', name: 'Revenue' },
                ]}
                height={320}
              />
            )}
            {revenueData.length > 0 && (
              <BarChartCard
                title="Revenue by Currency"
                data={revenueData}
                bars={[
                  { dataKey: 'inr', fill: '#1C4D8D', name: 'INR (₹)' },
                  { dataKey: 'usd', fill: '#10B981', name: 'USD ($)' },
                ]}
                height={320}
              />
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {topProductsData.length > 0 && (
              <PieChartCard title="Top Products by Sales" data={topProductsData} height={320} />
            )}
            {userGrowthData.length > 0 && (
              <LineChartCard
                title="User Growth"
                data={userGrowthData}
                lines={[{ dataKey: 'users', stroke: '#8B5CF6', name: 'New Users' }]}
                height={320}
              />
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}
