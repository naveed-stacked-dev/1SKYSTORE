// Tiny event channel for the "product flies into the cart" animation.
// Product cards announce where the image is; the navbar's cart button owns the
// flight, so cards never need a ref to the navbar.

const FLY_EVENT = 'cart:fly';

export function flyToCart(sourceEl, src) {
  if (!sourceEl || typeof window === 'undefined') return;
  const { left, top, width, height } = sourceEl.getBoundingClientRect();
  window.dispatchEvent(
    new CustomEvent(FLY_EVENT, { detail: { src, rect: { left, top, width, height } } })
  );
}

export function subscribeCartFly(handler) {
  const listener = (e) => handler(e.detail);
  window.addEventListener(FLY_EVENT, listener);
  return () => window.removeEventListener(FLY_EVENT, listener);
}
