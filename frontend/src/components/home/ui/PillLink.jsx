import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/utils/cn';

const TONES = {
  // Midnight pill — the primary action on light surfaces
  solid: {
    pill: 'bg-ink text-canvas hover:bg-accent',
    chip: 'bg-canvas text-ink',
  },
  // For dark sections
  light: {
    pill: 'bg-on-deep text-deep hover:bg-accent-soft',
    chip: 'bg-deep text-on-deep',
  },
  outline: {
    pill: 'text-ink ring-1 ring-inset ring-line hover:bg-ink hover:text-canvas',
    chip: 'bg-ink text-canvas',
  },
};

/**
 * Pill CTA with an arrow chip. On hover the arrow exits top-right and a
 * fresh one slides in from bottom-left. Pass `to` (route) or `href` (anchor).
 */
export default function PillLink({ to, href, tone = 'solid', className, children, ...rest }) {
  const styles = TONES[tone] || TONES.solid;
  const classes = cn(
    'group inline-flex min-h-12 items-center gap-4 rounded-full py-1.5 pl-6 pr-1.5 text-[15px] font-medium',
    'transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
    'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent',
    styles.pill,
    className
  );

  const content = (
    <>
      <span>{children}</span>
      <span
        className={cn('relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full', styles.chip)}
        aria-hidden="true"
      >
        <ArrowUpRight className="h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-6 group-hover:translate-x-6" />
        <ArrowUpRight className="absolute h-4 w-4 -translate-x-6 translate-y-6 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0 group-hover:translate-y-0" />
      </span>
    </>
  );

  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {content}
      </a>
    );
  }

  return (
    <Link to={to} className={classes} {...rest}>
      {content}
    </Link>
  );
}

/** Quiet text link with an underline that draws in on hover */
export function TextLink({ to, href, className, children, ...rest }) {
  const classes = cn(
    'group inline-flex items-center gap-1.5 text-[15px] font-medium text-ink',
    'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent',
    className
  );
  const content = (
    <>
      <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:bg-[length:100%_1px]">
        {children}
      </span>
      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
    </>
  );

  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {content}
      </a>
    );
  }
  return (
    <Link to={to} className={classes} {...rest}>
      {content}
    </Link>
  );
}
