import { cn } from '@/utils/cn';

// Text wordmark used in place of the image logo
export default function BrandWordmark({ className }) {
  return (
    <span className={cn('inline-flex items-baseline font-heading font-bold tracking-tight leading-none whitespace-nowrap', className)}>
      <span className="bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent dark:from-primary-300 dark:to-secondary-400">
        1SKY
      </span>
      <span className="text-neutral-900 dark:text-white">STORE</span>
    </span>
  );
}
