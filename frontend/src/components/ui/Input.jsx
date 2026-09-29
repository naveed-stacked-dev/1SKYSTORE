import { forwardRef, useState } from 'react';
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
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          type={inputType}
          className={cn(
            'w-full rounded-xl border bg-white px-4 py-3 text-sm text-neutral-800 transition-all duration-200',
            'placeholder:text-neutral-400',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500',
            'dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-100 dark:placeholder:text-neutral-500',
            'dark:focus:ring-primary-500/30 dark:focus:border-primary-500',
            error
              ? 'border-error-500 focus:ring-error-500/30 focus:border-error-500'
              : 'border-neutral-200 dark:border-neutral-700',
            Icon && 'pl-10',
            isPassword && 'pr-10',
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
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
