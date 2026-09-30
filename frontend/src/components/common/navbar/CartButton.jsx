import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { subscribeCartFly } from '@/utils/cartFly';
import { ICON_BUTTON, EASE } from './styles';

const MotionSpan = motion.span;
const MotionImg = motion.img;

export default function CartButton() {
  const { itemCount } = useCart();
  const target = useRef(null);
  const reduceMotion = useReducedMotion();
  const bump = useAnimationControls();
  const [flights, setFlights] = useState([]);
  const lastCount = useRef(itemCount);

  // A small bounce whenever the count goes up
  useEffect(() => {
    if (itemCount > lastCount.current && !reduceMotion) {
      bump.start({ scale: [1, 1.22, 1], transition: { duration: 0.5, ease: EASE } });
    }
    lastCount.current = itemCount;
  }, [itemCount, bump, reduceMotion]);

  // Product cards announce an add; draw the packshot flying into the bag
  useEffect(() => {
    if (reduceMotion) return undefined;
    return subscribeCartFly(({ src, rect }) => {
      const end = target.current?.getBoundingClientRect();
      if (!end || !src) return;
      const size = Math.min(rect.width, rect.height, 220);
      // If the bar is tucked away mid-scroll it is sliding back in right now;
      // aim for where the bag will land rather than where it is
      const endTop = end.top < 0 ? 20 : end.top;
      setFlights((list) => [
        ...list,
        {
          id: `${Date.now()}-${Math.random()}`,
          src,
          size,
          from: { x: rect.left + rect.width / 2 - size / 2, y: rect.top + rect.height / 2 - size / 2 },
          to: { x: end.left + end.width / 2 - size / 2, y: endTop + end.height / 2 - size / 2 },
        },
      ]);
    });
  }, [reduceMotion]);

  const land = (id) => setFlights((list) => list.filter((f) => f.id !== id));

  return (
    <>
      <Link
        ref={target}
        to="/cart"
        className={ICON_BUTTON}
        aria-label={itemCount > 0 ? `Cart, ${itemCount} item${itemCount === 1 ? '' : 's'}` : 'Cart'}
      >
        <MotionSpan animate={bump} className="flex">
          <ShoppingBag className="h-4.5 w-4.5" aria-hidden="true" />
        </MotionSpan>
        <AnimatePresence>
          {itemCount > 0 && (
            <MotionSpan
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 28 }}
              className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold tabular-nums text-white ring-2 ring-canvas"
              aria-hidden="true"
            >
              {itemCount > 99 ? '99+' : itemCount}
            </MotionSpan>
          )}
        </AnimatePresence>
      </Link>

      {flights.length > 0 &&
        createPortal(
          flights.map((f) => (
            <MotionImg
              key={f.id}
              src={f.src}
              alt=""
              aria-hidden="true"
              initial={{ x: f.from.x, y: f.from.y, scale: 1, opacity: 1, borderRadius: 28 }}
              animate={{
                x: [f.from.x, (f.from.x + f.to.x) / 2, f.to.x],
                y: [f.from.y, Math.min(f.from.y, f.to.y) - 80, f.to.y],
                scale: [1, 0.55, 0.08],
                opacity: [1, 1, 0.2],
                borderRadius: 999,
              }}
              transition={{ duration: 0.85, ease: [0.55, 0, 0.35, 1] }}
              onAnimationComplete={() => land(f.id)}
              style={{ width: f.size, height: f.size }}
              className="pointer-events-none fixed left-0 top-0 z-[70] bg-plate object-contain p-3 shadow-2xl"
            />
          )),
          document.body
        )}
    </>
  );
}
