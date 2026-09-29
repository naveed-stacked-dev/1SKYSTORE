/**
 * Format a numeric value as currency (USD by default).
 * Pass the order's currency for orders placed before the switch to USD.
 */
export function formatPrice(value, currency = 'USD') {
  if (value == null || isNaN(value)) return '';

  const locale = currency === 'INR' ? 'en-IN' : 'en-US';

  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
  } catch {
    return `${currency === 'INR' ? '₹' : '$'}${Number(value).toFixed(2)}`;
  }
}
