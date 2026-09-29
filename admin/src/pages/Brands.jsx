import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Pencil, Trash2, X, Upload, Tag,
  ToggleLeft, ToggleRight, Search, Image as ImageIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import brandService from '@/api/brand.service';

// ─── Brand Modal ─────────────────────────────────────────────────────────────
function BrandModal({ brand, onClose, onSaved }) {
  const [name, setName] = useState(brand?.name || '');
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(brand?.image_url || null);
  const [saving, setSaving] = useState(false);
  const [removeImage, setRemoveImage] = useState(false);
  const fileRef = useRef(null);

  const handleFile = useCallback((file) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      toast.error('Invalid file type. Use JPG, PNG, WEBP or GIF.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File exceeds 5MB limit.');
      return;
    }
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setRemoveImage(false);
  }, []);

  const handleRemoveImage = () => {
    setImageFile(null);
    setPreview(null);
    setRemoveImage(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Brand name is required');
      return;
    }
    try {
      setSaving(true);
      if (brand) {
        await brandService.updateBrand(brand.id, { name: name.trim(), remove_image: removeImage }, imageFile);
        toast.success('Brand updated successfully!');
      } else {
        await brandService.createBrand(name.trim(), imageFile);
        toast.success('Brand created successfully!');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                <Tag className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              </div>
              <h2 className="text-lg font-heading font-bold text-neutral-900 dark:text-neutral-50">
                {brand ? 'Edit Brand' : 'Add New Brand'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Brand Name */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                Brand Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Reckeweg"
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition"
              />
            </div>

            {/* Brand Image */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                Brand Logo / Image
              </label>

              {preview ? (
                <div className="relative group w-40 h-40 rounded-2xl overflow-hidden border-2 border-neutral-200 dark:border-neutral-700">
                  <img src={preview} alt="Brand" className="w-full h-full object-contain p-2 bg-white dark:bg-neutral-800" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="p-2 bg-white rounded-lg text-neutral-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                      title="Change image"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="p-2 bg-white rounded-lg text-neutral-700 hover:bg-red-50 hover:text-red-500 transition-colors"
                      title="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileRef.current?.click()}
                  className="w-40 h-40 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-600 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all group"
                >
                  <ImageIcon className="w-8 h-8 text-neutral-300 dark:text-neutral-600 group-hover:text-primary-400 transition-colors" />
                  <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500 group-hover:text-primary-500">Upload image</span>
                </div>
              )}

              <input
                ref={fileRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.gif"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <p className="mt-1.5 text-xs text-neutral-400">JPG, PNG, WEBP · Max 5MB</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-primary-500/25"
              >
                {saving ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : brand ? (
                  <><Pencil className="w-4 h-4" /> Update</>
                ) : (
                  <><Plus className="w-4 h-4" /> Create</>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteModal({ brand, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await brandService.deleteBrand(brand.id);
      toast.success('Brand deleted');
      onDeleted();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl p-6 space-y-4"
      >
        <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center mx-auto">
          <Trash2 className="w-6 h-6 text-red-500" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">Delete Brand</h3>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Are you sure you want to delete <strong className="text-neutral-800 dark:text-neutral-200">"{brand.name}"</strong>? This action cannot be undone.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-60"
          >
            {deleting ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Delete'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Brand Card ───────────────────────────────────────────────────────────────
function BrandCard({ brand, onEdit, onDelete, onToggle }) {
  const [toggling, setToggling] = useState(false);

  const handleToggle = async () => {
    try {
      setToggling(true);
      await onToggle(brand.id);
    } finally {
      setToggling(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group relative flex flex-col bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden shadow-sm hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-300"
    >
      {/* Status pill */}
      <div className={`absolute top-3 left-3 z-10 px-2 py-0.5 rounded-full text-[10px] font-bold ${brand.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400'}`}>
        {brand.is_active ? 'Active' : 'Inactive'}
      </div>

      {/* Image */}
      <div className="h-36 flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-700">
        {brand.image_url ? (
          <img
            src={brand.image_url}
            alt={brand.name}
            className="max-h-28 max-w-[80%] object-contain drop-shadow-sm"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-neutral-300 dark:text-neutral-600">
            <ImageIcon className="w-10 h-10" />
            <span className="text-xs">No image</span>
          </div>
        )}
      </div>

      {/* Info + Actions */}
      <div className="p-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 truncate">{brand.name}</p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">/{brand.slug}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleToggle}
            disabled={toggling}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
            title={brand.is_active ? 'Deactivate' : 'Activate'}
          >
            {toggling ? (
              <span className="w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin block" />
            ) : brand.is_active ? (
              <ToggleRight className="w-4 h-4 text-emerald-500" />
            ) : (
              <ToggleLeft className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => onEdit(brand)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(brand)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Brands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editBrand, setEditBrand] = useState(null);
  const [deleteBrand, setDeleteBrand] = useState(null);

  const fetchBrands = useCallback(async () => {
    try {
      setLoading(true);
      const res = await brandService.getBrands();
      setBrands(res.data?.data || []);
    } catch {
      toast.error('Failed to load brands');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const handleEdit = (brand) => {
    setEditBrand(brand);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditBrand(null);
  };

  const handleToggle = async (id) => {
    try {
      const res = await brandService.toggleBrand(id);
      setBrands((prev) => prev.map((b) => (b.id === id ? res.data?.data : b)));
      toast.success('Brand status updated');
    } catch {
      toast.error('Failed to update brand status');
    }
  };

  const filtered = brands.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
            Brand Management
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {brands.length} brand{brands.length !== 1 ? 's' : ''} · Manage logos and visibility
          </p>
        </div>
        <button
          onClick={() => { setEditBrand(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold transition-colors shadow-sm shadow-primary-500/25 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Brand
        </button>
      </div>

      {/* Search bar */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search brands..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden animate-pulse">
              <div className="h-36 bg-neutral-100 dark:bg-neutral-700" />
              <div className="p-4 flex items-center gap-3">
                <div className="h-3 flex-1 bg-neutral-100 dark:bg-neutral-700 rounded-full" />
                <div className="h-6 w-16 bg-neutral-100 dark:bg-neutral-700 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 gap-4 text-center"
        >
          <div className="w-20 h-20 rounded-3xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <Tag className="w-10 h-10 text-neutral-300 dark:text-neutral-600" />
          </div>
          <div>
            <p className="text-base font-semibold text-neutral-600 dark:text-neutral-300">
              {search ? `No brands matching "${search}"` : 'No brands yet'}
            </p>
            <p className="text-sm text-neutral-400 mt-1">
              {search ? 'Try a different search term' : 'Click "Add Brand" to create your first brand.'}
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((brand) => (
              <BrandCard
                key={brand.id}
                brand={brand}
                onEdit={handleEdit}
                onDelete={setDeleteBrand}
                onToggle={handleToggle}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {modalOpen && (
          <BrandModal
            brand={editBrand}
            onClose={handleModalClose}
            onSaved={fetchBrands}
          />
        )}
        {deleteBrand && (
          <DeleteModal
            brand={deleteBrand}
            onClose={() => setDeleteBrand(null)}
            onDeleted={fetchBrands}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
