import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import productService from '@/api/product.service';
import toast from 'react-hot-toast';
import { Upload, FileSpreadsheet, CheckCircle } from 'lucide-react';

export default function BulkImport({ onClose }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

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
      setResult(res.data?.data || res.data);
      toast.success('Import successful!');
    } catch (err) {
      toast.error(err?.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={() => onClose(false)} title="Bulk Import Products" size="md">
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

            <div className="flex items-center gap-3 justify-end">
              <Button variant="ghost" onClick={() => onClose(false)}>Cancel</Button>
              <Button onClick={handleSubmit} loading={loading} disabled={!file}>
                Import Products
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <CheckCircle className="w-12 h-12 text-success-500 mx-auto mb-3" />
            <p className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
              Import Complete
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
              {result?.imported || result?.count || 0} products imported successfully
            </p>
            <Button onClick={() => onClose(true)}>Done</Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
