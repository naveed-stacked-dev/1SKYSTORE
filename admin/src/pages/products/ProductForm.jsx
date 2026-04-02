import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import Toggle from '@/components/ui/Toggle';
import productService from '@/api/product.service';
import toast from 'react-hot-toast';
import { Upload, X } from 'lucide-react';

export default function ProductForm({ product, onClose, brands = [], categories = [] }) {
  const isEdit = !!product;
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    sku: '',
    description: '',
    price_inr: '',
    price_usd: '',
    stock: '',
    category: '',
    brand: '',
    is_active: true,
    is_best: false,
    images: [],
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        sku: product.sku || '',
        description: product.description || '',
        price_inr: product.price_inr || '',
        price_usd: product.price_usd || '',
        stock: product.stock || '',
        category: product.category || '',
        brand: product.brand || '',
        is_active: product.is_active ?? true,
        is_best: product.is_best ?? false,
        images: (product.images || []).map((img) => typeof img === 'string' ? img : img.image_url),
      });
    }
  }, [product]);

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.sku.trim()) errs.sku = 'SKU is required';
    if (!form.price_inr || isNaN(form.price_inr)) errs.price_inr = 'Valid INR price required';
    if (!form.category) errs.category = 'Category is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Check if adding these files exceeds max (e.g. 5)
    if (form.images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    onChange('images', [...form.images, ...files]);
  };

  const removeImage = (index) => {
    onChange('images', form.images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('sku', form.sku);
      if (form.description) formData.append('description', form.description);
      formData.append('price_inr', Number(form.price_inr));
      if (form.price_usd) formData.append('price_usd', Number(form.price_usd));
      if (form.stock) formData.append('stock', Number(form.stock));
      if (form.category) formData.append('category', form.category);
      if (form.brand) formData.append('brand', form.brand);
      formData.append('is_active', form.is_active);
      formData.append('is_best', form.is_best);

      // Extract existing images URLs separately so the backend knows which ones to keep
      const retainedImages = form.images.filter(img => typeof img === 'string');
      formData.append('retainedImages', JSON.stringify(retainedImages));

      // Append new files matching the strict form-data requirements
      form.images.forEach(img => {
        if (img instanceof File) {
          formData.append('images', img);
        }
      });

      if (isEdit) {
        await productService.update(product.id, formData);
        toast.success('Product updated');
      } else {
        await productService.create(formData);
        toast.success('Product created');
      }
      onClose(true);
    } catch (err) {
      toast.error(err?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const brandOptions = brands.map((b) => typeof b === 'string' ? b : { label: b.name || b.brand, value: b.name || b.brand });
  const categoryOptions = categories.map((c) => typeof c === 'string' ? c : { label: c.name || c.category, value: c.name || c.category });

  return (
    <Modal
      isOpen
      onClose={() => onClose(false)}
      title={isEdit ? 'Edit Product' : 'Create Product'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Product Name" value={form.name} onChange={(e) => onChange('name', e.target.value)} error={errors.name} placeholder="Enter product name" />
          <Input label="SKU" value={form.sku} onChange={(e) => onChange('sku', e.target.value)} error={errors.sku} placeholder="HP-ARN-30C" />
        </div>

        <Textarea label="Description" value={form.description} onChange={(e) => onChange('description', e.target.value)} placeholder="Product description..." rows={3} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Price (INR)" type="number" value={form.price_inr} onChange={(e) => onChange('price_inr', e.target.value)} error={errors.price_inr} placeholder="250" />
          <Input label="Price (USD)" type="number" value={form.price_usd} onChange={(e) => onChange('price_usd', e.target.value)} placeholder="15" />
          <Input label="Stock" type="number" value={form.stock} onChange={(e) => onChange('stock', e.target.value)} placeholder="100" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="Category" value={form.category} onChange={(e) => onChange('category', e.target.value)} error={errors.category} options={categoryOptions} placeholder="Select category" />
          <Select label="Brand" value={form.brand} onChange={(e) => onChange('brand', e.target.value)} options={brandOptions} placeholder="Select brand" />
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
            Images
          </label>
          <div className="flex flex-wrap gap-3 mb-3">
            {form.images.map((img, i) => {
              const url = img instanceof File ? URL.createObjectURL(img) : img;
              return (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              );
            })}
            <label className="w-20 h-20 rounded-xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 dark:hover:border-primary-500 transition-colors">
              <Upload className="w-5 h-5 text-neutral-400 mb-1" />
              <span className="text-xs text-neutral-400">Upload</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
            </label>
          </div>
          {uploading && <p className="text-xs text-primary-500">Uploading...</p>}
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-6">
          <Toggle checked={form.is_active} onChange={(val) => onChange('is_active', val)} label="Active" />
          <Toggle checked={form.is_best} onChange={(val) => onChange('is_best', val)} label="Best Seller" />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 justify-end pt-2">
          <Button variant="ghost" type="button" onClick={() => onClose(false)}>Cancel</Button>
          <Button type="submit" loading={loading}>{isEdit ? 'Update' : 'Create'}</Button>
        </div>
      </form>
    </Modal>
  );
}
