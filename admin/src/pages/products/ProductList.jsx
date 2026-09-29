import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
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
import { formatUSD, truncate } from '@/utils/formatters';
import { downloadBlobResponse, readBlobError } from '@/utils/download';
import { Plus, Search, Upload, Download, Edit2, Trash2, Eye, CheckCircle, XCircle, PackagePlus, Star, X } from 'lucide-react';
import toast from 'react-hot-toast';
import ProductForm from './ProductForm';
import BulkImport from './BulkImport';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [symptoms, setSymptoms] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [showBulk, setShowBulk] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [exporting, setExporting] = useState(false);

  const [filter, setFilter] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [bulkStockModal, setBulkStockModal] = useState(false);
  const [bulkStockValue, setBulkStockValue] = useState('');
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);

  const debouncedSearch = useDebounce(search);

  // Filters currently applied to the table — shared by the list fetch and the export
  // so a download always contains exactly what the admin is looking at.
  const activeFilters = useCallback(() => {
    const params = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (brand) params.brand = brand;
    if (category) params.category = category;

    if (filter === 'active') params.is_active = true;
    if (filter === 'inactive') params.is_active = false;
    if (filter === 'outOfStock') params.stock = 0;
    if (filter === 'lowStock') params.stock = 'lowStock';
    if (filter === 'best') params.is_best = true;
    if (filter === 'featured') params.is_featured = true;
    if (filter === 'trending') params.is_trending = true;

    return params;
  }, [debouncedSearch, brand, category, filter]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, pageSize: 10, ...activeFilters() };

      if (sortBy) {
        params.sortBy = sortBy;
        params.sortOrder = sortOrder;
      }
      const res = await productService.getAll(params);
      const data = res.data?.data || res.data;
      console.log(data);
      setProducts(Array.isArray(data) ? data : data?.products || data?.rows || []);
      setTotalPages(res.data?.pagination?.totalPages || data?.totalPages || data?.total_pages || Math.ceil((data?.total || data?.count || 0) / 10) || 1);
      setTotalProducts(res.data?.pagination?.totalItems || data?.total || data?.count || 0);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page, activeFilters, sortBy, sortOrder]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await productService.exportAll(activeFilters());
      downloadBlobResponse(res, 'products.xlsx');
      toast.success('Products exported');
    } catch (err) {
      toast.error(await readBlobError(err, 'Failed to export products'));
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [bRes, cRes, sRes] = await Promise.allSettled([
          productService.getBrands(),
          productService.getCategories(),
          productService.getSymptoms(),
        ]);
        if (bRes.status === 'fulfilled') {
          const b = bRes.value.data?.data || bRes.value.data || [];
          setBrands(Array.isArray(b) ? b : []);
        }
        if (cRes.status === 'fulfilled') {
          const c = cRes.value.data?.data || cRes.value.data || [];
          setCategories(Array.isArray(c) ? c : []);
        }
        if (sRes.status === 'fulfilled') {
          const s = sRes.value.data?.data || sRes.value.data || [];
          setSymptoms(Array.isArray(s) ? s : []);
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

  const handleBulkAction = async (type) => {
    if (!selectedProducts.length) return;
    setIsBulkActionLoading(true);

    try {
      switch (type) {
        case 'activate':
          await productService.bulkStatus({ productIds: selectedProducts, isActive: true });
          toast.success(`${selectedProducts.length} products activated`);
          break;
        case 'deactivate':
          await productService.bulkStatus({ productIds: selectedProducts, isActive: false });
          toast.success(`${selectedProducts.length} products deactivated`);
          break;
        case 'bestseller':
          await productService.bulkBestseller({ productIds: selectedProducts, isBestSeller: true });
          toast.success(`${selectedProducts.length} products marked as bestseller`);
          break;
        case 'delete':
          await productService.bulkDelete({ productIds: selectedProducts });
          toast.success(`${selectedProducts.length} products deleted`);
          setBulkDeleteModal(false);
          break;
        case 'stock':
          await productService.bulkStock({ productIds: selectedProducts, stock: bulkStockValue, type: 'set' });
          toast.success(`Stock updated for ${selectedProducts.length} products`);
          setBulkStockModal(false);
          setBulkStockValue('');
          break;
      }
      setSelectedProducts([]);
      fetchProducts();
    } catch {
      toast.error('Bulk action failed');
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Product',
      sortable: true,
      render: (val, row) => {
        let imageUrl = row.image;
        if (row.images && row.images.length > 0) {
          imageUrl = typeof row.images[0] === 'string' ? row.images[0] : row.images[0].image_url;
        }

        return (
          <div className="flex items-center gap-3">
            {imageUrl ? (
              <img
                src={imageUrl}
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
        );
      },
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
      key: 'symptom',
      label: 'Symptom',
      render: (val) => {
        const text = Array.isArray(val) ? val.join(', ') : (val || '—');
        return <span className="text-neutral-600 dark:text-neutral-400 truncate max-w-[120px] block" title={text}>{text}</span>;
      },
    },
    {
      key: 'price_usd',
      label: 'Price',
      sortable: true,
      render: (val) => (
        <div>
          <p className="font-medium">{formatUSD(val)}</p>
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
          <Link
            to={`/admin/products/${row.id}`}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </Link>
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
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-heading font-bold text-neutral-900 dark:text-neutral-50">Products</h1>
            <Badge variant="primary" className="text-xs px-2.5 py-0.5 rounded-full">{totalProducts} Total</Badge>
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Manage your product catalog</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} loading={exporting} disabled={exporting}>
            <Download className="w-4 h-4" /> Export
          </Button>
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
            value={filter}
            onChange={(e) => { setFilter(e.target.value); setPage(1); }}
            options={[
              { label: 'All Status/Stock', value: 'all' },
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
              { label: 'Out of Stock', value: 'outOfStock' },
              { label: 'Low Stock (< 10)', value: 'lowStock' },
              { label: 'Best Sellers', value: 'best' },
              { label: 'Featured', value: 'featured' },
              { label: 'Trending', value: 'trending' },
            ]}
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

      {selectedProducts.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-neutral-900 border border-primary-100 dark:border-primary-900/50 p-4 rounded-2xl mb-5 flex items-center justify-between shadow-soft"
        >
          <div className="flex items-center gap-4">
            <span className="font-medium text-primary-600 dark:text-primary-400">
              {selectedProducts.length} items selected
            </span>
            <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-800"></div>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('activate')} disabled={isBulkActionLoading}>
                <CheckCircle className="w-4 h-4" /> Activate
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('deactivate')} disabled={isBulkActionLoading}>
                <XCircle className="w-4 h-4" /> Deactivate
              </Button>
              <Button size="sm" variant="outline" onClick={() => setBulkStockModal(true)} disabled={isBulkActionLoading}>
                <PackagePlus className="w-4 h-4" /> Stock
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('bestseller')} disabled={isBulkActionLoading}>
                <Star className="w-4 h-4" /> Bestseller
              </Button>
              <Button size="sm" variant="danger" onClick={() => setBulkDeleteModal(true)} disabled={isBulkActionLoading}>
                <Trash2 className="w-4 h-4" /> Delete
              </Button>
            </div>
          </div>
          <button 
            onClick={() => setSelectedProducts([])}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </motion.div>
      )}

      <DataTable
        selectable
        selectedIds={selectedProducts}
        onSelectionChange={setSelectedProducts}
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
          symptoms={symptoms}
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

      {/* Bulk Delete Modal */}
      <Modal
        isOpen={bulkDeleteModal}
        onClose={() => setBulkDeleteModal(false)}
        title="Delete Multiple Products"
        size="sm"
      >
        <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-6">
          Are you sure you want to delete {selectedProducts.length} products? This action cannot be undone.
        </p>
        <div className="flex items-center gap-3 justify-end">
          <Button variant="ghost" onClick={() => setBulkDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={() => handleBulkAction('delete')} loading={isBulkActionLoading}>Delete All</Button>
        </div>
      </Modal>

      {/* Bulk Stock Modal */}
      <Modal
        isOpen={bulkStockModal}
        onClose={() => setBulkStockModal(false)}
        title="Update Stock"
        size="sm"
      >
        <div className="space-y-4 mb-6">
          <Input
            label="New Stock Amount"
            type="number"
            value={bulkStockValue}
            onChange={(e) => setBulkStockValue(e.target.value)}
            placeholder="e.g. 50"
          />
        </div>
        <div className="flex items-center gap-3 justify-end">
          <Button variant="ghost" onClick={() => setBulkStockModal(false)}>Cancel</Button>
          <Button onClick={() => handleBulkAction('stock')} loading={isBulkActionLoading} disabled={!bulkStockValue || isBulkActionLoading}>
            Update Stock
          </Button>
        </div>
      </Modal>
    </motion.div>
  );
}
