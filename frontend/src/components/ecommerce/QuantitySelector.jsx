import { Minus, Plus } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function QuantitySelector({ value = 1, onChange, min = 1, max = 99, className }) {
  const decrease = () => {
    if (value > min) onChange(value - 1);
  };

  const increase = () => {
    if (value < max) onChange(value + 1);
  };

  return (
    <div className={cn('flex items-center border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden', className)}>
      <button
        onClick={decrease}
        disabled={value <= min}
        className="px-3 py-2 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <Minus className="w-4 h-4" />
      </button>
      <span className="px-4 py-2 text-sm font-medium text-neutral-800 dark:text-neutral-200 min-w-[3rem] text-center bg-white dark:bg-neutral-900">
        {value}
      </span>
      <button
        onClick={increase}
        disabled={value >= max}
        className="px-3 py-2 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
