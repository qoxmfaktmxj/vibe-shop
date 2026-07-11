"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  clearCartItems,
  getCart,
  removeCartItem,
  setCartItemQuantity,
} from "@/lib/client-api";
import { useAuth } from "@/lib/auth-store";
import type { CartItem, CartProduct, CartResponse } from "@/lib/contracts";

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  hydrated: boolean;
  mutating: boolean;
  mutationError: string;
  addItem: (product: CartProduct) => Promise<boolean>;
  updateQuantity: (productId: number, quantity: number) => Promise<boolean>;
  removeItem: (productId: number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [pendingMutations, setPendingMutations] = useState(0);
  const [mutationError, setMutationError] = useState("");
  const mutationQueueRef = useRef<Promise<void>>(Promise.resolve());
  const sessionGenerationRef = useRef(0);
  const queuedQuantitiesRef = useRef(new Map<number, number>());
  const { session } = useAuth();

  useEffect(() => {
    let cancelled = false;
    const generation = ++sessionGenerationRef.current;

    setItems([]);
    setHydrated(false);
    setMutationError("");
    queuedQuantitiesRef.current.clear();

    const loadCart = async () => {
      try {
        const cart = await getCart();
        if (!cancelled && generation === sessionGenerationRef.current) {
          setItems(cart.items);
          setHydrated(true);
        }
      } catch {
        if (!cancelled && generation === sessionGenerationRef.current) {
          setHydrated(true);
        }
      }
    };

    void loadCart();

    return () => {
      cancelled = true;
    };
  }, [session.authenticated, session.user?.id]);

  const syncCart = (request: () => Promise<CartResponse>) => {
    const generation = sessionGenerationRef.current;
    setPendingMutations((current) => current + 1);
    setMutationError("");

    const result = mutationQueueRef.current.then(async () => {
      try {
        const cart = await request();
        if (generation === sessionGenerationRef.current) {
          setItems(cart.items);
          setHydrated(true);
        }
        return true;
      } catch (error) {
        if (generation === sessionGenerationRef.current) {
          setMutationError(
            error instanceof Error
              ? error.message
              : "장바구니를 변경하지 못했습니다. 잠시 후 다시 시도해 주세요.",
          );
          setHydrated(true);
        }
        return false;
      } finally {
        setPendingMutations((current) => Math.max(0, current - 1));
      }
    });

    mutationQueueRef.current = result.then(() => undefined);
    return result;
  };

  const addItem = async (product: CartProduct) => {
    const existing = items.find((item) => item.productId === product.productId);
    const queuedQuantity = queuedQuantitiesRef.current.get(product.productId);
    const nextQuantity = (queuedQuantity ?? existing?.quantity ?? 0) + 1;
    queuedQuantitiesRef.current.set(product.productId, nextQuantity);
    const succeeded = await syncCart(() =>
      setCartItemQuantity(product.productId, nextQuantity),
    );
    if (queuedQuantitiesRef.current.get(product.productId) === nextQuantity) {
      queuedQuantitiesRef.current.delete(product.productId);
    }
    return succeeded;
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) {
      return syncCart(() => removeCartItem(productId));
    }

    return syncCart(() => setCartItemQuantity(productId, quantity));
  };

  const removeItem = (productId: number) => {
    return syncCart(() => removeCartItem(productId));
  };

  const clearCart = () => {
    return syncCart(() => clearCartItems());
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
        mutating: pendingMutations > 0,
        mutationError,
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
