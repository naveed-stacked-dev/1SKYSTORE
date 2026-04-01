import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '@/animations/variants';
import DataTable from '@/components/tables/DataTable';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Drawer from '@/components/ui/Drawer';
import customerService from '@/api/customer.service';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate, formatINR } from '@/utils/formatters';
import { Search, Eye, Mail, Phone, ShoppingBag, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const debouncedSearch = useDebounce(search);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, pageSize: 10 };
      if (debouncedSearch) params.search = debouncedSearch;
      const res = await customerService.getAll(params);
      const data = res.data?.data || res.data;
      const pagination = res.data?.pagination;
      setCustomers(Array.isArray(data) ? data : data?.users || data?.rows || []);
      setTotalPages(pagination?.totalPages || data?.totalPages || data?.total_pages || 1);
    } catch {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const viewProfile = async (customer) => {
    setSelected(customer);
    setLoadingOrders(true);
    try {
      const res = await customerService.getOrderHistory(customer.id);
      setOrders(res.data?.data || res.data || []);
    } catch {
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const columns = [
    {
      key: 'first_name',
      label: 'Customer',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-semibold">{val?.[0] || row.email?.[0]?.toUpperCase() || '?'}</span>
          </div>
          <div>
            <p className="font-medium text-neutral-800 dark:text-neutral-200">{val || ''} {row.last_name || ''}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (val) => <span className="text-neutral-600 dark:text-neutral-300 text-sm">{val || '—'}</span>,
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (val) => <span className="text-neutral-600 dark:text-neutral-300">{val || '—'}</span>,
    },
    {
      key: 'created_at',
      label: 'Joined',
      render: (val, row) => <span className="text-neutral-500">{formatDate(val || row.createdAt)}</span>,
    },
    {
      key: 'is_verified',
      label: 'Verified',
      render: (val) => (
        <Badge variant={val ? 'success' : 'warning'}>{val ? 'Verified' : 'Unverified'}</Badge>
      ),
    },
    {
      key: 'actions',
      label: '',
      width: '60px',
      render: (_, row) => (
        <button
          onClick={() => viewProfile(row)}
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
          <h1 className="text-2xl font-heading font-bold text-neutral-900 dark:text-neutral-50">Customers</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">View and manage registered users</p>
        </div>
      </div>

      <div className="mb-5 max-w-sm">
        <Input
          icon={Search}
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      <DataTable
        columns={columns}
        data={customers}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyMessage="No customers found"
      />

      {/* Customer Detail Drawer */}
      <Drawer isOpen={!!selected} onClose={() => setSelected(null)} title="Customer Profile">
        {selected && (
          <div className="space-y-5">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-xl font-bold">
                  {selected.first_name?.[0] || selected.email?.[0]?.toUpperCase()}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                {selected.first_name} {selected.last_name}
              </h3>
              <Badge variant={selected.is_verified ? 'success' : 'warning'} className="mt-1">
                {selected.is_verified ? 'Verified' : 'Unverified'}
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-neutral-400" />
                <span className="text-neutral-700 dark:text-neutral-300">{selected.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-neutral-400" />
                <span className="text-neutral-700 dark:text-neutral-300">{selected.phone || '—'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-neutral-400" />
                <span className="text-neutral-700 dark:text-neutral-300">Joined {formatDate(selected.created_at || selected.createdAt)}</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <ShoppingBag className="w-4 h-4 text-neutral-400" />
                <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">Order History</h4>
              </div>
              {loadingOrders ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="skeleton-shimmer h-12 rounded-lg" />
                  ))}
                </div>
              ) : (Array.isArray(orders) && orders.length > 0) ? (
                <div className="space-y-2">
                  {orders.map((order, i) => (
                    <div key={order.id || i} className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800">
                      <div>
                        <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">#{order.id}</p>
                        <p className="text-xs text-neutral-400">{formatDate(order.created_at || order.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{formatINR(order.total || order.total_amount)}</p>
                        <Badge variant={order.status === 'delivered' ? 'success' : 'warning'} className="text-xs">{order.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-400 text-center py-4">No orders yet</p>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </motion.div>
  );
}
