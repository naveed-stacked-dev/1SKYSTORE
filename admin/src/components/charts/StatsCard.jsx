import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { staggerItem } from '@/animations/variants';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard({ title, value, change, changeLabel, icon: Icon, color = 'primary' }) {
  const colorMap = {
    primary: {
      bg: 'bg-primary-50 dark:bg-primary-500/10',
      icon: 'text-primary-500',
      ring: 'ring-primary-500/20',
    },
    success: {
      bg: 'bg-success-50 dark:bg-success-500/10',
      icon: 'text-success-500',
      ring: 'ring-success-500/20',
    },
    warning: {
      bg: 'bg-warning-50 dark:bg-warning-500/10',
      icon: 'text-warning-500',
      ring: 'ring-warning-500/20',
    },
    info: {
      bg: 'bg-info-50 dark:bg-info-500/10',
      icon: 'text-info-500',
      ring: 'ring-info-500/20',
    },
    secondary: {
      bg: 'bg-secondary-50 dark:bg-secondary-500/10',
      icon: 'text-secondary-600',
      ring: 'ring-secondary-500/20',
    },
  };

  const c = colorMap[color] || colorMap.primary;
  const isPositive = change > 0;

  return (
    <motion.div
      {...staggerItem}
      className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-100 dark:border-neutral-800 hover:shadow-card transition-shadow duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn('p-2.5 rounded-xl ring-1', c.bg, c.ring)}>
          {Icon && <Icon className={cn('w-5 h-5', c.icon)} />}
        </div>
        {change !== undefined && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg',
            isPositive
              ? 'text-success-600 bg-success-50 dark:bg-success-500/10'
              : 'text-error-600 bg-error-50 dark:bg-error-500/10'
          )}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 font-heading">
        {value}
      </p>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
        {title}
      </p>
      {changeLabel && (
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">{changeLabel}</p>
      )}
    </motion.div>
  );
}
