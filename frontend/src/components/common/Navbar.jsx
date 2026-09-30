import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { ChevronDown, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { STORE_NAV } from '@/constants/navigation';
import { subscribeCartFly } from '@/utils/cartFly';
import { cn } from '@/utils/cn';
import BrandWordmark from '@/components/common/BrandWordmark';
import ThemeToggle from '@/components/common/ThemeToggle';
import SearchBar from '@/components/common/SearchBar';
import CartButton from './navbar/CartButton';
import CategoriesPanel from './navbar/CategoriesPanel';
import AccountMenu from './navbar/AccountMenu';
import MobileMenu from './navbar/MobileMenu';
import { ICON_BUTTON, EASE } from './navbar/styles';

const MotionHeader = motion.header;
const MotionDiv = motion.div;
const MotionSpan = motion.span;

const PANEL_CATEGORIES = 'nav-categories';
const PANEL_SEARCH = 'nav-search';
const MOBILE_MENU = 'nav-mobile-menu';
const HIDE_AFTER = 480; // px scrolled before the bar may tuck away

const isActivePath = (pathname, path) => (path === '/' ? pathname === '/' : pathname.startsWith(path));

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [scrolled, setScrolled] = useState(() => typeof window !== 'undefined' && window.scrollY > 12);
  const [tucked, setTucked] = useState(false);
  const [panel, setPanel] = useState(null); // 'categories' | 'search' | null
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [lastPath, setLastPath] = useState(pathname);
  const hoverTimer = useRef(null);

  // Reset transient UI on navigation
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setPanel(null);
    setMobileOpen(false);
    setTucked(false);
  }

  // Glass once scrolled; tuck away while reading down, return on the way up
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (y) => {
    const previous = scrollY.getPrevious() ?? 0;
    setScrolled(y > 12);
    if (y > previous + 4 && y > HIDE_AFTER) setTucked(true);
    else if (y < previous - 4 || y <= HIDE_AFTER) setTucked(false);
  });

  // Bring the bar back when something flies into the cart
  useEffect(() => subscribeCartFly(() => setTucked(false)), []);

  const closePanel = useCallback(() => setPanel(null), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const togglePanel = (name) => setPanel((current) => (current === name ? null : name));

  // "/" opens search; Escape closes any open panel
  useEffect(() => {
    const onKey = (e) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable;
      if (e.key === '/' && !typing) {
        e.preventDefault();
        setPanel('search');
      } else if (e.key === 'Escape') {
        setPanel(null);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => () => window.clearTimeout(hoverTimer.current), []);

  // Hover intent for the categories panel (pointer devices only)
  const canHover = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const openCategoriesSoon = () => {
    if (!canHover()) return;
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setPanel((p) => (p === 'search' ? p : 'categories')), 140);
  };
  const cancelTimer = () => window.clearTimeout(hoverTimer.current);
  const closeCategoriesSoon = () => {
    if (!canHover()) return;
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setPanel((p) => (p === 'categories' ? null : p)), 220);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const glass = !mobileOpen && (pathname !== '/' || scrolled || panel !== null);
  const hidden = tucked && !panel && !mobileOpen;

  return (
    <>
      <MotionHeader
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: hidden ? '-130%' : '0%', opacity: 1 }}
        transition={{ duration: 0.55, ease: EASE }}
        onMouseEnter={cancelTimer}
        onMouseLeave={closeCategoriesSoon}
        className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5"
      >
        <div
          className={cn(
            'mx-auto max-w-[1360px] rounded-[1.75rem] transition-[background-color,box-shadow,backdrop-filter] duration-500',
            glass
              ? 'bg-surface/80 shadow-[0_18px_50px_-28px_rgba(14,23,38,0.35)] ring-1 ring-line backdrop-blur-xl backdrop-saturate-150'
              : 'bg-transparent ring-1 ring-transparent'
          )}
        >
          <div className="flex h-14 items-center gap-2 pl-4 pr-1.5 sm:h-16 sm:pl-6 sm:pr-2">
            <div className="flex flex-1 items-center">
            <Link
              to={isAuthenticated ? '/dashboard' : '/'}
              className="mr-auto rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              aria-label="1SKYSTORE home"
            >
              <BrandWordmark priority className="h-12 sm:h-14" />
            </Link>
            </div>

            {/* Desktop links with a travelling hover highlight */}
            {/* Centred between two equal flex-1 sides */}
            <nav aria-label="Main" className="hidden shrink-0 lg:block" onMouseLeave={() => setHovered(null)}>
              <ul className="flex items-center">
                {STORE_NAV.map((item) => {
                  const active = !item.menu && isActivePath(pathname, item.path);
                  const itemClass =
                    'relative flex min-h-10 items-center rounded-full px-4 text-[14px] font-medium text-ink transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';
                  const highlight = hovered === item.name && (
                    <MotionSpan
                      layoutId="nav-hover"
                      className="absolute inset-0 rounded-full bg-ink/6"
                      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                    />
                  );

                  return (
                    <li key={item.name} onMouseEnter={() => setHovered(item.name)}>
                      {item.menu ? (
                        <button
                          type="button"
                          aria-expanded={panel === 'categories'}
                          aria-controls={PANEL_CATEGORIES}
                          onClick={() => togglePanel('categories')}
                          onMouseEnter={openCategoriesSoon}
                          className={itemClass}
                        >
                          {highlight}
                          <span className="relative flex items-center gap-1">
                            {item.name}
                            <ChevronDown
                              className={cn('h-3.5 w-3.5 transition-transform duration-300', panel === 'categories' && 'rotate-180')}
                              aria-hidden="true"
                            />
                          </span>
                        </button>
                      ) : (
                        <Link
                          to={item.path}
                          aria-current={active ? 'page' : undefined}
                          onMouseEnter={panel === 'categories' ? closeCategoriesSoon : undefined}
                          className={itemClass}
                        >
                          {highlight}
                          <span className="relative">{item.name}</span>
                          {active && (
                            <MotionSpan
                              layoutId="nav-active"
                              className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent"
                              transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                            />
                          )}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="flex items-center gap-0.5 lg:flex-1 lg:justify-end">
              <button
                type="button"
                onClick={() => togglePanel('search')}
                aria-expanded={panel === 'search'}
                aria-controls={PANEL_SEARCH}
                aria-label="Search"
                aria-keyshortcuts="/"
                className={ICON_BUTTON}
              >
                <Search className="h-4.5 w-4.5" aria-hidden="true" />
              </button>
              <ThemeToggle className="hidden sm:flex" />
              <AccountMenu user={user} isAuthenticated={isAuthenticated} onLogout={handleLogout} />
              <CartButton />
              <button
                type="button"
                onClick={() => setMobileOpen((v) => !v)}
                aria-expanded={mobileOpen}
                aria-controls={MOBILE_MENU}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                className={cn(ICON_BUTTON, 'lg:hidden')}
              >
                <span className="relative block h-3 w-5" aria-hidden="true">
                  <MotionSpan
                    className="absolute left-0 top-0 h-[1.5px] w-5 rounded-full bg-current"
                    animate={mobileOpen ? { y: 5.25, rotate: 45 } : { y: 0, rotate: 0 }}
                    transition={{ duration: 0.4, ease: EASE }}
                  />
                  <MotionSpan
                    className="absolute bottom-0 left-0 h-[1.5px] w-5 rounded-full bg-current"
                    animate={mobileOpen ? { y: -5.25, rotate: -45 } : { y: 0, rotate: 0 }}
                    transition={{ duration: 0.4, ease: EASE }}
                  />
                </span>
              </button>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {panel === 'search' && (
              <MotionDiv
                key="search"
                id={PANEL_SEARCH}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="overflow-hidden"
              >
                <div className="border-t border-line px-3 pb-4 pt-4 sm:px-6 sm:pb-6">
                  <SearchBar onClose={closePanel} />
                </div>
              </MotionDiv>
            )}
            {panel === 'categories' && (
              <div className="hidden lg:block" key="categories">
                <CategoriesPanel id={PANEL_CATEGORIES} onNavigate={closePanel} />
              </div>
            )}
          </AnimatePresence>
        </div>
      </MotionHeader>

      {/* Dim the page behind open panels; click to dismiss */}
      <AnimatePresence>
        {panel && (
          <MotionDiv
            key="nav-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onClick={closePanel}
            className="fixed inset-0 z-40 bg-ink/15 backdrop-blur-[3px]"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <MobileMenu
        id={MOBILE_MENU}
        open={mobileOpen}
        onClose={closeMobile}
        user={user}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
      />
    </>
  );
}
