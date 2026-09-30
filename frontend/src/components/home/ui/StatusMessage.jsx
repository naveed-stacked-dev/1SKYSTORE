import { RotateCcw } from 'lucide-react';
import { cn } from '@/utils/cn';
import { TextLink } from './PillLink';

/**
 * Calm inline state for a section whose data failed or came back empty.
 * Pass `onRetry` for errors; `action` ({ to, label }) for empty states.
 */
export default function StatusMessage({ title, text, onRetry, action, tone = 'default', className }) {
  const deep = tone === 'deep';

  return (
    <div
      role={onRetry ? 'alert' : 'status'}
      className={cn(
        'flex flex-col items-start gap-4 rounded-[1.75rem] border border-dashed p-8 sm:flex-row sm:items-center sm:justify-between',
        deep ? 'border-on-deep/15' : 'border-line',
        className
      )}
    >
      <div>
        <p className={cn('font-display text-lg font-medium', deep ? 'text-on-deep' : 'text-ink')}>{title}</p>
        {text && <p className={cn('mt-1 text-sm', deep ? 'text-on-deep-soft' : 'text-ink-soft')}>{text}</p>}
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className={cn(
            'group inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-medium ring-1 ring-inset transition-colors',
            deep ? 'text-on-deep ring-on-deep/20 hover:bg-on-deep hover:text-deep' : 'text-ink ring-line hover:bg-ink hover:text-canvas'
          )}
        >
          <RotateCcw className="h-4 w-4 transition-transform duration-500 group-hover:-rotate-180" aria-hidden="true" />
          Try again
        </button>
      )}
      {!onRetry && action && (
        <TextLink to={action.to} className={deep ? 'text-on-deep' : undefined}>
          {action.label}
        </TextLink>
      )}
    </div>
  );
}
