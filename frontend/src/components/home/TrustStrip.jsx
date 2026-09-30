import { motion } from 'framer-motion';
import { Leaf, LockKeyhole, MessagesSquare, ShieldCheck, Truck } from 'lucide-react';
import { revealGroup, revealUp, IN_VIEW } from '@/animations/variants';
import { cn } from '@/utils/cn';
import { CONTAINER } from './ui/styles';

const MotionUl = motion.ul;
const MotionLi = motion.li;

const PROMISES = [
  { icon: ShieldCheck, title: 'Authentic products', text: 'Sealed stock from established brands' },
  { icon: LockKeyhole, title: 'Secure payments', text: 'Encrypted, trusted checkout' },
  { icon: Truck, title: 'Fast delivery', text: 'Tracked to your door' },
  { icon: Leaf, title: 'Trusted homeopathy', text: 'Dilutions to mother tinctures' },
  { icon: MessagesSquare, title: 'Real support', text: 'Talk to us on WhatsApp' },
];

function TrustItem({ icon, title, text, nowrap = false }) {
  const Icon = icon;
  return (
    <div className="group flex items-center gap-3.5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-accent ring-1 ring-inset ring-line transition-colors duration-500 group-hover:bg-accent group-hover:text-white">
        <Icon className="h-[18px] w-[18px] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-rotate-12 group-hover:scale-110" aria-hidden="true" />
      </span>
      <span>
        <span className={cn('block font-display text-[15px] font-medium text-ink', nowrap && 'whitespace-nowrap')}>{title}</span>
        <span className={cn('block text-[13px] leading-snug text-ink-faint', nowrap && 'whitespace-nowrap')}>{text}</span>
      </span>
    </div>
  );
}

export default function TrustStrip() {
  return (
    <section aria-label="Why shop with us" className="border-y border-line bg-canvas">
      {/* Wide screens: one calm row, each promise settling in turn */}
      <div className={`${CONTAINER} hidden xl:block`}>
        <MotionUl
          variants={revealGroup(0.08)}
          initial="hidden"
          whileInView="show"
          viewport={IN_VIEW}
          className="grid grid-cols-5 divide-x divide-line"
        >
          {PROMISES.map((p) => (
            <MotionLi key={p.title} variants={revealUp} className="flex justify-center px-4 py-7 first:justify-start first:pl-0 last:justify-end last:pr-0">
              <TrustItem {...p} />
            </MotionLi>
          ))}
        </MotionUl>
      </div>

      {/* Narrow screens: a slow ticker (pauses on touch/hover, static with reduced motion) */}
      <div className="mask-fade-x overflow-hidden py-5 motion-reduce:overflow-x-auto xl:hidden">
        <ul className="animate-marquee flex w-max gap-10 pr-10 [--marquee-duration:36s]">
          {[...PROMISES, ...PROMISES].map((p, i) => (
            <li key={`${p.title}-${i}`} aria-hidden={i >= PROMISES.length || undefined}>
              <TrustItem {...p} nowrap />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
