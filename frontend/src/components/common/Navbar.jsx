import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Search, ShoppingBag, User, LogOut, Package, ChevronRight, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useGeo } from '@/context/GeoContext';
import ThemeToggle from '@/components/common/ThemeToggle';
import SearchBar from '@/components/common/SearchBar';
import Drawer from '@/components/ui/Drawer';
import Button from '@/components/ui/Button';
import { PUBLIC_NAV_LINKS, AUTH_NAV_LINKS } from '@/constants/navigation';
import productService from '@/api/product.service';
import { cn } from '@/utils/cn';
import indiaFlag from '@/assets/india.jpg';
import usaFlag from '@/assets/usa.png';

export default function Navbar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [brands, setBrands] = useState([]);
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const { country, currency, countryName } = useGeo();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    productService.getBrands().then((res) => {
      const b = res.data?.data || res.data;
      if (Array.isArray(b)) {
        setBrands(b.slice(0, 8)); // Grab top 8
      }
    }).catch(console.error);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = isAuthenticated ? AUTH_NAV_LINKS : PUBLIC_NAV_LINKS;

  return (
    <>
      <div className="sticky top-0 z-40 w-full flex flex-col">
        {/* Main Header Row */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full border-b border-neutral-100 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 lg:h-18">
              {/* Left — Logo + Mobile Menu */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsDrawerOpen(true)}
                  className="lg:hidden p-2 rounded-xl text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  aria-label="Open menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <Link
                  to={isAuthenticated ? '/dashboard' : '/'}
                  className="text-xl font-heading font-bold tracking-tight text-primary-500"
                >
                  1SkyStore
                </Link>
              </div>

              {/* Center — Navigation */}
              <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={cn(
                        'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                        isActive
                          ? 'text-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'text-neutral-600 hover:text-primary-500 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-primary-400'
                      )}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </nav>

               {/* Right — Actions */}
              <div className="flex items-center gap-1">
                {/* Geo Context Flag */}
                <div className="hidden sm:flex items-center gap-2 mr-2 px-2 py-1 rounded-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                  <img 
                    src={country === 'IN' ? indiaFlag : usaFlag} 
                    alt={country === 'IN' ? 'India' : 'USA'} 
                    className="w-5 h-5 rounded-full object-cover shadow-sm bg-white" 
                  />
                  <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300 pointer-events-none select-none">
                    {country === 'IN' ? 'IN ₹' : 'US $'}
                  </span>
                </div>

                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="p-2 rounded-xl text-neutral-500 hover:text-primary-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>

                <ThemeToggle />

                <Link
                  to="/cart"
                  className="relative p-2 rounded-xl text-neutral-500 hover:text-primary-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  aria-label="Cart"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {itemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                    >
                      {itemCount > 99 ? '99+' : itemCount}
                    </motion.span>
                  )}
                </Link>

                {isAuthenticated ? (
                  <div className="hidden sm:flex items-center gap-2 ml-2">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-neutral-600 hover:text-primary-500 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary-600">
                          {user?.first_name?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <span className="hidden md:inline">{user?.first_name || 'Account'}</span>
                    </Link>
                  </div>
                ) : (
                  <Link to="/login" className="hidden sm:block ml-2">
                    <Button size="sm" variant="primary">
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Search Bar (expandable) */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-t border-neutral-100 dark:border-neutral-800"
              >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                  <SearchBar onClose={() => setIsSearchOpen(false)} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>

        {/* Dynamic Brands Row */}
        {brands.length > 0 && (
          <div className="w-full bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 overflow-x-auto no-scrollbar hidden md:block">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-6 py-2">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Top Brands:</span>
                {brands.map((b, i) => (
                  <Link 
                    key={i} 
                    to={`/brand/${encodeURIComponent(b)}`}
                    className="text-xs text-neutral-600 dark:text-neutral-300 hover:text-primary-500 transition-colors whitespace-nowrap whitespace-nowrap"
                  >
                    {b}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Drawer */}
      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="1SkyStore">
        <nav className="flex flex-col gap-1 mb-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsDrawerOpen(false)}
              className={cn(
                'flex items-center justify-between px-3 py-3 rounded-xl text-base font-medium transition-colors',
                location.pathname === link.path
                  ? 'text-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800'
              )}
            >
              <div className="flex items-center gap-3">
                {link.name === 'Dashboard' && <LayoutDashboard className="w-5 h-5" />}
                {link.name}
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </Link>
          ))}
        </nav>

        <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 space-y-2">
          <Link
            to="/cart"
            onClick={() => setIsDrawerOpen(false)}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Cart</span>
            {itemCount > 0 && (
              <span className="ml-auto w-6 h-6 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                onClick={() => setIsDrawerOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </Link>
              <button
                onClick={() => { handleLogout(); setIsDrawerOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link to="/login" onClick={() => setIsDrawerOpen(false)} className="block pt-2">
              <Button className="w-full">Sign In</Button>
            </Link>
          )}
        </div>
      </Drawer>
    </>
  );
}
