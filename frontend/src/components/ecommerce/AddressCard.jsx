import { useState } from 'react';
import { MapPin, Edit2, Trash2, Check, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function AddressCard({ address, selected, onSelect, onEdit, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const phoneVal = address.phone || address.phone_enc;

  return (
    <div
      onClick={onSelect ? () => onSelect(address) : undefined}
      className={cn(
        'relative p-5 rounded-2xl border-2 transition-all',
        onSelect && 'cursor-pointer',
        selected
          ? 'border-primary-500 bg-primary-50/30 dark:bg-primary-900/10'
          : 'border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-200 dark:hover:border-neutral-700'
      )}
    >
      {selected && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
          <Check className="w-3.5 h-3.5 text-white" />
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
          <MapPin className="w-4 h-4 text-neutral-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100">{address.full_name}</p>
          {phoneVal && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">{phoneVal}</p>
          )}
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
            {address.address_line1}
            {address.address_line2 && `, ${address.address_line2}`}
            <br />
            {address.city}, {address.state} {address.postal_code}
            <br />
            {address.country}
          </p>
          {address.is_default && (
            <span className="inline-block mt-2 text-[10px] font-medium text-primary-500 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded-md">
              Default
            </span>
          )}
        </div>
      </div>

      {(onEdit || onDelete) && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(address); }}
              className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-primary-500 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
          )}
          {onDelete && (
            <button
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
              className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-error-500 disabled:opacity-50 transition-colors ml-auto"
            >
              {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
