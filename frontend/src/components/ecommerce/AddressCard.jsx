import { useState } from 'react';
import { MapPin, Edit2, Trash2, Check, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

const ACTION =
  'inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-ink-soft transition-colors duration-300 ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50';

export default function AddressCard({ address, selected, onSelect, onEdit, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const phoneVal = address.phone || address.phone_enc;

  return (
    <div
      onClick={onSelect ? () => onSelect(address) : undefined}
      role={onSelect ? 'radio' : undefined}
      aria-checked={onSelect ? Boolean(selected) : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onKeyDown={
        onSelect
          ? (e) => {
              if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onSelect(address);
              }
            }
          : undefined
      }
      className={cn(
        'relative flex h-full flex-col rounded-[1.75rem] bg-surface p-5 transition-shadow duration-300 sm:p-6',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        onSelect && 'cursor-pointer',
        selected ? 'ring-2 ring-accent' : cn('ring-1 ring-line', onSelect && 'hover:ring-ink/25')
      )}
    >
      {onSelect && (
        <span
          className={cn(
            'absolute right-5 top-5 flex h-6 w-6 items-center justify-center rounded-full transition-colors duration-300',
            selected ? 'bg-accent text-canvas' : 'ring-1 ring-inset ring-line'
          )}
          aria-hidden="true"
        >
          {selected && <Check className="h-3.5 w-3.5" />}
        </span>
      )}
      {!onSelect && selected && (
        <span className="absolute right-5 top-5 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-canvas" aria-hidden="true">
          <Check className="h-3.5 w-3.5" />
        </span>
      )}

      <div className="flex flex-1 items-start gap-4">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors duration-300',
            selected ? 'bg-accent-soft text-accent' : 'bg-mist text-ink-soft'
          )}
        >
          <MapPin className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1 pr-8">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[15px] font-medium text-ink">{address.full_name}</p>
            {address.is_default && (
              <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">
                Default
              </span>
            )}
          </div>
          {phoneVal && (
            <p className="mt-1 text-sm tabular-nums text-ink-faint">{phoneVal}</p>
          )}
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {address.address_line1}
            {address.address_line2 && `, ${address.address_line2}`}
            {address.landmark && (
              <>
                <br />
                <span className="text-ink-faint">Landmark: {address.landmark}</span>
              </>
            )}
            <br />
            {address.city}, {address.state} {address.postal_code}
            <br />
            {address.country}
          </p>
        </div>
      </div>

      {(onEdit || onDelete) && (
        <div className="mt-5 flex items-center gap-2 border-t border-line pt-3">
          {onEdit && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onEdit(address); }}
              className={cn(ACTION, '-ml-3 hover:text-ink')}
            >
              <Edit2 className="h-3.5 w-3.5" aria-hidden="true" /> Edit
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              disabled={isDeleting}
              onClick={async (e) => {
                e.stopPropagation();
                setIsDeleting(true);
                try {
                  await onDelete(address.id);
                } finally {
                  // If the component gets unmounted by parent on delete, this might not run, which is fine
                  setIsDeleting(false);
                }
              }}
              className={cn(ACTION, '-mr-3 ml-auto hover:text-error-500')}
            >
              {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />}
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
