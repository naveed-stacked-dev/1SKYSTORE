import { useMemo, useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import productService from '@/api/product.service';
import toast from 'react-hot-toast';
import { Upload, FileSpreadsheet, PlusCircle, RefreshCw, MinusCircle, AlertCircle } from 'lucide-react';

// Row outcomes returned by POST /admin/products/bulk-import, in display order.
const STATUS_META = {
  added: { label: 'Added', badge: 'success', icon: PlusCircle, tone: 'text-success-500' },
  updated: { label: 'Updated', badge: 'info', icon: RefreshCw, tone: 'text-info-500' },
  unchanged: { label: 'Already exists', badge: 'default', icon: MinusCircle, tone: 'text-neutral-400' },
  failed: { label: 'Failed', badge: 'error', icon: AlertCircle, tone: 'text-error-500' },
};

const STATUS_ORDER = ['added', 'updated', 'unchanged', 'failed'];

/** Turn the changed sheet columns into something readable: "price_usd" -> "Price Usd". */
const prettyColumn = (col) =>
  col.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

function SummaryTile({ status, count }) {
  const { label, icon: Icon, tone } = STATUS_META[status];
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-3 text-center">
      <Icon className={`w-5 h-5 mx-auto mb-1 ${count > 0 ? tone : 'text-neutral-300 dark:text-neutral-600'}`} />
      <p className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">{count}</p>
      <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{label}</p>
    </div>
  );
}

function ResultRow({ item }) {
  const meta = STATUS_META[item.status] || STATUS_META.unchanged;
  return (
    <li className="flex items-start gap-3 px-3 py-2 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
      <span className="text-[11px] text-neutral-400 w-10 shrink-0 pt-0.5">#{item.row}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-neutral-800 dark:text-neutral-200 truncate">
          {item.name || item.sku || 'Unnamed row'}
        </p>
        <p className="text-xs text-neutral-400 truncate">
          {item.sku ? `SKU ${item.sku}` : 'No SKU'}
          {item.status === 'updated' && item.changes?.length > 0 && (
            <> &middot; changed: {item.changes.map(prettyColumn).join(', ')}</>
          )}
          {item.status === 'failed' && item.message && <> &middot; {item.message}</>}
        </p>
      </div>
      <Badge variant={meta.badge} className="shrink-0">{meta.label}</Badge>
    </li>
  );
}

export default function BulkImport({ onClose }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [filter, setFilter] = useState('all');

  const counts = useMemo(() => ({
    added: result?.added_count || 0,
    updated: result?.updated_count || 0,
    unchanged: result?.unchanged_count || 0,
    failed: result?.failed_count ?? result?.error_count ?? 0,
  }), [result]);

  const rows = result?.results || [];
  const visibleRows = filter === 'all' ? rows : rows.filter((r) => r.status === filter);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      const ext = selected.name.split('.').pop()?.toLowerCase();
      if (!['xlsx', 'xls', 'csv'].includes(ext)) {
        toast.error('Please upload an XLSX, XLS, or CSV file');
        return;
      }
      setFile(selected);
      setResult(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await productService.bulkImport(formData);
      const data = res.data?.data || res.data;
      setResult(data);
      setFilter('all');

      const parts = [
        data?.added_count ? `${data.added_count} added` : null,
        data?.updated_count ? `${data.updated_count} updated` : null,
        data?.unchanged_count ? `${data.unchanged_count} already up to date` : null,
      ].filter(Boolean);
      const failed = data?.failed_count ?? data?.error_count ?? 0;

      if (failed > 0) {
        toast.error(`${failed} row${failed === 1 ? '' : 's'} failed${parts.length ? ` — ${parts.join(', ')}` : ''}`);
      } else {
        toast.success(parts.length ? `Import complete — ${parts.join(', ')}` : 'Import complete — nothing to change');
      }
    } catch (err) {
      toast.error(err?.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  // Only refresh the product list when the import actually wrote something.
  const didWrite = counts.added > 0 || counts.updated > 0;

  return (
    <Modal isOpen onClose={() => onClose(didWrite)} title="Bulk Import Products" size={result ? 'lg' : 'md'}>
      <div className="space-y-5">
        {!result ? (
          <>
            <div className="border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-2xl p-8 text-center">
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <FileSpreadsheet className="w-10 h-10 text-success-500" />
                  <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{file.name}</p>
                  <p className="text-xs text-neutral-400">{(file.size / 1024).toFixed(1)} KB</p>
                  <button
                    onClick={() => setFile(null)}
                    className="text-xs text-error-500 hover:text-error-600 mt-1"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center gap-2 cursor-pointer">
                  <Upload className="w-10 h-10 text-neutral-300 dark:text-neutral-600" />
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-neutral-400">XLSX, XLS, or CSV</p>
                  <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileChange} />
                </label>
              )}
            </div>

            <p className="text-xs text-neutral-400 text-center">
              Rows are matched by <span className="font-medium">id</span> (or <span className="font-medium">sku</span>)
              and only the fields you actually changed are written — re-uploading an unedited export changes nothing.
            </p>

            <div className="flex items-center gap-3 justify-end">
              <Button variant="ghost" onClick={() => onClose(false)}>Cancel</Button>
              <Button onClick={handleSubmit} loading={loading} disabled={!file}>
                Import Products
              </Button>
            </div>
          </>
        ) : (
          <>
            <div>
              <p className="text-base font-semibold text-neutral-800 dark:text-neutral-200">Import Complete</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {result.total_rows || 0} row{result.total_rows === 1 ? '' : 's'} processed from {result.filename}
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {STATUS_ORDER.map((status) => (
                <SummaryTile key={status} status={status} count={counts[status]} />
              ))}
            </div>

            {rows.length > 0 && (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  {['all', ...STATUS_ORDER.filter((s) => counts[s] > 0)].map((key) => (
                    <button
                      key={key}
                      onClick={() => setFilter(key)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        filter === key
                          ? 'bg-primary-500 text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
                      }`}
                    >
                      {key === 'all' ? `All (${rows.length})` : `${STATUS_META[key].label} (${counts[key]})`}
                    </button>
                  ))}
                </div>

                <ul className="max-h-72 overflow-y-auto rounded-xl border border-neutral-200 dark:border-neutral-700">
                  {visibleRows.map((item) => <ResultRow key={item.row} item={item} />)}
                  {visibleRows.length === 0 && (
                    <li className="px-3 py-6 text-center text-xs text-neutral-400">No rows in this group</li>
                  )}
                </ul>

                {result.results_truncated && (
                  <p className="text-xs text-neutral-400">
                    Showing the first {rows.length} rows only — the counts above cover the whole file.
                  </p>
                )}
              </>
            )}

            <div className="flex justify-end">
              <Button onClick={() => onClose(didWrite)}>Done</Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
