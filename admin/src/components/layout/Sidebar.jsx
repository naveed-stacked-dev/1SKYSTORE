import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { useSidebar } from '@/context/SidebarContext';
import { NAV_ITEMS } from '@/constants/navigation';
import { ChevronsLeft, ChevronsRight, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { sidebarVariants } from '@/animations/variants';

export default function Sidebar() {
  const { collapsed, toggleSidebar } = useSidebar();
  const { logout } = useAuth();
  const location = useLocation();

  return (
    <motion.aside
      initial={false}
      animate={collapsed ? 'collapsed' : 'expanded'}
      variants={sidebarVariants}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed left-0 top-0 h-screen bg-white dark:bg-neutral-900 border-r border-neutral-100 dark:border-neutral-800 z-40 flex flex-col"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">1S</span>
          </div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-base font-heading font-bold text-neutral-900 dark:text-neutral-50 whitespace-nowrap"
            >
              1SKYSTORE
            </motion.span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto no-scrollbar">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                isActive
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400'
                  : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-neutral-800'
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={cn(
                'w-5 h-5 shrink-0 transition-colors',
                isActive ? 'text-primary-500' : 'text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300'
              )} />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
              {isActive && !collapsed && (
                <motion.div
                  layoutId="sidebar-active"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500"
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-neutral-100 dark:border-neutral-800 space-y-1 shrink-0">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-500 hover:text-error-600 hover:bg-error-50 dark:text-neutral-400 dark:hover:text-error-400 dark:hover:bg-error-500/10 transition-all duration-200 w-full"
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
        <button
          onClick={toggleSidebar}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 dark:hover:text-neutral-300 dark:hover:bg-neutral-800 transition-all duration-200 w-full"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronsRight className="w-5 h-5 shrink-0" /> : <ChevronsLeft className="w-5 h-5 shrink-0" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </motion.aside>
  );
}
