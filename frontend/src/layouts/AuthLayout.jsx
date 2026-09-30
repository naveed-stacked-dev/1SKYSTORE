import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, Truck, Lock } from 'lucide-react';
import { EASE_OUT } from '@/animations/variants';
import BrandWordmark from '@/components/common/BrandWordmark';
import Accent from '@/components/home/ui/Accent';
import globulesPortrait640 from '@/assets/home/globules-portrait-640.webp';
import globulesPortrait980 from '@/assets/home/globules-portrait-980.webp';

const MotionDiv = motion.div;

const AUTH_HIGHLIGHTS = [
  { icon: ShieldCheck, text: '100% genuine products from trusted brands' },
  { icon: Truck, text: 'Fast delivery across India' },
  { icon: Lock, text: 'Secure checkout & payments' },
];

const FOCUS_RING = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent';

export default function AuthLayout() {
  return (
    <div className="min-h-svh bg-canvas text-ink transition-colors duration-300 lg:grid lg:grid-cols-2 lg:gap-3 lg:p-3">
      {/* Left — Brand panel (desktop only) */}
      <aside className="relative isolate hidden overflow-hidden rounded-[2rem] bg-deep lg:sticky lg:top-3 lg:flex lg:h-[calc(100svh-1.5rem)] lg:min-h-[640px] lg:flex-col lg:justify-between lg:p-10 xl:p-14">
        <MotionDiv
          aria-hidden="true"
          className="absolute inset-0 -z-10"
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.8, ease: EASE_OUT }}
        >
          <img
            src={globulesPortrait980}
            srcSet={`${globulesPortrait640} 640w, ${globulesPortrait980} 784w`}
            sizes="50vw"
            alt=""
            decoding="async"
            className="h-full w-full object-cover object-[50%_40%] opacity-70"
          />
        </MotionDiv>
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,var(--c-deep)_12%,color-mix(in_srgb,var(--c-deep)_78%,transparent)_48%,color-mix(in_srgb,var(--c-deep)_25%,transparent))]"
        />

        <Link
          to="/"
          aria-label="1SKYSTORE home"
          className={`inline-flex items-center self-start rounded-2xl ${FOCUS_RING}`}
        >
          <BrandWordmark priority className="h-16 xl:h-20" />
        </Link>

        <MotionDiv
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: EASE_OUT }}
          className="max-w-lg"
        >
          <h2 className="font-display text-[clamp(2.5rem,3.6vw,3.75rem)] font-medium leading-[0.98] tracking-[-0.035em] text-on-deep">
            Natural wellness,
            <br />
            delivered to <Accent tone="deep">you.</Accent>
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-on-deep-soft xl:text-[17px]">
            Premium homeopathy remedies and holistic health solutions from trusted brands worldwide.
          </p>

          <ul className="mt-10 max-w-md divide-y divide-on-deep/12 border-y border-on-deep/12">
            {AUTH_HIGHLIGHTS.map(({ icon, text }) => {
              const Icon = icon;
              return (
                <li key={text} className="flex items-center gap-4 py-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-1 ring-inset ring-on-deep/20 text-[#9EC3ED]">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="text-[15px] text-on-deep">{text}</span>
                </li>
              );
            })}
          </ul>
        </MotionDiv>
      </aside>

      {/* Right — Form area */}
      <main className="relative isolate flex min-h-svh flex-col overflow-hidden lg:min-h-0">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-[30%] -top-[25%] -z-10 h-[70vmax] w-[70vmax] rounded-full bg-[radial-gradient(closest-side,var(--c-accent-soft),transparent)] opacity-70"
        />

        <header className="flex items-center justify-between gap-4 px-4 pt-5 sm:px-8 sm:pt-7 lg:justify-end lg:px-10 lg:pt-7">
          <Link
            to="/"
            aria-label="1SKYSTORE home"
            className={`inline-flex min-h-11 items-center rounded-md lg:hidden ${FOCUS_RING}`}
          >
            <BrandWordmark priority className="h-11" />
          </Link>
          <Link
            to="/"
            className={`group inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-medium text-ink-soft ring-1 ring-inset ring-line transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-ink hover:text-canvas ${FOCUS_RING}`}
          >
            <ArrowLeft
              className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5"
              aria-hidden="true"
            />
            Back to store
          </Link>
        </header>

        <div className="flex flex-1 items-center justify-center px-4 pb-14 pt-10 sm:px-8 sm:pb-16 lg:px-10 lg:py-16">
          <MotionDiv
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE_OUT }}
          >
            <Outlet />
          </MotionDiv>
        </div>
      </main>
    </div>
  );
}
