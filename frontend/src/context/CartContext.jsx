import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import cartService from '@/api/cart.service';
import { useAuth } from '@/context/AuthContext';
import { getStorage, setStorage } from '@/utils/storage';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState(() => getStorage('cart_items') || []);
  const [loading, setLoading] = useState(false);

  const itemCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

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
      setItems(Array.isArray(cartItems) ? cartItems : []);
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
          return [...prev, { ...product, product_id: product.id, quantity }];
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
