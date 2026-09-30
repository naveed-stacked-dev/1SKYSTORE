import { forwardRef, useId, useState } from 'react';
import { cn } from '@/utils/cn';
import { Eye, EyeOff } from 'lucide-react';

const Input = forwardRef(({
  className,
  label,
  error,
  icon: Icon,
  type = 'text',
  ...props
}, ref) => {
  const generatedId = useId();
  const fieldId = props.id || generatedId;
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={fieldId} className="block text-[13px] font-medium text-ink-soft mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          id={fieldId}
          type={inputType}
          className={cn(
            'w-full min-h-12 rounded-2xl border bg-surface px-4 py-3 text-[15px] text-ink transition-[border-color,box-shadow] duration-200',
            'placeholder:text-ink-faint',
            'focus:outline-none focus:ring-4 focus:ring-accent/15 focus:border-accent',
            error
              ? 'border-error-500 focus:ring-error-500/15 focus:border-error-500'
              : 'border-line',
            Icon && 'pl-11',
            isPassword && 'pr-10',
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full text-ink-faint hover:text-ink hover:bg-ink/6 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-error-500">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
