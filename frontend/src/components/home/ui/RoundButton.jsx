import { cn } from '@/utils/cn';

/** 48px circular icon button used for carousel controls */
export default function RoundButton({ label, disabled, onClick, children, tone = 'default' }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'group flex h-12 w-12 items-center justify-center rounded-full ring-1 ring-inset transition-all duration-300',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        'disabled:cursor-default disabled:opacity-35',
        tone === 'deep'
          ? 'text-on-deep ring-on-deep/20 enabled:hover:bg-on-deep enabled:hover:text-deep'
          : 'text-ink ring-line enabled:hover:bg-ink enabled:hover:text-canvas'
      )}
    >
      <span className="transition-transform duration-300 group-enabled:group-hover:scale-110" aria-hidden="true">
        {children}
      </span>
    </button>
  );
}
