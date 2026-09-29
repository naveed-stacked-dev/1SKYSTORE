import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { pageTransition } from '@/animations/variants';
import Button from '@/components/ui/Button';
import uploadService from '@/api/upload.service';
import { Upload, Copy, Check, Image as ImageIcon, Trash2, AlertTriangle, CheckSquare, Square } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MediaGallery() {
  const [images, setImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, urls: [], loading: false, error: null });

  const fetchGallery = useCallback(async () => {
    setLoading(true);
    try {
      const res = await uploadService.getGallery();
      setImages(res.data?.data?.images || res.data?.images || []);
      setSelectedImages([]);
    } catch {
      toast.error('Failed to load gallery');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGallery(); }, [fetchGallery]);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      if (files.length === 1) {
        await uploadService.uploadImage(files[0]);
      } else {
        await uploadService.uploadImages(files);
      }
      toast.success('Images uploaded successfully');
      fetchGallery();
    } catch {
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = (urls) => {
    const textToCopy = Array.isArray(urls) ? urls.join('\n') : urls;
    navigator.clipboard.writeText(textToCopy);
    setCopied(Array.isArray(urls) ? 'bulk' : urls);
    toast.success(`${Array.isArray(urls) ? urls.length + ' URLs' : 'URL'} copied to clipboard`);
    setTimeout(() => setCopied(null), 2000);
  };

  const openDeleteModal = (urls) => {
    setDeleteModal({ isOpen: true, urls: Array.isArray(urls) ? urls : [urls], loading: false, error: null });
  };

  const executeDelete = async () => {
    if (!deleteModal.urls || deleteModal.urls.length === 0) return;
    setDeleteModal(prev => ({ ...prev, loading: true, error: null }));
    try {
      // Execute all deletions in parallel
      await Promise.all(deleteModal.urls.map(url => uploadService.deleteImage(url)));
      toast.success(`${deleteModal.urls.length} image(s) deleted successfully`);
      setDeleteModal({ isOpen: false, urls: [], loading: false, error: null });
      fetchGallery();
    } catch (err) {
      setDeleteModal(prev => ({ 
        ...prev, 
        loading: false, 
        error: err.message || err.data?.message || 'Failed to delete some images' 
      }));
    }
  };

  const toggleSelectAll = () => {
    if (selectedImages.length === images.length) {
      setSelectedImages([]);
    } else {
      setSelectedImages(images.map(img => img.url));
    }
  };

  const toggleSelect = (url) => {
    setSelectedImages(prev => 
      prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
    );
  };

  return (
    <motion.div {...pageTransition}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-neutral-900 dark:text-neutral-50">Media Gallery</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Upload images here to get URLs for Excel import files
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl cursor-pointer transition-colors shadow-sm focus:ring-2 focus:ring-primary-500/30 outline-none">
            <Upload className="w-4 h-4" /> 
            {uploading ? 'Uploading...' : 'Upload Images'}
            <input type="file" accept="image/*" multiple className="hidden" disabled={uploading} onChange={handleUpload} />
          </label>
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      <AnimatePresence>
        {selectedImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-wrap items-center justify-between gap-4 mb-6 p-3 bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/30 rounded-xl"
          >
            <div className="flex items-center gap-3 px-2">
              <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">
                {selectedImages.length} selected
              </span>
              <button
                onClick={() => setSelectedImages([])}
                className="text-xs text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200 underline"
              >
                Clear selection
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(selectedImages)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-sm font-medium rounded-lg transition-colors"
              >
                {copied === 'bulk' ? <Check className="w-4 h-4 text-success-500" /> : <Copy className="w-4 h-4" />}
                Copy Links
              </button>
              <button
                onClick={() => openDeleteModal(selectedImages)}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Select All Toggle */}
      {!loading && images.length > 0 && (
        <div className="flex items-center mb-4 px-1">
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors group outline-none"
          >
            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedImages.length === images.length ? 'bg-primary-500 border-primary-500 text-white' : 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 group-hover:border-primary-400'}`}>
              {selectedImages.length === images.length && <Check className="w-3.5 h-3.5" />}
            </div>
            Select All
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-neutral-200 dark:bg-neutral-800 rounded-xl h-32 w-full" />
          ))}
        </div>
      ) : images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {images.map((img, i) => {
            const isSelected = selectedImages.includes(img.url);
            return (
              <div 
                key={i} 
                onClick={() => toggleSelect(img.url)}
                className={`group relative bg-white dark:bg-neutral-900 rounded-xl overflow-hidden border-2 cursor-pointer transition-colors ${isSelected ? 'border-primary-500' : 'border-neutral-100 dark:border-neutral-800 hover:border-primary-300 dark:hover:border-primary-700'}`}
              >
                {/* Checkbox overlay */}
                <div className="absolute top-2 left-2 z-10">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors shadow-sm ${isSelected ? 'bg-primary-500 border-primary-500 text-white' : 'bg-white border-neutral-300 dark:bg-neutral-800 dark:border-neutral-600'}`}>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>

                <div className="aspect-square bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center p-2">
                  <img src={img.url} alt={img.name} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                </div>
                
                {/* Actions overlay */}
                <div className={`absolute inset-0 bg-black/60 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-sm ${isSelected ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); copyToClipboard(img.url); }}
                      className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-colors shadow-sm"
                      title="Copy URL"
                    >
                      {copied === img.url ? <Check className="w-5 h-5 text-success-400" /> : <Copy className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); openDeleteModal(img.url); }}
                      className="p-2 rounded-lg bg-red-500/80 hover:bg-red-500 text-white backdrop-blur-md transition-colors shadow-sm"
                      title="Delete Image"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-xs text-white/80 font-mono px-2 truncate w-full text-center">
                    {img.name || 'Copy URL'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800">
          <ImageIcon className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-500 dark:text-neutral-400">No images found. Upload some to get started.</p>
        </div>
      )}

      <AnimatePresence>
        {deleteModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
              onClick={() => !deleteModal.loading && setDeleteModal({ isOpen: false, urls: [], loading: false, error: null })}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-100 dark:border-neutral-800 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 mb-1">Delete {deleteModal.urls.length > 1 ? `${deleteModal.urls.length} Images` : 'Image'}</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                      Are you sure you want to permanently delete {deleteModal.urls.length > 1 ? 'these images' : 'this image'}? This action cannot be undone.
                    </p>
                  </div>
                </div>

                {deleteModal.error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20"
                  >
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                      {deleteModal.error}
                    </p>
                  </motion.div>
                )}

                <div className="flex items-center justify-end gap-3 mt-6 pt-2">
                  <button
                    onClick={() => setDeleteModal({ isOpen: false, urls: [], loading: false, error: null })}
                    disabled={deleteModal.loading}
                    className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors disabled:opacity-50 outline-none focus:ring-2 focus:ring-neutral-500/30"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executeDelete}
                    disabled={deleteModal.loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2 outline-none focus:ring-2 focus:ring-red-500/30"
                  >
                    {deleteModal.loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      `Delete ${deleteModal.urls.length > 1 ? 'Images' : 'Image'}`
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
