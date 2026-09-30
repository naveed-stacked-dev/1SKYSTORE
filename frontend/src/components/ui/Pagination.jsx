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
        className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors duration-300 ${
          page <= 1
            ? 'text-ink/25 ring-1 ring-inset ring-line cursor-not-allowed'
            : 'text-ink ring-1 ring-inset ring-line hover:bg-ink hover:text-canvas'
        }`}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Page numbers */}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          aria-current={page === p ? 'page' : undefined}
          className={`w-11 h-11 rounded-full text-sm font-medium tabular-nums transition-colors duration-300 ${
            page === p
              ? 'bg-ink text-canvas'
              : 'text-ink-soft hover:bg-ink/6 hover:text-ink'
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
        className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors duration-300 ${
          page >= totalPages
            ? 'text-ink/25 ring-1 ring-inset ring-line cursor-not-allowed'
            : 'text-ink ring-1 ring-inset ring-line hover:bg-ink hover:text-canvas'
        }`}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
