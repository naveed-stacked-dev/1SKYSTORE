import { useState } from 'react';
import { cn } from '@/utils/cn';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  page = 1,
  totalPages = 1,
  onPageChange,
  onSort,
  sortBy,
  sortOrder,
  emptyMessage = 'No data found',
}) {
  const handleSort = (key) => {
    if (!onSort) return;
    const newOrder = sortBy === key && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(key, newOrder);
  };

  const renderSortIcon = (key) => {
    if (sortBy !== key) return <ChevronUp className="w-3 h-3 opacity-30" />;
    return sortOrder === 'asc'
      ? <ChevronUp className="w-3 h-3 text-primary-500" />
      : <ChevronDown className="w-3 h-3 text-primary-500" />;
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-100 dark:border-neutral-800">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400',
                    col.sortable && 'cursor-pointer select-none hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors'
                  )}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    {col.sortable && renderSortIcon(col.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800/50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key} className="px-5 py-4">
                      <div className="skeleton-shimmer h-4 rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center text-sm text-neutral-400 dark:text-neutral-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={row.id || i}
                  className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-5 py-3.5 text-sm text-neutral-700 dark:text-neutral-300">
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-neutral-100 dark:border-neutral-800">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPageChange?.(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange?.(pageNum)}
                  className={cn(
                    'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                    pageNum === page
                      ? 'bg-primary-500 text-white'
                      : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:text-neutral-400'
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange?.(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
