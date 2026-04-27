import { useMemo, useState } from 'react';
import type { CartItem, Product } from '../lib/types';
import { SHIPPING_FEE } from '../lib/constants';

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );

  const shippingFee = cartItems.length > 0 ? SHIPPING_FEE : 0;
  const grandTotal = subtotal + shippingFee;

  function getCartItem(productId: string) {
    return cartItems.find((item) => item.id === productId);
  }

  function addToCart(product: Product) {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);

      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, { ...product, quantity: 1 }];
    });
  }

  function increaseQty(productId: string) {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  }

  function decreaseQty(productId: string) {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeItem(productId: string) {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  }

  function clearCart() {
    setCartItems([]);
  }

  return {
    cartItems,
    cartCount,
    subtotal,
    shippingFee,
    grandTotal,
    getCartItem,
    addToCart,
    increaseQty,
    decreaseQty,
    removeItem,
    clearCart,
  };
}