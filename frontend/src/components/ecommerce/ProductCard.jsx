import StoreProductCard from '@/components/home/StoreProductCard';

/**
 * Product card used across the shop, category, brand and dashboard pages.
 * It renders the storefront card so every listing matches the homepage;
 * add-to-cart rules (guests sign in first) live in useAddToCart.
 */
export default function ProductCard({ product }) {
  return <StoreProductCard product={product} className="w-full" />;
}
