import { cn } from '@/utils/cn';

/** Serif italic accent word inside a display heading */
export default function Accent({ children, tone = 'default', className }) {
  return (
    <em
      className={cn(
        'font-serif font-normal italic tracking-[-0.01em]',
        // A lighter blue keeps contrast on the midnight blocks in both themes
        tone === 'deep' ? 'text-[#9EC3ED]' : 'text-accent',
        className
      )}
    >
      {children}
    </em>
  );
}
