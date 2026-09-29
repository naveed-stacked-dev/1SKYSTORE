import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem, pageTransition } from '@/animations/variants';
import StatsCard from '@/components/charts/StatsCard';
import LineChartCard from '@/components/charts/LineChartCard';
import BarChartCard from '@/components/charts/BarChartCard';
import PieChartCard from '@/components/charts/PieChartCard';
import analyticsService from '@/api/analytics.service';
import { formatUSD, formatCurrency, formatCompact, formatDate } from '@/utils/formatters';
import { SkeletonCard } from '@/components/ui/Skeleton';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { DollarSign, ShoppingCart, Users, TrendingUp, Package, Award, LayoutDashboard } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { admin } = useAuth();
  const [stats, setStats] = useState(null);
  const [sales, setSales] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topBrands, setTopBrands] = useState([]);
  const [ordersSummary, setOrdersSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const [dashRes, salesRes, revenueRes, topProdRes, topBrandRes, ordersRes] = await Promise.allSettled([
        analyticsService.getDashboard(),
        analyticsService.getSales(),
        analyticsService.getRevenue(),
        analyticsService.getTopProducts(),
        analyticsService.getTopBrands(),
        analyticsService.getOrdersSummary(),
      ]);

      if (dashRes.status === 'fulfilled') setStats(dashRes.value.data?.data || dashRes.value.data);
      if (salesRes.status === 'fulfilled') setSales(salesRes.value.data?.data || salesRes.value.data || []);
      if (revenueRes.status === 'fulfilled') setRevenue(revenueRes.value.data?.data || revenueRes.value.data || []);
      if (topProdRes.status === 'fulfilled') setTopProducts(topProdRes.value.data?.data || topProdRes.value.data || []);
      if (topBrandRes.status === 'fulfilled') setTopBrands(topBrandRes.value.data?.data || topBrandRes.value.data || []);
      if (ordersRes.status === 'fulfilled') setOrdersSummary(ordersRes.value.data?.data || ordersRes.value.data || []);
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const salesData = Array.isArray(sales) ? sales.map(s => ({ name: s.name || s.month || s.period, value: s.orders || s.count || s.value || 0 })) : [];
  const revenueData = Array.isArray(revenue) ? revenue.map(r => ({ name: r.name || r.month || r.period, inr: r.inr || r.total_inr || 0, usd: r.usd || r.total_usd || 0 })) : [];
  const recentOrders = Array.isArray(ordersSummary) ? ordersSummary.slice(0, 5) : [];
  const topProdData = Array.isArray(topProducts) ? topProducts.slice(0, 5) : [];
  const topBrandData = Array.isArray(topBrands) ? topBrands.slice(0, 5) : [];

  const statusVariant = (s) => {
    const map = { pending: 'warning', shipped: 'info', delivered: 'success', cancelled: 'error' };
    return map[s?.toLowerCase()] || 'default';
  };

  const hasNoData = !loading && salesData.length === 0 && revenueData.length === 0 && recentOrders.length === 0 && topProdData.length === 0 && topBrandData.length === 0;

  return (
    <motion.div {...pageTransition}>
      {/* Welcome banner */}
      <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 px-6 py-6 sm:px-7 text-white shadow-premium">
        <div className="bg-dots-light absolute inset-0 opacity-40" />
        <div className="absolute -right-12 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute right-28 -bottom-24 h-44 w-44 rounded-full border border-white/15" />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-white/70">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="mt-1 text-2xl font-heading font-bold">
              Dashboard
            </h1>
            <p className="text-sm text-white/80 mt-1">
              Welcome back{admin?.first_name ? `, ${admin.first_name}` : ''}! Here's what's happening with your store.
            </p>
          </div>
          <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur">
            <LayoutDashboard className="h-7 w-7" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatsCard
              title="Total Revenue"
              value={formatUSD(stats?.totalRevenue || stats?.total_revenue || 0)}
              change={stats?.revenueGrowth || 0}
              icon={DollarSign}
              color="primary"
            />
            <StatsCard
              title="Total Orders"
              value={formatCompact(stats?.totalOrders || stats?.total_orders || 0)}
              change={stats?.orderGrowth || 0}
              icon={ShoppingCart}
              color="success"
            />
            <StatsCard
              title="Total Users"
              value={formatCompact(stats?.totalUsers || stats?.total_users || 0)}
              change={stats?.userGrowth || 0}
              icon={Users}
              color="info"
            />
            <StatsCard
              title="Avg. Order Value"
              value={formatUSD(stats?.avgOrderValue || stats?.avg_order_value || 0)}
              change={stats?.aovGrowth || 0}
              icon={TrendingUp}
              color="warning"
            />
          </>
        )}
      </motion.div>

      {hasNoData && (
        <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-soft mb-6">
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">No real-time data available to show on the dashboard.</p>
        </div>
      )}

      {/* Charts Row */}
      {!hasNoData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          {salesData.length > 0 && (
            <LineChartCard
              title="Sales Trend"
              data={salesData}
              lines={[{ dataKey: 'value', stroke: '#1C4D8D', name: 'Orders' }]}
            />
          )}
          {revenueData.length > 0 && (
            <BarChartCard
              title="Revenue Split (INR vs USD)"
              data={revenueData}
              bars={[
                { dataKey: 'inr', fill: '#1C4D8D', name: 'INR (₹)' },
                { dataKey: 'usd', fill: '#2CB2DD', name: 'USD ($)' },
              ]}
            />
          )}
        </div>
      )}

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden shadow-soft">
          <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-50 font-heading">
              <span className="h-4 w-1 rounded-full bg-gradient-to-b from-primary-500 to-secondary-400" />
              Recent Orders
            </h3>
            <a href="/admin/orders" className="text-xs text-primary-600 hover:text-primary-700 font-semibold px-3 py-1.5 rounded-lg bg-primary-50 hover:bg-primary-100 dark:bg-primary-500/10 dark:text-primary-400 dark:hover:bg-primary-500/20 transition-colors">
              View all
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-800/40">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Order</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Customer</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Amount</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800/50">
                {recentOrders.length > 0 ? recentOrders.map((order, i) => (
                  <tr key={order.id || i} className="hover:bg-primary-50/40 dark:hover:bg-primary-500/5 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-neutral-800 dark:text-neutral-200">#{order.id}</td>
                    <td className="px-5 py-3 text-sm text-neutral-600 dark:text-neutral-300">{order.user?.first_name || order.customer || '—'}</td>
                    <td className="px-5 py-3 text-sm font-medium text-neutral-800 dark:text-neutral-200">{formatCurrency(order.total || order.total_amount, order.currency)}</td>
                    <td className="px-5 py-3"><Badge variant={statusVariant(order.status)} className="capitalize">{order.status}</Badge></td>
                    <td className="px-5 py-3 text-sm text-neutral-500">{formatDate(order.created_at || order.createdAt)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-sm text-neutral-400">No recent orders</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products + Top Brands */}
        <div className="space-y-5">
          {/* Top Products */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-50 font-heading">
                <span className="h-4 w-1 rounded-full bg-gradient-to-b from-primary-500 to-secondary-400" />
                Top Products
              </h3>
              <span className="p-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800"><Package className="w-4 h-4 text-neutral-400" /></span>
            </div>
            <div className="space-y-3">
              {topProdData.length > 0 ? topProdData.map((product, i) => (
                <div key={i} className="flex items-center gap-3 -mx-2 px-2 py-1 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <span className={i === 0
                    ? 'w-6 h-6 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-xs font-semibold text-white shadow-glow'
                    : 'w-6 h-6 rounded-lg bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center text-xs font-semibold text-primary-600 dark:text-primary-400'}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">
                      {product.name || product.product_name}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">
                    {product.sales || product.total_sold || 0}
                  </span>
                </div>
              )) : (
                 <p className="text-center text-sm text-neutral-400 py-4">No top products</p>
              )}
            </div>
          </div>

          {/* Top Brands */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-50 font-heading">
                <span className="h-4 w-1 rounded-full bg-gradient-to-b from-primary-500 to-secondary-400" />
                Top Brands
              </h3>
              <span className="p-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800"><Award className="w-4 h-4 text-neutral-400" /></span>
            </div>
            <div className="space-y-3">
              {topBrandData.length > 0 ? topBrandData.map((brand, i) => (
                <div key={i} className="flex items-center gap-3 -mx-2 px-2 py-1 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <span className={i === 0
                    ? 'w-6 h-6 rounded-lg bg-gradient-to-br from-secondary-400 to-secondary-600 flex items-center justify-center text-xs font-semibold text-white'
                    : 'w-6 h-6 rounded-lg bg-secondary-50 dark:bg-secondary-500/10 flex items-center justify-center text-xs font-semibold text-secondary-600 dark:text-secondary-400'}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">
                      {brand.name || brand.brand}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">
                    {formatUSD(brand.revenue || brand.total_revenue)}
                  </span>
                </div>
              )) : (
                 <p className="text-center text-sm text-neutral-400 py-4">No top brands</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
