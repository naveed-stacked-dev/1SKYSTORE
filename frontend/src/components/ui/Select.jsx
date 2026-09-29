import { forwardRef } from 'react';
import { cn } from '@/utils/cn';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(({
  className,
  label,
  error,
  options = [],
  placeholder = 'Select...',
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'w-full appearance-none rounded-xl border bg-white px-4 py-3 pr-10 text-sm text-neutral-800 transition-all duration-200 cursor-pointer',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500',
            'dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-100',
            error
              ? 'border-error-500'
              : 'border-neutral-200 dark:border-neutral-700',
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
      </div>
      {error && <p className="mt-1.5 text-xs text-error-500">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
