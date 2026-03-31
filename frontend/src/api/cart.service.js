import API from './axios';

const cartService = {
  getCart: () => API.get('/cart'),
  addItem: (productId, quantity = 1) => API.post('/cart/add', { product_id: productId, quantity }),
  updateItem: (productId, quantity) => API.put('/cart/update', { product_id: productId, quantity }),
  removeItem: (productId) => API.delete(`/cart/item/${productId}`),
  clearCart: () => API.delete('/cart/clear'),
};

export default cartService;
