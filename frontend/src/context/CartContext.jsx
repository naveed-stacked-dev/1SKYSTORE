import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import cartService from '@/api/cart.service';
import { useAuth } from '@/context/AuthContext';
import { getStorage, setStorage } from '@/utils/storage';

const CartContext = createContext(null);

/**
 * Normalize a cart item from API to a consistent flat shape
 * The API returns { product_id, quantity, product: { name, price_usd, images: [...] } }
 * We need to make price/name/image accessible at item level for calculations
 */
function normalizeItem(item) {
  const product = item.product || {};
  return {
    ...item,
    product_id: item.product_id || product.id || item.id,
    name: product.name || item.name || 'Product',
    price: parseFloat(product.price_usd || item.price_usd || item.price || 0),
    price_usd: parseFloat(product.price_usd || item.price_usd || item.price || 0),
    image: product.images?.[0]?.image_url || product.image || item.image || null,
    quantity: item.quantity || 1,
    stock: product.stock ?? item.stock,
    brand: product.brand || item.brand,
    slug: product.slug || item.slug,
    // Keep nested product for components that use it
    product: product,
  };
}

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState(() => getStorage('cart_items') || []);
  const [loading, setLoading] = useState(false);

  const itemCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const subtotal = items.reduce((sum, item) => {
    const price = parseFloat(item.price || item.price_usd || item.product?.price_usd || 0);
    return sum + price * (item.quantity || 1);
  }, 0);

  // Sync with API when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated]);

  // Persist guest cart
  useEffect(() => {
    if (!isAuthenticated) {
      setStorage('cart_items', items);
    }
  }, [items, isAuthenticated]);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const res = await cartService.getCart();
      const data = res.data?.data || res.data?.cart || res.data;
      const cartItems = data?.items || data || [];
      const normalized = Array.isArray(cartItems) ? cartItems.map(normalizeItem) : [];
      setItems(normalized);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = useCallback(
    async (product, quantity = 1) => {
      if (isAuthenticated) {
        try {
          setLoading(true);
          await cartService.addItem(product.id, quantity);
          await fetchCart();
        } catch (error) {
          throw error;
        } finally {
          setLoading(false);
        }
      } else {
        setItems((prev) => {
          const existing = prev.find((item) => item.id === product.id || item.product_id === product.id);
          if (existing) {
            return prev.map((item) =>
              (item.id === product.id || item.product_id === product.id)
                ? { ...item, quantity: (item.quantity || 1) + quantity }
                : item
            );
          }
          return [...prev, normalizeItem({ ...product, product_id: product.id, quantity, product })];
        });
      }
    },
    [isAuthenticated, fetchCart]
  );

  const updateQuantity = useCallback(
    async (productId, quantity) => {
      if (quantity < 1) return removeFromCart(productId);
      if (isAuthenticated) {
        try {
          setLoading(true);
          await cartService.updateItem(productId, quantity);
          await fetchCart();
        } catch (error) {
          throw error;
        } finally {
          setLoading(false);
        }
      } else {
        setItems((prev) =>
          prev.map((item) =>
            (item.id === productId || item.product_id === productId)
              ? { ...item, quantity }
              : item
          )
        );
      }
    },
    [isAuthenticated, fetchCart]
  );

  const removeFromCart = useCallback(
    async (productId) => {
      if (isAuthenticated) {
        try {
          setLoading(true);
          await cartService.removeItem(productId);
          await fetchCart();
        } catch (error) {
          throw error;
        } finally {
          setLoading(false);
        }
      } else {
        setItems((prev) => prev.filter((item) => item.id !== productId && item.product_id !== productId));
      }
    },
    [isAuthenticated, fetchCart]
  );

  const clearCart = useCallback(async () => {
    if (isAuthenticated) {
      try {
        setLoading(true);
        await cartService.clearCart();
        setItems([]);
      } catch (error) {
        throw error;
      } finally {
        setLoading(false);
      }
    } else {
      setItems([]);
    }
  }, [isAuthenticated]);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
