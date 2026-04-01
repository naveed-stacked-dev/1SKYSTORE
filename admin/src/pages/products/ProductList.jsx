import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '@/animations/variants';
import DataTable from '@/components/tables/DataTable';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import Toggle from '@/components/ui/Toggle';
import Modal from '@/components/ui/Modal';
import productService from '@/api/product.service';
import { useDebounce } from '@/hooks/useDebounce';
import { formatINR, formatUSD, truncate } from '@/utils/formatters';
import { Plus, Search, Upload, Edit2, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import ProductForm from './ProductForm';
import BulkImport from './BulkImport';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [showBulk, setShowBulk] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);

  const debouncedSearch = useDebounce(search);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, pageSize: 10 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (brand) params.brand = brand;
      if (category) params.category = category;
      if (sortBy) {
        params.sortBy = sortBy;
        params.sortOrder = sortOrder;
      }
      const res = await productService.getAll(params);
      const data = res.data?.data || res.data;
      setProducts(Array.isArray(data) ? data : data?.products || data?.rows || []);
      setTotalPages(data?.totalPages || data?.total_pages || Math.ceil((data?.total || data?.count || 0) / 10) || 1);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, brand, category, sortBy, sortOrder]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [bRes, cRes] = await Promise.allSettled([
          productService.getBrands(),
          productService.getCategories(),
        ]);
        if (bRes.status === 'fulfilled') {
          const b = bRes.value.data?.data || bRes.value.data || [];
          setBrands(Array.isArray(b) ? b : []);
        }
        if (cRes.status === 'fulfilled') {
          const c = cRes.value.data?.data || cRes.value.data || [];
          setCategories(Array.isArray(c) ? c : []);
        }
      } catch { /* ignore */ }
    };
    loadFilters();
  }, []);

  const handleToggle = async (id) => {
    try {
      await productService.toggleStatus(id);
      toast.success('Status updated');
      fetchProducts();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await productService.delete(deleteModal);
      toast.success('Product deleted');
      setDeleteModal(null);
      fetchProducts();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const handleFormClose = (refresh) => {
    setShowForm(false);
    setEditProduct(null);
    if (refresh) fetchProducts();
  };

  const columns = [
    {
      key: 'name',
      label: 'Product',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          {row.images?.[0] || row.image ? (
            <img
              src={row.images?.[0] || row.image}
              alt={val}
              className="w-10 h-10 rounded-lg object-cover bg-neutral-100 dark:bg-neutral-800"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <Eye className="w-4 h-4 text-neutral-400" />
            </div>
          )}
          <div>
            <p className="font-medium text-neutral-800 dark:text-neutral-200">{truncate(val, 30)}</p>
            <p className="text-xs text-neutral-400">{row.sku}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (val) => <Badge>{val || '—'}</Badge>,
    },
    {
      key: 'brand',
      label: 'Brand',
      render: (val) => <span className="text-neutral-600 dark:text-neutral-400">{val || '—'}</span>,
    },
    {
      key: 'price_inr',
      label: 'Price',
      sortable: true,
      render: (val, row) => (
        <div>
          <p className="font-medium">{formatINR(val)}</p>
          <p className="text-xs text-neutral-400">{formatUSD(row.price_usd)}</p>
        </div>
      ),
    },
    {
      key: 'stock',
      label: 'Stock',
      sortable: true,
      render: (val) => (
        <Badge variant={val > 10 ? 'success' : val > 0 ? 'warning' : 'error'}>
          {val ?? 0}
        </Badge>
      ),
    },
    {
      key: 'is_active',
      label: 'Active',
      render: (val, row) => (
        <Toggle checked={!!val} onChange={() => handleToggle(row.id)} />
      ),
    },
    {
      key: 'actions',
      label: '',
      width: '100px',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setEditProduct(row); setShowForm(true); }}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteModal(row.id)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <motion.div {...pageTransition}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-neutral-900 dark:text-neutral-50">Products</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Manage your product catalog</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowBulk(true)}>
            <Upload className="w-4 h-4" /> Import
          </Button>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" /> Add Product
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex-1 min-w-[200px] max-w-sm">
          <Input
            icon={Search}
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="w-40">
          <Select
            placeholder="All Brands"
            value={brand}
            onChange={(e) => { setBrand(e.target.value); setPage(1); }}
            options={brands.map((b) => typeof b === 'string' ? b : { label: b.name || b.brand, value: b.name || b.brand })}
          />
        </div>
        <div className="w-40">
          <Select
            placeholder="All Categories"
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            options={categories.map((c) => typeof c === 'string' ? c : { label: c.name || c.category, value: c.name || c.category })}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={products}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={(key, order) => { setSortBy(key); setSortOrder(order); }}
        emptyMessage="No products found"
      />

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          product={editProduct}
          onClose={handleFormClose}
          brands={brands}
          categories={categories}
        />
      )}

      {/* Bulk Import Modal */}
      {showBulk && (
        <BulkImport onClose={(refresh) => { setShowBulk(false); if (refresh) fetchProducts(); }} />
      )}

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Product"
        size="sm"
      >
        <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-6">
          Are you sure you want to delete this product? This action cannot be undone.
        </p>
        <div className="flex items-center gap-3 justify-end">
          <Button variant="ghost" onClick={() => setDeleteModal(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </motion.div>
  );
}
