import { Minus, Plus } from 'lucide-react';
import { cn } from '@/utils/cn';

const STEP =
  'flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors duration-300 ' +
  'hover:bg-ink/6 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

export default function QuantitySelector({ value = 1, onChange, min = 1, max = 99, className }) {
  const decrease = () => {
    if (value > min) onChange(value - 1);
  };

  const increase = () => {
    if (value < max) onChange(value + 1);
  };

  return (
    <div className={cn('inline-flex items-center rounded-full ring-1 ring-inset ring-line', className)}>
      <button type="button" onClick={decrease} disabled={value <= min} aria-label="Decrease quantity" className={STEP}>
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>
      <span className="min-w-8 text-center text-[15px] font-medium tabular-nums text-ink" aria-live="polite">
        {value}
      </span>
      <button type="button" onClick={increase} disabled={value >= max} aria-label="Increase quantity" className={STEP}>
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
