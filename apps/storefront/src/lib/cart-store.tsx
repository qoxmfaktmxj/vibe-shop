"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  clearCartItems,
  getCart,
  removeCartItem,
  setCartItemQuantity,
} from "@/lib/client-api";
import type { CartItem, CartProduct, CartResponse } from "@/lib/contracts";

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  hydrated: boolean;
  addItem: (product: CartProduct) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadCart = async () => {
      try {
        const cart = await getCart();
        if (!cancelled) {
          setItems(cart.items);
          setHydrated(true);
        }
      } catch {
        if (!cancelled) {
          setHydrated(true);
        }
      }
    };

    void loadCart();

    return () => {
      cancelled = true;
    };
  }, []);

  const syncCart = async (request: () => Promise<CartResponse>) => {
    try {
      const cart = await request();
      setItems(cart.items);
      setHydrated(true);
    } catch {
      setHydrated(true);
    }
  };

  const addItem = (product: CartProduct) => {
    const existing = items.find((item) => item.productId === product.productId);
    const nextQuantity = (existing?.quantity ?? 0) + 1;
    void syncCart(() => setCartItemQuantity(product.productId, nextQuantity));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) {
      void syncCart(() => removeCartItem(productId));
      return;
    }

    void syncCart(() => setCartItemQuantity(productId, quantity));
  };

  const removeItem = (productId: number) => {
    void syncCart(() => removeCartItem(productId));
  };

  const clearCart = () => {
    void syncCart(() => clearCartItems());
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        hydrated,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
