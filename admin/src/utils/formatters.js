/**
 * Format price to INR
 */
export function formatINR(amount) {
  if (amount == null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format price to USD
 */
export function formatUSD(amount) {
  if (amount == null) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date to readable string
 */
export function formatDate(date) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

/**
 * Format date with time
 */
export function formatDateTime(date) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

/**
 * Format number with K/M/B suffixes
 */
export function formatCompact(num) {
  if (num == null) return '0';
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'B';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toString();
}

/**
 * Capitalize first letter
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Truncate text
 */
export function truncate(str, len = 50) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '...' : str;
}

/**
 * Get status color class
 */
export function getStatusColor(status) {
  const map = {
    pending: 'bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-500',
    processing: 'bg-info-50 text-info-700 dark:bg-info-500/10 dark:text-info-500',
    shipped: 'bg-secondary-50 text-secondary-700 dark:bg-secondary-500/10 dark:text-secondary-500',
    delivered: 'bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-500',
    cancelled: 'bg-error-50 text-error-700 dark:bg-error-500/10 dark:text-error-500',
    active: 'bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-500',
    inactive: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
    published: 'bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-500',
    draft: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
  };
  return map[status?.toLowerCase()] || 'bg-neutral-100 text-neutral-600';
}
