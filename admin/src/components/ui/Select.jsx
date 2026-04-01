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
            'w-full appearance-none rounded-xl border bg-white px-3.5 py-2.5 pr-10 text-sm text-neutral-800 transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500',
            'dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-100',
            error
              ? 'border-error-500 focus:ring-error-500/30'
              : 'border-neutral-200 dark:border-neutral-700',
            className
          )}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value ?? opt} value={opt.value ?? opt}>
              {opt.label ?? opt}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
      </div>
      {error && <p className="mt-1 text-xs text-error-500">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
