import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, ChevronDown, LogOut } from 'lucide-react';
import { STORE_NAV, ACCOUNT_LINKS } from '@/constants/navigation';
import { useCategories } from '@/hooks/useStoreData';
import { categoryPath } from '@/utils/product';
import { cn } from '@/utils/cn';
import ThemeToggle from '@/components/common/ThemeToggle';
import { EASE } from './styles';

const MotionDiv = motion.div;
const MotionLi = motion.li;

/** Full-screen sheet for phones and tablets */
export default function MobileMenu({ id, open, onClose, user, isAuthenticated, onLogout }) {
  const { pathname } = useLocation();
  const categories = useCategories();
  const [showCategories, setShowCategories] = useState(false);
  const reduceMotion = useReducedMotion();
  // Curtain wipe by default; a plain fade for visitors who prefer less motion
  const sheetMotion = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { clipPath: 'inset(0% 0% 100% 0%)' },
        animate: { clipPath: 'inset(0% 0% 0% 0%)' },
        exit: { clipPath: 'inset(0% 0% 100% 0%)' },
      };

  // Lock page scroll and allow Escape while open
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Lets CSS tuck away floating widgets (WhatsApp) that would sit over the sheet
    document.documentElement.dataset.menuOpen = 'true';
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      delete document.documentElement.dataset.menuOpen;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <MotionDiv
          id={id}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          {...sheetMotion}
          transition={{ duration: reduceMotion ? 0.2 : 0.6, ease: EASE }}
          className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-canvas px-5 pb-8 pt-24 sm:px-8 lg:hidden"
        >
          <nav aria-label="Mobile">
            <ul className="divide-y divide-line border-b border-line">
              {STORE_NAV.map((item, i) => (
                <MotionLi
                  key={item.name}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.15 + i * 0.05, ease: EASE }}
                >
                  {item.menu ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowCategories((v) => !v)}
                        aria-expanded={showCategories}
                        className="flex min-h-16 w-full items-center justify-between font-display text-[1.75rem] font-medium tracking-[-0.03em] text-ink"
                      >
                        {item.name}
                        <ChevronDown
                          className={cn('h-6 w-6 text-ink-faint transition-transform duration-500', showCategories && 'rotate-180')}
                          aria-hidden="true"
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {showCategories && (
                          <MotionDiv
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: EASE }}
                            className="overflow-hidden"
                          >
                            <ul className="grid grid-cols-1 gap-x-4 pb-5 sm:grid-cols-2">
                              {(categories.data || []).map((name) => (
                                <li key={name}>
                                  <Link
                                    to={categoryPath(name)}
                                    onClick={onClose}
                                    className="flex min-h-11 items-center text-base text-ink-soft hover:text-ink"
                                  >
                                    {name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </MotionDiv>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      to={item.path}
                      onClick={onClose}
                      aria-current={pathname === item.path ? 'page' : undefined}
                      className="group flex min-h-16 items-center justify-between font-display text-[1.75rem] font-medium tracking-[-0.03em] text-ink"
                    >
                      <span className="flex items-center gap-3">
                        {item.name}
                        {pathname === item.path && <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />}
                      </span>
                      <ArrowUpRight className="h-5 w-5 text-ink-faint transition-transform group-hover:rotate-45" aria-hidden="true" />
                    </Link>
                  )}
                </MotionLi>
              ))}
            </ul>
          </nav>

          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 flex flex-1 flex-col"
          >
            {isAuthenticated ? (
              <>
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-ink-faint">
                  {user?.first_name ? `Hi, ${user.first_name}` : 'Your account'}
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {ACCOUNT_LINKS.map((link) => (
                    <li key={link.path}>
                      <Link
                        to={link.path}
                        onClick={onClose}
                        className="inline-flex min-h-11 items-center rounded-full px-5 text-sm font-medium text-ink ring-1 ring-inset ring-line"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        onLogout();
                        onClose();
                      }}
                      className="inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-medium text-error-600 ring-1 ring-inset ring-line dark:text-error-500"
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      Sign out
                    </button>
                  </li>
                </ul>
              </>
            ) : (
              <div className="flex gap-3">
                <Link
                  to="/login"
                  onClick={onClose}
                  className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-ink text-sm font-medium text-canvas"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  onClick={onClose}
                  className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full text-sm font-medium text-ink ring-1 ring-inset ring-line"
                >
                  Create account
                </Link>
              </div>
            )}

            <div className="mt-auto flex items-center justify-between pt-10">
              <p className="text-sm text-ink-faint">Appearance</p>
              <ThemeToggle className="ring-1 ring-inset ring-line" />
            </div>
          </MotionDiv>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
}
