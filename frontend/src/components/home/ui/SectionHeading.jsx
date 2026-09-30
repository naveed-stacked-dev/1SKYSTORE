import { motion } from 'framer-motion';
import { revealUp, IN_VIEW } from '@/animations/variants';
import { cn } from '@/utils/cn';
import Eyebrow from './Eyebrow';
import MaskLines from './MaskLines';
import { DISPLAY_TITLE } from './styles';

const MotionP = motion.p;
const MotionDiv = motion.div;

/**
 * Eyebrow + masked display title + optional intro, with an optional slot
 * (tabs, arrows, links) aligned to the bottom-right on wide screens.
 */
export default function SectionHeading({
  eyebrow,
  index,
  lines,
  id,
  intro,
  tone = 'default',
  className,
  children,
}) {
  const deep = tone === 'deep';

  return (
    <div className={cn('flex flex-col gap-8 md:flex-row md:items-end md:justify-between', className)}>
      <div className="max-w-3xl">
        {eyebrow && (
          <Eyebrow index={index} tone={tone}>
            {eyebrow}
          </Eyebrow>
        )}
        <MaskLines
          id={id}
          lines={lines}
          className={cn(DISPLAY_TITLE, 'mt-5', deep ? 'text-on-deep' : 'text-ink')}
        />
        {intro && (
          <MotionP
            variants={revealUp}
            initial="hidden"
            whileInView="show"
            viewport={IN_VIEW}
            className={cn('mt-6 max-w-xl text-base leading-relaxed sm:text-lg', deep ? 'text-on-deep-soft' : 'text-ink-soft')}
          >
            {intro}
          </MotionP>
        )}
      </div>
      {children && (
        <MotionDiv
          variants={revealUp}
          initial="hidden"
          whileInView="show"
          viewport={IN_VIEW}
          className="flex shrink-0 flex-wrap items-center gap-3"
        >
          {children}
        </MotionDiv>
      )}
    </div>
  );
}
