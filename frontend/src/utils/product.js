// Shared helpers for reading product / listing API responses in the storefront.

/** Pull the list out of the API's { data: [...] } / { data: { products } } shapes */
export function listFromResponse(res) {
  const data = res?.data?.data ?? res?.data;
  if (Array.isArray(data)) return data;
  return data?.products || data?.rows || data?.blogs || [];
}

/** Image URLs, primary first */
export function productImages(product) {
  const images = [...(product?.images || [])]
    .sort((a, b) => Number(Boolean(b?.is_primary)) - Number(Boolean(a?.is_primary)))
    .map((img) => (typeof img === 'string' ? img : img?.image_url))
    .filter(Boolean);
  if (!images.length && product?.image) images.push(product.image);
  return images;
}

function toAmount(value) {
  const n = parseFloat(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Selling price, compare-at price (only when it's really a discount) and % off */
export function productPricing(product) {
  const price = toAmount(product?.price_usd);
  const compare = toAmount(product?.compare_at_price_usd);
  const discount = price && compare && compare > price ? Math.round((1 - price / compare) * 100) : 0;
  return { price, compare: discount ? compare : null, discount };
}

export function isOutOfStock(product) {
  return product?.stock != null && Number(product.stock) <= 0;
}

export const productPath = (product) => `/product/${product.slug || product.id}`;
export const categoryPath = (name) => `/shop?category=${encodeURIComponent(name)}`;
// BrandPage filters products by brand name, so link by name rather than slug
export const brandPath = (name) => `/brand/${encodeURIComponent(name)}`;
export const concernPath = (query) => `/shop?symptom=${encodeURIComponent(query)}`;
