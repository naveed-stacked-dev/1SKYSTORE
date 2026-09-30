// Framer Motion reusable animation variants

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.4, ease: 'easeOut' },
};

export const slideUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 30 },
  transition: { duration: 0.5, ease: 'easeOut' },
};

export const slideDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: 'easeOut' },
};

export const slideLeft = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 30 },
  transition: { duration: 0.4, ease: 'easeOut' },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.3, ease: 'easeOut' },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut' },
};

export const hoverScale = {
  whileHover: { scale: 1.03, transition: { duration: 0.2 } },
  whileTap: { scale: 0.98 },
};

export const hoverLift = {
  whileHover: { y: -4, transition: { duration: 0.2 } },
  whileTap: { y: 0 },
};

export const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.35, ease: 'easeInOut' },
};

export const modalOverlay = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
};

export const modalContent = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 10 },
  transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
};

export const drawerSlide = {
  initial: { x: '-100%' },
  animate: { x: 0 },
  exit: { x: '-100%' },
  transition: { type: 'spring', damping: 30, stiffness: 300 },
};

// ─── Storefront motion system ────────────────────────────────────────────────
// One easing family keeps the homepage calm and consistent: long, soft
// deceleration for reveals; a symmetric curve for things that move and return.

export const EASE_OUT = [0.22, 1, 0.36, 1];
export const EASE_IN_OUT = [0.65, 0, 0.35, 1];

// Parent that staggers `reveal*` children once it scrolls into view
export const revealGroup = (stagger = 0.08, delay = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

export const revealUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE_OUT } },
};

export const revealFade = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 1, ease: EASE_OUT } },
};

// Text line rising out of an overflow-hidden mask
export const revealLine = {
  hidden: { y: '110%' },
  show: { y: '0%', transition: { duration: 1.05, ease: EASE_OUT } },
};

// Image uncovered from the bottom edge upward
export const revealClip = {
  hidden: { clipPath: 'inset(100% 0% 0% 0%)' },
  show: { clipPath: 'inset(0% 0% 0% 0%)', transition: { duration: 1.3, ease: EASE_IN_OUT } },
};

export const IN_VIEW = { once: true, amount: 0.25 };
