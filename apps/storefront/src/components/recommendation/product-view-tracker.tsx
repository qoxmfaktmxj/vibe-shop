"use client";

import { useEffect } from "react";

import { trackProductView } from "@/lib/client-api";

export function ProductViewTracker({ productId }: { productId: number }) {
  useEffect(() => {
    void trackProductView(productId).catch(() => {
      // 최근 본 상품 추적 실패는 화면을 막지 않는다.
    });
  }, [productId]);

  return null;
}
