import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Trash2, Image as ImageIcon, X,
  AlertTriangle, CheckCircle2, Layers, Info,
} from 'lucide-react';
import toast from 'react-hot-toast';
import bannerService from '@/api/banner.service';

// ─── Constants ────────────────────────────────────────────────────────────────
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

const TABS = [
  {
    id: 'hero_desktop',
    label: 'Hero (Desktop)',
    icon: Layers,
    dims: '1920 × 1080 px',
    ratio: '16:9',
    multiple: true,
    description: 'Full-width homepage carousel for desktop',
    apiType: 'hero',
    apiDevice: 'desktop',
  },
  {
    id: 'hero_mobile',
    label: 'Hero (Mobile)',
    icon: Layers,
    dims: '800 × 1200 px',
    ratio: '2:3',
    multiple: true,
    description: 'Full-width homepage carousel for mobile',
    apiType: 'hero',
    apiDevice: 'mobile',
  },
  {
    id: 'info_desktop',
    label: 'Info (Desktop)',
    icon: Info,
    dims: '1200 × 400 px',
    ratio: '3:1',
    multiple: false,
    description: 'Single announcement strip for desktop',
    apiType: 'info',
    apiDevice: 'desktop',
  },
  {
    id: 'info_mobile',
    label: 'Info (Mobile)',
    icon: Info,
    dims: '800 × 400 px',
    ratio: '2:1',
    multiple: false,
    description: 'Single announcement strip for mobile',
    apiType: 'info',
    apiDevice: 'mobile',
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-700 animate-pulse">
      <div className="aspect-video bg-neutral-200 dark:bg-neutral-700" />
      <div className="p-3 flex items-center justify-between">
        <div className="h-3 w-24 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
        <div className="h-7 w-7 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />
      </div>
    </div>
  );
}

function EmptyState({ tabLabel }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 gap-5 text-center"
    >
      <div className="relative">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 flex items-center justify-center shadow-inner">
          <ImageIcon size={34} className="text-neutral-300 dark:text-neutral-500" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-500 rounded-full flex items-center justify-center shadow-md">
          <Upload size={13} className="text-white" />
        </div>
      </div>
      <div>
        <p className="text-base font-semibold text-neutral-600 dark:text-neutral-300">
          No {tabLabel} images yet
        </p>
        <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1 max-w-xs">
          Drag & drop or click the upload zone above to add your first banner image.
        </p>
      </div>
    </motion.div>
  );
}

function PendingFileCard({ file, onRemove }) {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const size =
    file.size > 1024 * 1024
      ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
      : `${(file.size / 1024).toFixed(0)} KB`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.88, transition: { duration: 0.15 } }}
      className="relative rounded-2xl overflow-hidden border border-amber-300 dark:border-amber-600 bg-white dark:bg-neutral-800 shadow-sm"
    >
      {/* Staged pill */}
      <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
        <span>STAGED</span>
      </div>
      {/* Remove button */}
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-red-500 transition-colors"
      >
        <X size={12} />
      </button>
      {/* Preview */}
      <div className="aspect-video bg-neutral-100 dark:bg-neutral-900">
        {preview && (
          <img src={preview} alt={file.name} className="w-full h-full object-cover" />
        )}
      </div>
      {/* Meta */}
      <div className="px-3 py-2 flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 truncate">{file.name}</p>
          <p className="text-[11px] text-neutral-400">{size}</p>
        </div>
      </div>
    </motion.div>
  );
}

function LiveImageCard({ banner, onDelete, isDeleting }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.18 } }}
      className="group relative rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-sm hover:shadow-lg transition-all duration-300"
    >
      {/* Image */}
      <div className="aspect-video overflow-hidden bg-neutral-100 dark:bg-neutral-900">
        <img
          src={banner.image_url}
          alt="Banner"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>
      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-neutral-100 dark:border-neutral-700">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-xs text-neutral-500 dark:text-neutral-400">Live</span>
        </div>
        <button
          onClick={() => onDelete(banner.id)}
          disabled={isDeleting}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Delete banner"
        >
          {isDeleting ? (
            <span className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Trash2 size={14} />
          )}
        </button>
      </div>
      {/* Hover overlay glow */}
      <div className="absolute inset-0 rounded-2xl ring-2 ring-primary-500/0 group-hover:ring-primary-500/30 transition-all duration-300 pointer-events-none" />
    </motion.div>
  );
}

