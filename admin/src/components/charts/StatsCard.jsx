import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { staggerItem } from '@/animations/variants';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard({ title, value, change, changeLabel, icon: Icon, color = 'primary' }) {
  const colorMap = {
    primary: {
      tile: 'bg-gradient-to-br from-primary-400 to-primary-600 shadow-[0_8px_18px_-8px_rgba(21,101,192,0.7)]',
      glow: 'bg-primary-500/15',
      bar: 'from-primary-400 to-primary-600',
    },
    success: {
      tile: 'bg-gradient-to-br from-success-500 to-success-700 shadow-[0_8px_18px_-8px_rgba(16,185,129,0.7)]',
      glow: 'bg-success-500/15',
      bar: 'from-success-500 to-success-700',
    },
    warning: {
      tile: 'bg-gradient-to-br from-warning-500 to-warning-700 shadow-[0_8px_18px_-8px_rgba(245,158,11,0.7)]',
      glow: 'bg-warning-500/15',
      bar: 'from-warning-500 to-warning-700',
    },
    info: {
      tile: 'bg-gradient-to-br from-info-500 to-info-700 shadow-[0_8px_18px_-8px_rgba(59,130,246,0.7)]',
      glow: 'bg-info-500/15',
      bar: 'from-info-500 to-info-700',
    },
    secondary: {
      tile: 'bg-gradient-to-br from-secondary-400 to-secondary-600 shadow-[0_8px_18px_-8px_rgba(33,150,232,0.7)]',
      glow: 'bg-secondary-500/15',
      bar: 'from-secondary-400 to-secondary-600',
    },
  };

  const c = colorMap[color] || colorMap.primary;
  const isPositive = change > 0;

  return (
    <motion.div
      {...staggerItem}
      className="group relative overflow-hidden bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-100 dark:border-neutral-800 shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-[box-shadow,translate] duration-300"
    >
      {/* Accent bar + soft corner glow */}
      <div className={cn('absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-80', c.bar)} />
      <div className={cn('pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-2xl transition-transform duration-500 group-hover:scale-125', c.glow)} />

      <div className="relative flex items-start justify-between mb-4">
        <div className={cn('p-2.5 rounded-xl', c.tile)}>
          {Icon && <Icon className="w-5 h-5 text-white" />}
        </div>
        {change !== undefined && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ring-1 ring-inset',
            isPositive
              ? 'text-success-600 bg-success-50 ring-success-500/20 dark:bg-success-500/10'
              : 'text-error-600 bg-error-50 ring-error-500/20 dark:bg-error-500/10'
          )}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="relative text-2xl font-bold text-neutral-900 dark:text-neutral-50 font-heading tracking-tight">
        {value}
      </p>
      <p className="relative text-sm text-neutral-500 dark:text-neutral-400 mt-1">
        {title}
      </p>
      {changeLabel && (
        <p className="relative text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">{changeLabel}</p>
      )}
    </motion.div>
  );
}
