import { motion } from 'framer-motion';
import { EASE_OUT } from '@/animations/variants';
import { cn } from '@/utils/cn';
import MaskLines from '@/components/home/ui/MaskLines';
import Accent from '@/components/home/ui/Accent';
import Eyebrow from '@/components/home/ui/Eyebrow';
import { CONTAINER } from '@/components/home/ui/styles';

const MotionDiv = motion.div;

/**
 * Editorial page header shared by inner pages: eyebrow, a display h1 whose
 * optional `accent` word is set in the serif italic, an intro line and an
 * optional actions slot (buttons, filters) on the right.
 */
export default function PageHeader({ eyebrow, title, accent, intro, children, className, size = 'md' }) {
  const lines = accent ? [title, <Accent key="accent">{accent}</Accent>] : [title];

  return (
    <header className={cn(CONTAINER, 'pb-10 pt-10 sm:pb-14 sm:pt-14', className)}>
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <MaskLines
            as="h1"
            onMount
            delay={0.05}
            lines={lines}
            className={cn(
              'font-display font-medium leading-[0.98] tracking-[-0.04em] text-ink',
              eyebrow && 'mt-5',
              size === 'sm' ? 'text-[clamp(2rem,4vw,3rem)]' : 'text-[clamp(2.4rem,5.5vw,4.5rem)]'
            )}
          />
          {intro && (
            <MotionDiv
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: EASE_OUT }}
              className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg"
            >
              {intro}
            </MotionDiv>
          )}
        </div>
        {children && (
          <MotionDiv
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: EASE_OUT }}
            className="flex shrink-0 flex-wrap items-center gap-3"
          >
            {children}
          </MotionDiv>
        )}
      </div>
    </header>
  );
}
