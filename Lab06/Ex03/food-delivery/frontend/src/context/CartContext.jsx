import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);
  const [restaurantName, setRestaurantName] = useState('');

  const addItem = useCallback((item, restaurant) => {
    if (restaurantId && restaurantId !== restaurant.id) {
      if (!window.confirm(`Giỏ hàng đang có món từ "${restaurantName}". Xoá và thêm món mới?`)) return;
      setItems([]);
      setRestaurantId(null);
    }
    setRestaurantId(restaurant.id);
    setRestaurantName(restaurant.name);
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
  }, [restaurantId, restaurantName]);

  const removeItem = useCallback((itemId) => {
    setItems(prev => {
      const updated = prev.map(i => i.id === itemId ? { ...i, qty: i.qty - 1 } : i).filter(i => i.qty > 0);
      if (updated.length === 0) { setRestaurantId(null); setRestaurantName(''); }
      return updated;
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setRestaurantId(null);
    setRestaurantName('');
  }, []);

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, restaurantId, restaurantName, addItem, removeItem, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
