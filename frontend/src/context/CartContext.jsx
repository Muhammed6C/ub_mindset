import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('ub_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('ub_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1, selectedVariant = null) => {
    setCart((prev) => {
      const itemKey = selectedVariant ? `${product.id}-${selectedVariant.id}` : `${product.id}`;
      const existing = prev.find((item) => item.key === itemKey);

      if (existing) {
        return prev.map((item) =>
          item.key === itemKey
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      const rawPrice = selectedVariant?.price || product.price;
      const numericPrice = typeof rawPrice === 'number' 
        ? rawPrice 
        : parseFloat(String(rawPrice || 0).replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;

      return [
        ...prev,
        {
          key: itemKey,
          product,
          variant: selectedVariant,
          quantity,
          price: numericPrice,
          displayPrice: product.price || `${numericPrice} €`,
        },
      ];
    });
    setIsDrawerOpen(true);
  };

  const removeFromCart = (itemKey) => {
    setCart((prev) => prev.filter((item) => item.key !== itemKey));
  };

  const updateQuantity = (itemKey, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemKey);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.key === itemKey ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        isDrawerOpen,
        setIsDrawerOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
