import { forwardRef, useId } from 'react';
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
  const generatedId = useId();
  const fieldId = props.id || generatedId;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={fieldId} className="block text-[13px] font-medium text-ink-soft mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={fieldId}
          className={cn(
            'w-full min-h-12 appearance-none rounded-2xl border bg-surface px-4 py-3 pr-10 text-[15px] text-ink transition-[border-color,box-shadow] duration-200 cursor-pointer',
            'focus:outline-none focus:ring-4 focus:ring-accent/15 focus:border-accent',
            error
              ? 'border-error-500'
              : 'border-line',
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
        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none" />
      </div>
      {error && <p className="mt-1.5 text-xs text-error-500">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
