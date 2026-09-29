import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Pagination — shows ◀ [n-1] [n] [n+1] ▶
 * Only 3 page numbers are visible at any time.
 */
export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  // Calculate the 3-number window centered on current page
  let start = Math.max(1, page - 1);
  let end = start + 2;
  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - 2);
  }

  const pages = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="mt-10 flex items-center justify-center gap-1.5">
      {/* Previous arrow */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
          page <= 1
            ? 'text-neutral-300 dark:text-neutral-600 cursor-not-allowed'
            : 'text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-500'
        }`}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Page numbers */}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-10 h-10 rounded-xl text-sm font-medium transition-all duration-200 ${
            page === p
              ? 'bg-primary-500 text-white shadow-sm shadow-primary-500/30'
              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-500'
          }`}
        >
          {p}
        </button>
      ))}

      {/* Next arrow */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
          page >= totalPages
            ? 'text-neutral-300 dark:text-neutral-600 cursor-not-allowed'
            : 'text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-500'
        }`}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