function DropZone({ onFiles, multiple, disabled }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const processFiles = useCallback((raw) => {
    const valid = [];
    Array.from(raw).forEach((f) => {
      if (!ACCEPTED_TYPES.includes(f.type)) {
        toast.error(`"${f.name}" — invalid format. Use JPG, PNG or WEBP.`, { duration: 4000 });
      } else if (f.size > MAX_SIZE) {
        toast.error(`"${f.name}" — exceeds 5 MB limit.`, { duration: 4000 });
      } else {
        valid.push(f);
      }
    });
    if (valid.length) onFiles(multiple ? valid : [valid[0]]);
  }, [multiple, onFiles]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    if (!disabled) processFiles(e.dataTransfer.files);
  }, [disabled, processFiles]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={[
        'relative rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200 select-none',
        disabled
          ? 'cursor-not-allowed opacity-50 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900'
          : dragging
            ? 'cursor-copy border-primary-500 bg-primary-50/60 dark:bg-primary-900/20 scale-[1.01] shadow-lg shadow-primary-500/10'
            : 'cursor-pointer border-neutral-300 dark:border-neutral-600 bg-neutral-50/50 dark:bg-neutral-800/40 hover:border-primary-400 hover:bg-primary-50/30 dark:hover:bg-primary-900/10',
      ].join(' ')}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        multiple={multiple}
        className="hidden"
        disabled={disabled}
        onChange={(e) => { processFiles(e.target.files); e.target.value = ''; }}
      />
      <div className="flex flex-col items-center gap-4 pointer-events-none">
        <motion.div
          animate={dragging ? { scale: 1.15, rotate: -5 } : { scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className={[
            'w-16 h-16 rounded-2xl flex items-center justify-center transition-colors duration-200',
            dragging
              ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400'
              : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-400 dark:text-neutral-500',
          ].join(' ')}
        >
          <Upload size={28} />
        </motion.div>
        <div>
          <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
            {dragging ? 'Release to add images' : 'Drag & drop images here'}
          </p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1.5">
            or <span className="text-primary-600 dark:text-primary-400 font-semibold">browse files</span>
            &nbsp;·&nbsp; JPG, PNG, WEBP &nbsp;·&nbsp; Max 5 MB
            {multiple ? ' · Multiple files allowed' : ' · One image only'}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Banners() {
  const [activeTab, setActiveTab] = useState('hero_desktop');
  const [banners, setBanners] = useState({ hero_desktop: [], hero_mobile: [], info_desktop: [], info_mobile: [] });
  const [loading, setLoading] = useState({ hero_desktop: true, hero_mobile: true, info_desktop: true, info_mobile: true });
  const [pendingFiles, setPendingFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // ── Fetch on mount ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetchBanners('hero_desktop');
    fetchBanners('hero_mobile');
    fetchBanners('info_desktop');
    fetchBanners('info_mobile');
  }, []);

  // ── Clear staged files whenever tab changes ─────────────────────────────────
  useEffect(() => {
    setPendingFiles([]);
  }, [activeTab]);

  const fetchBanners = async (tabId) => {
    const tab = TABS.find(t => t.id === tabId);
    if (!tab) return;
    try {
      setLoading((p) => ({ ...p, [tabId]: true }));
      const res = await bannerService.getBanners(tab.apiType, tab.apiDevice);
      setBanners((p) => ({ ...p, [tabId]: res.data?.data || [] }));
    } catch {
      toast.error(`Failed to load ${tab.label} banners`);
    } finally {
      setLoading((p) => ({ ...p, [tabId]: false }));
    }
  };

  // ── Stage files for upload ──────────────────────────────────────────────────
  const handleFiles = useCallback((files) => {
    const tab = TABS.find((t) => t.id === activeTab);
    if (!tab.multiple) {
      setPendingFiles([files[0]]);
      return;
    }
    setPendingFiles((prev) => {
      const seen = new Set(prev.map((f) => `${f.name}|${f.size}`));
      const next = Array.from(files).filter((f) => !seen.has(`${f.name}|${f.size}`));
      return [...prev, ...next];
    });
  }, [activeTab]);

  // ── Upload staged files ─────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!pendingFiles.length) return;

    const tab = TABS.find((t) => t.id === activeTab);
    
    // Guard: info already has an image?
    if (tab.apiType === 'info' && banners[activeTab].length > 0) {
      toast.error(`Delete the existing ${tab.label} before uploading a new one.`, { duration: 5000 });
      return;
    }

    try {
      setUploading(true);
      await bannerService.uploadBanners(Array.from(pendingFiles), tab.apiType, tab.apiDevice);
      toast.success(
        `${pendingFiles.length} image${pendingFiles.length > 1 ? 's' : ''} uploaded!`,
        { icon: '🎉' }
      );
      setPendingFiles([]);
      await fetchBanners(activeTab);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // ── Delete a live banner ────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      await bannerService.deleteBanner(id);
      toast.success('Banner deleted successfully');
      fetchBanners(activeTab);
    } catch {
      toast.error('Failed to delete banner');
    } finally {
      setDeletingId(null);
    }
  };

  // ── Derived state ───────────────────────────────────────────────────────────
  const currentTab = TABS.find((t) => t.id === activeTab);
  const TabIcon = currentTab.icon;
  const liveBanners = banners[activeTab] || [];
  const isLoading = loading[activeTab];
  const isInfoBlocked = currentTab.apiType === 'info' && liveBanners.length >= 1;

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
            Banner Management
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Upload and manage your homepage banners with AWS S3 storage.
          </p>
        </div>
        {/* Live counts summary */}
        <div className="flex items-center gap-2 shrink-0">
          {TABS.map((tab) => (
            <div
              key={tab.id}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
            >
              <tab.icon size={13} className="text-neutral-400" />
              <span className="text-[10px] sm:text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                {tab.label}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-primary-600 dark:text-primary-400">
                {banners[tab.id]?.length || 0}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tab Nav ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1 p-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-2xl w-full sm:w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={[
                'relative flex items-center justify-center gap-2 px-3 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors duration-150',
                isActive
                  ? 'text-white'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200',
              ].join(' ')}
            >
              {isActive && (
                <motion.div
                  layoutId="tab-highlight"
                  className="absolute inset-0 bg-primary-500 rounded-xl shadow-md shadow-primary-500/25"
                  transition={{ type: 'spring', bounce: 0.22, duration: 0.38 }}
                />
              )}
              <span className="relative flex items-center gap-2 text-center whitespace-nowrap">
                <Icon size={15} className="hidden sm:block" />
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ──────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="space-y-5"
        >
          {/* Dimension hint */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
              <TabIcon size={13} className="text-primary-600 dark:text-primary-400" />
              <span className="text-xs font-semibold text-primary-700 dark:text-primary-300">
                Recommended: {currentTab.dims} ({currentTab.ratio})
              </span>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{currentTab.description}</p>
          </div>

          {/* Warning: info slot full */}
          <AnimatePresence>
            {isInfoBlocked && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800"
              >
                <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  An info banner is already active.{' '}
                  <strong>Delete it below</strong> before uploading a replacement.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Drop Zone */}
          <DropZone
            onFiles={handleFiles}
            multiple={currentTab.multiple}
            disabled={isInfoBlocked || uploading}
          />

          {/* Staged (pending) files */}
          <AnimatePresence>
            {pendingFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden space-y-4"
              >
                {/* Staged header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 flex items-center gap-2">
                    <span className="w-2 h-2 bg-amber-500 rounded-full" />
                    Staged for upload
                    <span className="text-amber-600 dark:text-amber-400">({pendingFiles.length})</span>
                  </h3>
                  <button
                    onClick={() => setPendingFiles([])}
                    className="text-xs text-neutral-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  >
                    Clear all
                  </button>
                </div>

                {/* Staged grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  <AnimatePresence>
                    {pendingFiles.map((file, i) => (
                      <PendingFileCard
                        key={`${file.name}-${file.size}-${i}`}
                        file={file}
                        onRemove={() => setPendingFiles((p) => p.filter((_, idx) => idx !== i))}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {/* Upload CTA */}
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white font-semibold text-sm transition-all duration-200 shadow-md shadow-primary-500/20 hover:shadow-lg hover:shadow-primary-500/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {uploading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Uploading to S3…
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Upload {pendingFiles.length} Image{pendingFiles.length > 1 ? 's' : ''} to S3
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700" />
            <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              Live Banners
            </span>
            <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700" />
          </div>

          {/* Live images grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : liveBanners.length === 0 ? (
            <EmptyState tabLabel={currentTab.label.toLowerCase()} />
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {liveBanners.map((banner) => (
                  <LiveImageCard
                    key={banner.id}
                    banner={banner}
                    onDelete={handleDelete}
                    isDeleting={deletingId === banner.id}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Success summary row (only when there are live banners) */}
          {!isLoading && liveBanners.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-xs text-neutral-400 dark:text-neutral-500"
            >
              <CheckCircle2 size={13} className="text-emerald-500" />
              {liveBanners.length} active {currentTab.label.toLowerCase()}
              {liveBanners.length > 1 ? 's are' : ' is'} live on your site
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
