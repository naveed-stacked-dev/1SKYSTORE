import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EASE_OUT } from '@/animations/variants';
import Accent from '@/components/home/ui/Accent';
import Eyebrow from '@/components/home/ui/Eyebrow';
import PillLink from '@/components/home/ui/PillLink';
import BrandWordmark from '@/components/common/BrandWordmark';
import globulesPortrait640 from '@/assets/home/globules-portrait-640.webp';

const MotionDiv = motion.div;
const MotionH1 = motion.h1;
const MotionP = motion.p;

export default function NotFound() {
  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-hidden bg-canvas text-ink">
      {/* Soft decorative halo behind the numerals */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 aspect-square w-[min(36rem,140vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,var(--c-accent-soft),transparent)] opacity-80"
      />

      <header className="mx-auto w-full max-w-[1360px] px-4 pt-6 sm:px-6 lg:px-10">
        <Link
          to="/"
          aria-label="1SKYSTORE home"
          className="inline-flex min-h-11 items-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          <BrandWordmark priority className="h-14" />
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <MotionDiv
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE_OUT }}
        >
          <Eyebrow>Page not found</Eyebrow>
        </MotionDiv>

        <div className="relative mt-6">
          <MotionDiv
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2, ease: EASE_OUT }}
            className="absolute left-1/2 top-1/2 -z-10 aspect-[3/4] w-[34vw] max-w-56 min-w-32 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full opacity-35 dark:opacity-25"
          >
            <img src={globulesPortrait640} alt="" decoding="async" className="h-full w-full object-cover" />
          </MotionDiv>

          <MotionH1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: EASE_OUT }}
            className="font-display text-[clamp(7rem,28vw,16rem)] font-medium leading-[0.85] tracking-[-0.06em] text-ink"
          >
            4<Accent className="px-[0.04em]">0</Accent>4
          </MotionH1>
        </div>

        <MotionP
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: EASE_OUT }}
          className="mt-6 max-w-md font-display text-[clamp(1.25rem,2.4vw,1.6rem)] leading-snug tracking-[-0.02em] text-ink-soft"
        >
          Oops! This page doesn't exist
        </MotionP>

        <MotionDiv
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: EASE_OUT }}
          className="mt-10"
        >
          <PillLink to="/">Go Home</PillLink>
        </MotionDiv>
      </main>
    </div>
  );
}
