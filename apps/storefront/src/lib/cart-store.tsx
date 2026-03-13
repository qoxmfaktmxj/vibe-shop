"use client";

import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useEffectEvent,
  useState,
} from "react";

import type { CartItem, CartProduct } from "@/lib/contracts";

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

const STORAGE_KEY = "vibe-shop-cart";
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved) as CartItem[]);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  const persistItems = useEffectEvent((nextItems: CartItem[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
  });

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    persistItems(items);
  }, [hydrated, items]);

  const addItem = (product: CartProduct) => {
    startTransition(() => {
      setItems((current) => {
        const existing = current.find((item) => item.productId === product.productId);

        if (!existing) {
          return [...current, { ...product, quantity: 1 }];
        }

        return current.map((item) =>
          item.productId === product.productId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      });
    });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    startTransition(() => {
      setItems((current) =>
        current
          .map((item) =>
            item.productId === productId ? { ...item, quantity } : item,
          )
          .filter((item) => item.quantity > 0),
      );
    });
  };

  const removeItem = (productId: number) => {
    startTransition(() => {
      setItems((current) => current.filter((item) => item.productId !== productId));
    });
  };

  const clearCart = () => {
    startTransition(() => {
      setItems([]);
    });
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
