import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '@/animations/variants';
import DataTable from '@/components/tables/DataTable';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Toggle from '@/components/ui/Toggle';
import Modal from '@/components/ui/Modal';
import Textarea from '@/components/ui/Textarea';
import Badge from '@/components/ui/Badge';
import couponService from '@/api/coupon.service';
import productService from '@/api/product.service';
import { formatDate } from '@/utils/formatters';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editCoupon, setEditCoupon] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    code: '',
    description: '',
    discount_value: '',
    brand: '',
    starts_at: '',
    expires_at: '',
    usage_limit: '',
    is_active: true,
  });
  const [errors, setErrors] = useState({});

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await couponService.getAll();
      const data = res.data?.data || res.data;
      setCoupons(Array.isArray(data) ? data : data?.coupons || data?.rows || []);
    } catch {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  useEffect(() => {
    const loadBrands = async () => {
      try {
        const res = await productService.getBrands();
        const b = res.data?.data || res.data || [];
        setBrands(Array.isArray(b) ? b : []);
      } catch { /* ignore */ }
    };
    loadBrands();
  }, []);

  const openForm = (coupon = null) => {
    if (coupon) {
      setEditCoupon(coupon);
      setForm({
        code: coupon.code || '',
        description: coupon.description || '',
        discount_value: coupon.discount_value || '',
        brand: coupon.brand || '',
        starts_at: coupon.starts_at ? coupon.starts_at.slice(0, 16) : '',
        expires_at: coupon.expires_at ? coupon.expires_at.slice(0, 16) : '',
        usage_limit: coupon.usage_limit || '',
        is_active: coupon.is_active ?? true,
      });
    } else {
      setEditCoupon(null);
      setForm({ code: '', description: '', discount_value: '', brand: '', starts_at: '', expires_at: '', usage_limit: '', is_active: true });
    }
    setErrors({});
    setShowForm(true);
  };

  const validate = () => {
    const errs = {};
    if (!form.code.trim()) errs.code = 'Code is required';
    if (!form.discount_value || isNaN(form.discount_value)) errs.discount_value = 'Valid percentage required';
    else if (Number(form.discount_value) < 1 || Number(form.discount_value) > 100) errs.discount_value = 'Must be between 1 and 100';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        code: form.code,
        description: form.description || undefined,
        discount_type: 'percentage',
        discount_value: Number(form.discount_value),
        brand: form.brand || null,
        starts_at: form.starts_at || null,
        expires_at: form.expires_at || null,
        usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
        is_active: form.is_active,
      };
      if (editCoupon) {
        await couponService.update(editCoupon.id, payload);
        toast.success('Coupon updated');
      } else {
        await couponService.create(payload);
        toast.success('Coupon created');
      }
      setShowForm(false);
      fetchCoupons();
    } catch (err) {
      toast.error(err?.message || 'Failed to save coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await couponService.delete(deleteModal);
      toast.success('Coupon deleted');
      setDeleteModal(null);
      fetchCoupons();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const brandOptions = brands.map((b) => typeof b === 'string' ? { label: b, value: b } : { label: b.name || b.brand, value: b.name || b.brand });

  const columns = [
    {
      key: 'code',
      label: 'Code',
      render: (val) => (
        <code className="px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-primary-600 dark:text-primary-400 font-mono text-sm font-semibold">{val}</code>
      ),
    },
    {
      key: 'discount_value',
      label: 'Discount',
      render: (val) => (
        <span className="font-semibold text-neutral-800 dark:text-neutral-200">{parseFloat(val).toFixed(0)}%</span>
      ),
    },
    {
      key: 'brand',
      label: 'Brand',
      render: (val) => val ? <Badge>{val}</Badge> : <span className="text-neutral-400">All brands</span>,
    },
    {
      key: 'usage_limit',
      label: 'Usage',
      render: (val, row) => (
        <div className="text-sm">
          <span className="font-medium text-neutral-800 dark:text-neutral-200">{row.used_count || 0}</span>
          <span className="text-neutral-400"> / {val || '∞'}</span>
        </div>
      ),
    },
    {
      key: 'expires_at',
      label: 'Expires',
      render: (val) => val ? (
        <span className={`text-sm ${new Date(val) < new Date() ? 'text-error-500' : 'text-neutral-500'}`}>
          {formatDate(val)}
        </span>
      ) : <span className="text-neutral-400">Never</span>,
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (val) => <Badge variant={val ? 'success' : 'default'}>{val ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      key: 'actions',
      label: '',
      width: '100px',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openForm(row)} className="p-1.5 rounded-lg text-neutral-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => setDeleteModal(row.id)} className="p-1.5 rounded-lg text-neutral-400 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10 transition-colors">
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
          <h1 className="text-2xl font-heading font-bold text-neutral-900 dark:text-neutral-50">Coupons</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Manage discount coupons</p>
        </div>
        <Button size="sm" onClick={() => openForm()}>
          <Plus className="w-4 h-4" /> Add Coupon
        </Button>
      </div>

      <DataTable columns={columns} data={coupons} loading={loading} emptyMessage="No coupons found" />

      {/* Form Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editCoupon ? 'Edit Coupon' : 'Create Coupon'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Coupon Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} error={errors.code} placeholder="SAVE20" />

          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional description..." rows={2} />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Discount (%)" type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} error={errors.discount_value} placeholder="20" />
            <Select
              label="Brand (optional)"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              options={[{ label: 'All Brands', value: '' }, ...brandOptions]}
              placeholder="Select brand"
            />
          </div>

          <Input label="Max Uses (leave empty for unlimited)" type="number" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} placeholder="100" />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Starts At" type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
            <Input label="Expires At" type="datetime-local" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
          </div>

          <Toggle checked={form.is_active} onChange={(val) => setForm({ ...form, is_active: val })} label="Active" />

          <div className="flex items-center gap-3 justify-end pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editCoupon ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Coupon" size="sm">
        <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-6">Are you sure? This action cannot be undone.</p>
        <div className="flex items-center gap-3 justify-end">
          <Button variant="ghost" onClick={() => setDeleteModal(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </motion.div>
  );
}
