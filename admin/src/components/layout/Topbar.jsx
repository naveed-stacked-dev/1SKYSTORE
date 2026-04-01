import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Search, Bell, Moon, Sun, User, LogOut, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Topbar() {
  const { admin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <header className="h-16 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          placeholder="Search anything..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border-none text-sm text-neutral-700 dark:text-neutral-200 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <button className="p-2 rounded-xl text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:text-neutral-300 dark:hover:bg-neutral-800 transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error-500 rounded-full" />
        </button>

        {/* Profile Dropdown */}
        <div ref={profileRef} className="relative ml-2">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <span className="text-white text-xs font-semibold">
                {admin?.first_name?.[0] || admin?.email?.[0]?.toUpperCase() || 'A'}
              </span>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 leading-tight">
                {admin?.first_name || 'Admin'}
              </p>
              <p className="text-xs text-neutral-400 leading-tight">
                {admin?.role || 'admin'}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-neutral-400 hidden md:block" />
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl shadow-elevated overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
                  <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    {admin?.first_name} {admin?.last_name}
                  </p>
                  <p className="text-xs text-neutral-400 truncate">{admin?.email}</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => { navigate('/admin/settings'); setShowProfile(false); }}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-error-600 hover:bg-error-50 dark:hover:bg-error-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
