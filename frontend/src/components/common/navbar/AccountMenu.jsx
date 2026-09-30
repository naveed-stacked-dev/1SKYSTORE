import { useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LogOut, User } from 'lucide-react';
import { ACCOUNT_LINKS } from '@/constants/navigation';
import { cn } from '@/utils/cn';
import { ICON_BUTTON, EASE } from './styles';

const MotionDiv = motion.div;

/** Desktop account control: sign-in link for guests, a dropdown when signed in */
export default function AccountMenu({ user, isAuthenticated, onLogout }) {
  const [open, setOpen] = useState(false);
  const wrapper = useRef(null);
  const menuId = useId();
  const { pathname } = useLocation();
  const [lastPath, setLastPath] = useState(pathname);

  // Close on navigation
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (e) => {
      if (!wrapper.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!isAuthenticated) {
    return (
      <Link
        to="/login"
        className="hidden min-h-11 items-center gap-2 whitespace-nowrap rounded-full px-4 text-sm font-medium text-ink transition-colors hover:bg-ink/6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:inline-flex"
      >
        <User className="h-4 w-4" aria-hidden="true" />
        Sign in
      </Link>
    );
  }

  const initial = user?.first_name?.[0]?.toUpperCase() || 'U';

  return (
    <div
      ref={wrapper}
      className="relative hidden lg:block"
      onBlur={(e) => {
        if (!wrapper.current?.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={menuId}
        aria-label="Account menu"
        className={ICON_BUTTON}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink font-display text-xs font-semibold text-canvas">
          {initial}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <MotionDiv
            id={menuId}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="absolute right-0 top-[calc(100%+0.75rem)] w-60 origin-top-right rounded-2xl bg-surface p-2 shadow-[0_24px_60px_-20px_rgba(14,23,38,0.35)] ring-1 ring-line"
          >
            <p className="truncate px-3 pb-2 pt-2 text-sm text-ink-faint">
              Signed in as <span className="font-medium text-ink">{user?.first_name || 'you'}</span>
            </p>
            <ul className="border-t border-line pt-1">
              {ACCOUNT_LINKS.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={cn(
                      'flex min-h-10 items-center rounded-xl px-3 text-sm text-ink transition-colors hover:bg-mist',
                      'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent'
                    )}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={onLogout}
              className="mt-1 flex min-h-10 w-full items-center gap-2 rounded-xl border-t border-line px-3 text-sm text-error-600 transition-colors hover:bg-error-50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent dark:text-error-500 dark:hover:bg-error-500/10"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
}
