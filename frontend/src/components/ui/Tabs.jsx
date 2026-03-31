import { useState } from 'react';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';

export default function Tabs({ tabs, defaultTab, className }) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.id);

  const activeTab = tabs.find((t) => t.id === active);

  return (
    <div className={cn('w-full', className)}>
      {/* Tab List */}
      <div className="flex gap-1 border-b border-neutral-200 dark:border-neutral-700 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={cn(
              'relative px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors',
              active === tab.id
                ? 'text-primary-500'
                : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
            )}
          >
            {tab.label}
            {active === tab.id && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full"
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              />
            )}
          </button>
        ))}
      </div>
      {/* Active Tab Content */}
      <motion.div
        key={active}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="pt-4"
      >
        {activeTab?.content}
      </motion.div>
    </div>
  );
}
