import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { revealUp, IN_VIEW } from '@/animations/variants';
import MaskLines from './ui/MaskLines';
import Accent from './ui/Accent';
import Eyebrow from './ui/Eyebrow';
import PillLink, { TextLink } from './ui/PillLink';
import globules960 from '@/assets/home/globules-960.webp';
import globules1920 from '@/assets/home/globules-1920.webp';

const MotionDiv = motion.div;
const MotionImg = motion.img;
const MotionP = motion.p;

export default function FinalCTA() {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] });
  const depth = reduceMotion ? 0 : 1;
  const scale = useTransform(scrollYProgress, [0, 0.7], [1 - 0.06 * depth, 1]);
  const photoY = useTransform(scrollYProgress, [0, 1], [-80 * depth, 0]);

  return (
    <section ref={ref} aria-labelledby="cta-title" className="bg-canvas px-3 pb-3 pt-4 sm:px-5 sm:pb-5">
      <MotionDiv
        style={{ scale }}
        className="relative isolate overflow-hidden rounded-[2rem] bg-deep px-6 py-24 text-center sm:rounded-[2.75rem] sm:py-32 lg:py-44"
      >
        <MotionImg
          style={{ y: photoY }}
          src={globules1920}
          srcSet={`${globules960} 960w, ${globules1920} 1920w`}
          sizes="100vw"
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-x-0 -top-[10%] -z-10 h-[125%] w-full object-cover opacity-30 mix-blend-luminosity"
        />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(14,23,38,0.35),rgba(14,23,38,0.92)_75%)]" aria-hidden="true" />
        {!reduceMotion && (
          <MotionDiv
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 -z-10 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(107,164,226,0.28),transparent)]"
            animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        <div className="mx-auto flex max-w-4xl flex-col items-center">
          <Eyebrow tone="deep">Begin today</Eyebrow>
          <MaskLines
            id="cta-title"
            lines={['Your wellness journey', <>starts <Accent key="h" tone="deep">here.</Accent></>]}
            className="mt-6 font-display text-[clamp(2.5rem,7vw,6.25rem)] font-medium leading-[0.95] tracking-[-0.045em] text-on-deep"
          />
          <MotionP
            variants={revealUp}
            initial="hidden"
            whileInView="show"
            viewport={IN_VIEW}
            className="mt-7 max-w-lg text-base leading-relaxed text-on-deep-soft sm:text-lg"
          >
            Genuine homeopathic remedies and everyday essentials, delivered with care. Find what's right for you.
          </MotionP>
          <MotionDiv
            variants={revealUp}
            initial="hidden"
            whileInView="show"
            viewport={IN_VIEW}
            className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4"
          >
            <PillLink to="/shop" tone="light">
              Explore the store
            </PillLink>
            <TextLink to="/contact" className="text-on-deep">
              Talk to us
            </TextLink>
          </MotionDiv>
        </div>
      </MotionDiv>
    </section>
  );
}
