import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pageTransition } from '@/animations/variants';
import DataTable from '@/components/tables/DataTable';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import orderService from '@/api/order.service';
import { formatINR, formatDate } from '@/utils/formatters';
import { ORDER_STATUSES } from '@/constants/navigation';
import { Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrderList() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, pageSize: 10 };
      if (statusFilter) params.status = statusFilter;
      const res = await orderService.getAll(params);
      const data = res.data?.data || res.data;
      setOrders(Array.isArray(data) ? data : data?.orders || data?.rows || []);
      setTotalPages(res.data?.pagination?.totalPages || data?.totalPages || data?.total_pages || 1);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await orderService.updateStatus(id, status);
      toast.success('Order status updated');
      fetchOrders();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const statusVariant = (s) => {
    const map = { pending: 'warning', processing: 'info', shipped: 'primary', delivered: 'success', cancelled: 'error' };
    return map[s?.toLowerCase()] || 'default';
  };

  const columns = [
    {
      key: 'id',
      label: 'Order ID',
      sortable: true,
      render: (val) => <span className="font-medium text-neutral-800 dark:text-neutral-200">#{val}</span>,
    },
    {
      key: 'user',
      label: 'Customer',
      render: (val, row) => (
        <div>
          <p className="font-medium text-neutral-800 dark:text-neutral-200">
            {val?.first_name || row.customer_name || '—'} {val?.last_name || ''}
          </p>
          <p className="text-xs text-neutral-400">{val?.email || row.customer_email || ''}</p>
        </div>
      ),
    },
    {
      key: 'total',
      label: 'Amount',
      sortable: true,
      render: (val, row) => (
        <span className="font-semibold text-neutral-800 dark:text-neutral-200">
          {formatINR(val || row.total_amount)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val, row) => (
        <Select
          value={val}
          onChange={(e) => handleStatusUpdate(row.id, e.target.value)}
          options={ORDER_STATUSES.map((s) => ({ label: s.charAt(0).toUpperCase() + s.slice(1), value: s }))}
          className="!py-1.5 !text-xs !rounded-lg min-w-[120px]"
        />
      ),
    },
    {
      key: 'created_at',
      label: 'Date',
      sortable: true,
      render: (val, row) => <span className="text-neutral-500">{formatDate(val || row.createdAt)}</span>,
    },
    {
      key: 'actions',
      label: '',
      width: '60px',
      render: (_, row) => (
        <button
          onClick={() => navigate(`/admin/orders/${row.id}`)}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <motion.div {...pageTransition}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-neutral-900 dark:text-neutral-50">Orders</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Track and manage customer orders</p>
        </div>
        <div className="w-44">
          <Select
            placeholder="All Statuses"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            options={ORDER_STATUSES.map((s) => ({ label: s.charAt(0).toUpperCase() + s.slice(1), value: s }))}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyMessage="No orders found"
      />
    </motion.div>
  );
}
