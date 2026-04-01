import { cn } from '@/utils/cn';

export default function Toggle({ checked, onChange, label, className }) {
  return (
    <label className={cn('inline-flex items-center gap-2.5 cursor-pointer', className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200',
          checked
            ? 'bg-primary-500'
            : 'bg-neutral-300 dark:bg-neutral-700'
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-sm',
            checked ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
      {label && (
        <span className="text-sm text-neutral-700 dark:text-neutral-300">{label}</span>
      )}
    </label>
  );
}
