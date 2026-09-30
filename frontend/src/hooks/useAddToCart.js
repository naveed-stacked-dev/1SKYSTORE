import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

/**
 * Add-to-cart with the store's rules: guests are sent to sign in first.
 * Resolves to true when the item landed in the cart.
 */
export function useAddToCart() {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(
    async (product, quantity = 1) => {
      if (!isAuthenticated) {
        toast('Please log in to add items to your cart', { icon: '🔒' });
        navigate('/login', { state: { from: location } });
        return false;
      }

      try {
        await addToCart(product, quantity);
        toast.success('Added to cart');
        return true;
      } catch {
        toast.error('Failed to add to cart');
        return false;
      }
    },
    [addToCart, isAuthenticated, navigate, location]
  );
}
