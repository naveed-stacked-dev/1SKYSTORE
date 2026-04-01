import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '@/animations/variants';
import Button from '@/components/ui/Button';
import uploadService from '@/api/upload.service';
import { Upload, Copy, Check, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MediaGallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(null);

  const fetchGallery = useCallback(async () => {
    setLoading(true);
    try {
      const res = await uploadService.getGallery();
      setImages(res.data?.data?.images || res.data?.images || []);
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

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    setCopied(url);
    toast.success('URL copied to clipboard');
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <motion.div {...pageTransition}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-neutral-900 dark:text-neutral-50">Media Gallery</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Upload images here to get URLs for Excel import files
          </p>
        </div>
        <div>
          <label className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl cursor-pointer transition-colors shadow-sm focus:ring-2 focus:ring-primary-500/30 outline-none">
            <Upload className="w-4 h-4" /> 
            {uploading ? 'Uploading...' : 'Upload Images'}
            <input type="file" accept="image/*" multiple className="hidden" disabled={uploading} onChange={handleUpload} />
          </label>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-neutral-200 dark:bg-neutral-800 rounded-xl h-32 w-full" />
          ))}
        </div>
      ) : images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {images.map((img, i) => (
            <div key={i} className="group relative bg-white dark:bg-neutral-900 rounded-xl overflow-hidden border border-neutral-100 dark:border-neutral-800 hover:border-primary-400 dark:hover:border-primary-500 transition-colors">
              <div className="aspect-square bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center p-2">
                <img src={img.url} alt={img.name} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                <button
                  onClick={() => copyToClipboard(img.url)}
                  className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-colors shadow-sm"
                  title="Copy URL"
                >
                  {copied === img.url ? <Check className="w-5 h-5 text-success-400" /> : <Copy className="w-5 h-5" />}
                </button>
                <p className="text-xs text-white/80 font-mono select-all px-2 truncate w-full text-center">
                  Copy URL
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800">
          <ImageIcon className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-500 dark:text-neutral-400">No images found. Upload some to get started.</p>
        </div>
      )}
    </motion.div>
  );
}
