import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pageTransition } from '@/animations/variants';
import DataTable from '@/components/tables/DataTable';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import orderService from '@/api/order.service';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { downloadBlobResponse, readBlobError } from '@/utils/download';
import { ORDER_STATUSES } from '@/constants/navigation';
import { Eye, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrderList() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [exporting, setExporting] = useState(false);

  // Shared by the list fetch and the export so a download matches the table
  const activeFilters = useCallback(() => {
    const params = {};
    if (statusFilter) params.order_status = statusFilter;
    return params;
  }, [statusFilter]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, pageSize: 10, ...activeFilters() };
      const res = await orderService.getAll(params);
      const data = res.data?.data || res.data;
      setOrders(Array.isArray(data) ? data : data?.orders || data?.rows || []);
      setTotalPages(res.data?.pagination?.totalPages || data?.totalPages || data?.total_pages || 1);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [page, activeFilters]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await orderService.exportAll(activeFilters());
      downloadBlobResponse(res, 'orders.xlsx');
      toast.success('Orders exported');
    } catch (err) {
      toast.error(await readBlobError(err, 'Failed to export orders'));
    } finally {
      setExporting(false);
    }
  };

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
          {formatCurrency(val || row.total_amount, row.currency)}
        </span>
      ),
    },
    {
      key: 'order_status',
      label: 'Status',
      render: (val, row) => (
        <Badge variant={statusVariant(val || row.status)}>
          {val || row.status || 'Unknown'}
        </Badge>
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
        <div className="flex items-center gap-2">
          <div className="w-44">
            <Select
              placeholder="All Statuses"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              options={ORDER_STATUSES.map((s) => ({ label: s.charAt(0).toUpperCase() + s.slice(1), value: s }))}
            />
          </div>
          <Button variant="outline" size="sm" onClick={handleExport} loading={exporting} disabled={exporting}>
            <Download className="w-4 h-4" /> Export
          </Button>
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
