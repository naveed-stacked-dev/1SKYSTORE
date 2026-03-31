export function formatPrice(value, currency = 'USD') {
  if (value == null || isNaN(value)) return '';

  const options = {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currency === 'INR' ? 0 : 2,
    maximumFractionDigits: 2,
  };

  const locale = currency === 'INR' ? 'en-IN' : 'en-US';

  try {
    return new Intl.NumberFormat(locale, options).format(value);
  } catch {
    return `${currency} ${Number(value).toFixed(2)}`;
  }
}
