import { cn } from '@/utils/cn';

export default function Textarea({ className, label, error, rows = 4, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        className={cn(
          'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-neutral-800 transition-all duration-200 resize-none',
          'placeholder:text-neutral-400',
          'focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500',
          'dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-100 dark:placeholder:text-neutral-500',
          error
            ? 'border-error-500 focus:ring-error-500/30'
            : 'border-neutral-200 dark:border-neutral-700',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-error-500">{error}</p>}
    </div>
  );
}
