import { motion } from 'framer-motion';
import { revealGroup, revealLine, IN_VIEW } from '@/animations/variants';

const MotionSpan = motion.span;

/**
 * Heading whose lines rise out of a mask, one after another.
 * `lines` is an array of nodes — one per visual line.
 * `onMount` plays immediately (hero) instead of when scrolled into view.
 */
export default function MaskLines({
  as = 'h2',
  lines,
  className,
  id,
  delay = 0,
  stagger = 0.09,
  onMount = false,
}) {
  const Tag = as;
  const trigger = onMount
    ? { initial: 'hidden', animate: 'show' }
    : { initial: 'hidden', whileInView: 'show', viewport: IN_VIEW };

  return (
    <Tag id={id} className={className}>
      <MotionSpan className="block" variants={revealGroup(stagger, delay)} {...trigger}>
        {lines.map((line, i) => (
          // Padding inside the mask keeps descenders and italic overhang unclipped
          <span key={i} className="-mb-[0.14em] block overflow-hidden pb-[0.14em] pr-[0.08em]">
            <MotionSpan className="block" variants={revealLine}>
              {line}
              {/* Trailing space keeps the heading's text "line one line two"
                  for crawlers and screen readers; it collapses visually */}
              {i < lines.length - 1 && ' '}
            </MotionSpan>
          </span>
        ))}
      </MotionSpan>
    </Tag>
  );
}
