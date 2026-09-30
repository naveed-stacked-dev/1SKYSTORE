import { cn } from '@/utils/cn';

/** Small uppercase label above a section title */
export default function Eyebrow({ children, index, tone = 'default', className }) {
  return (
    <p
      className={cn(
        'inline-flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.22em]',
        tone === 'deep' ? 'text-on-deep-soft' : 'text-ink-faint',
        className
      )}
    >
      {index ? (
        <span className={cn('font-display tabular-nums', tone === 'deep' ? 'text-[#9EC3ED]' : 'text-accent')}>{index}</span>
      ) : (
        <span className={cn('h-1.5 w-1.5 rounded-full', tone === 'deep' ? 'bg-[#9EC3ED]' : 'bg-accent')} aria-hidden="true" />
      )}
      {children}
    </p>
  );
}
