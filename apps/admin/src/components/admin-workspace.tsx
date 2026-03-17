"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { AdminCategoryManager } from "@/components/admin-category-manager";
import { AdminDisplayManager } from "@/components/admin-display-manager";
import { AdminMemberManager } from "@/components/admin-member-manager";
import { AdminStatisticsPanel } from "@/components/admin-statistics-panel";
import { updateDisplay, updateOrderStatus, updateProduct } from "@/lib/client-api";
import { useAdminAuth } from "@/lib/auth-store";
import type {
  AdminCategory,
  AdminDashboard,
  AdminDisplay,
  AdminMember,
  AdminOrder,
  AdminProduct,
  AdminStatistics,
  UpdateAdminDisplayPayload,
  UpdateAdminProductPayload,
} from "@/lib/contracts";

function formatPrice(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("ko-KR");
}

function formatStatus(status: string) {
  const labels: Record<string, string> = {
    PENDING_PAYMENT: "결제 대기",
    PAID: "결제 완료",
    PREPARING: "상품 준비중",
    SHIPPED: "배송중",
    DELIVERED: "배송 완료",
    REFUND_REQUESTED: "환불 요청",
    REFUNDED: "환불 완료",
    CANCELLED: "주문 취소",
  };

  return labels[status] ?? status;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function createProductForm(product: AdminProduct): UpdateAdminProductPayload {
  return {
    name: product.name,
    summary: product.summary,
    badge: product.badge,
    price: product.price,
    stock: product.stock,
    popularityScore: product.popularityScore,
    featured: product.featured,
  };
}

export function AdminWorkspace({
  initialDashboard,
  initialDisplay,
  initialProducts,
  initialOrders,
  initialCategories,
  initialMembers,
  initialStatistics,
}: {
  initialDashboard: AdminDashboard;
  initialDisplay: AdminDisplay;
  initialProducts: AdminProduct[];
  initialOrders: AdminOrder[];
  initialCategories: AdminCategory[];
  initialMembers: AdminMember[];
  initialStatistics: AdminStatistics;
}) {
  const router = useRouter();
  const { session, signOut } = useAdminAuth();
  const [dashboard, setDashboard] = useState(initialDashboard);
  const [display, setDisplay] = useState(initialDisplay);
  const [products, setProducts] = useState(initialProducts);
  const [orders, setOrders] = useState(initialOrders);
  const [members, setMembers] = useState(initialMembers);
  const [productQuery, setProductQuery] = useState("");
  const [selectedProductId, setSelectedProductId] = useState(initialProducts[0]?.id ?? 0);
  const [displayForm, setDisplayForm] = useState<UpdateAdminDisplayPayload>({
    heroTitle: initialDisplay.heroTitle,
    heroSubtitle: initialDisplay.heroSubtitle,
    heroCtaLabel: initialDisplay.heroCtaLabel,
    heroCtaHref: initialDisplay.heroCtaHref,
  });
  const [displayMessage, setDisplayMessage] = useState("");
  const [displayError, setDisplayError] = useState("");
  const [productMessage, setProductMessage] = useState("");
  const [productError, setProductError] = useState("");
  const [orderMessage, setOrderMessage] = useState("");
  const [orderError, setOrderError] = useState("");
  const [isSavingDisplay, startSavingDisplay] = useTransition();
  const [isSavingProduct, startSavingProduct] = useTransition();
  const [isSavingOrder, startSavingOrder] = useTransition();
  const [isLoggingOut, startLoggingOut] = useTransition();

  const filteredProducts = products.filter((product) => {
    const normalizedQuery = productQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return true;
    }

    return [product.name, product.summary, product.categoryName, product.badge]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery);
  });

  const selectedProduct =
    products.find((product) => product.id === selectedProductId) ?? filteredProducts[0] ?? null;

  const [productForm, setProductForm] = useState<UpdateAdminProductPayload>(
    selectedProduct
      ? createProductForm(selectedProduct)
      : {
          name: "",
          summary: "",
          badge: "",
          price: 0,
          stock: 0,
          popularityScore: 0,
          featured: false,
        },
  );

  function syncSelectedProduct(productId: number, sourceProducts: AdminProduct[]) {
    const product = sourceProducts.find((item) => item.id === productId) ?? sourceProducts[0];
    if (!product) {
      return;
    }

    setSelectedProductId(product.id);
    setProductForm(createProductForm(product));
  }

  function handleMemberUpdated(nextMember: AdminMember) {
    setMembers((current) => {
      const nextMembers = current.map((member) =>
        member.id === nextMember.id ? nextMember : member,
      );

      setDashboard((currentDashboard) => ({
        ...currentDashboard,
        activeMemberCount: nextMembers.filter((member) => member.status === "ACTIVE").length,
        dormantMemberCount: nextMembers.filter((member) => member.status === "DORMANT").length,
        blockedMemberCount: nextMembers.filter((member) => member.status === "BLOCKED").length,
      }));

      return nextMembers;
    });
  }

  return (
    <main className="mx-auto flex w-full max-w-[1480px] flex-col px-6 py-8 sm:px-8 lg:px-10">
      <section className="admin-dark rounded-[40px] p-8 sm:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow text-[rgba(237,244,239,0.64)]">Vibe Shop Admin</p>
            <h1 className="display mt-5 text-5xl font-semibold leading-[0.92] sm:text-6xl">
              운영 전시와 상품 흐름을 한 화면에서 조정합니다.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[rgba(237,244,239,0.72)]">
              메인 카피, 배너, 카테고리, 상품, 주문 상태까지 같은 데이터베이스 기준으로 바로
              반영되는 운영 콘솔입니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-white/12 px-5 py-3 text-sm text-[rgba(237,244,239,0.82)]">
              {session.user?.name} · {session.user?.role}
            </div>
            <button
              type="button"
              disabled={isLoggingOut}
              onClick={() =>
                startLoggingOut(() => {
                  void (async () => {
                    await signOut();
                    router.push("/login");
                    router.refresh();
                  })();
                })
              }
              className="admin-button-ghost px-5 py-3 disabled:opacity-60"
            >
              {isLoggingOut ? "로그아웃 중" : "로그아웃"}
            </button>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-[28px] border border-white/10 bg-white/6 p-5">
            <p className="eyebrow text-[rgba(237,244,239,0.56)]">Products</p>
            <p className="mt-3 text-4xl font-semibold">{dashboard.productCount}</p>
            <p className="mt-2 text-sm text-[rgba(237,244,239,0.72)]">
              추천 {dashboard.featuredProductCount}개 · 저재고 {dashboard.lowStockCount}개
            </p>
          </article>
          <article className="rounded-[28px] border border-white/10 bg-white/6 p-5">
            <p className="eyebrow text-[rgba(237,244,239,0.56)]">Members</p>
            <p className="mt-3 text-4xl font-semibold">{dashboard.memberCount}</p>
            <p className="mt-2 text-sm text-[rgba(237,244,239,0.72)]">가입 회원 기준 운영 지표</p>
          </article>
          <article className="rounded-[28px] border border-white/10 bg-white/6 p-5">
            <p className="eyebrow text-[rgba(237,244,239,0.56)]">Orders</p>
            <p className="mt-3 text-4xl font-semibold">{dashboard.totalOrderCount}</p>
            <p className="mt-2 text-sm text-[rgba(237,244,239,0.72)]">
              결제 완료 {dashboard.paidOrderCount}건
            </p>
          </article>
          <article className="rounded-[28px] border border-white/10 bg-white/6 p-5">
            <p className="eyebrow text-[rgba(237,244,239,0.56)]">Pending</p>
            <p className="mt-3 text-4xl font-semibold">{dashboard.pendingOrderCount}</p>
            <p className="mt-2 text-sm text-[rgba(237,244,239,0.72)]">확인이 필요한 대기 주문</p>
          </article>
        </div>
      </section>

      <div className="mt-6 grid gap-6">
        <div className="grid gap-6 xl:grid-cols-[1.06fr_0.94fr]">
          <section className="grid gap-6">
            <article className="admin-card rounded-[36px] p-8">
              <p className="eyebrow text-[var(--ink-soft)]">Main Display</p>
              <h2 className="display mt-4 text-3xl font-semibold">메인 히어로 카피</h2>
              <form
                className="mt-8 grid gap-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  setDisplayMessage("");
                  setDisplayError("");

                  startSavingDisplay(() => {
                    void (async () => {
                      try {
                        const nextDisplay = await updateDisplay({
                          heroTitle: displayForm.heroTitle.trim(),
                          heroSubtitle: displayForm.heroSubtitle.trim(),
                          heroCtaLabel: displayForm.heroCtaLabel.trim(),
                          heroCtaHref: displayForm.heroCtaHref.trim(),
                        });
                        setDisplay(nextDisplay);
                        setDisplayForm({
                          heroTitle: nextDisplay.heroTitle,
                          heroSubtitle: nextDisplay.heroSubtitle,
                          heroCtaLabel: nextDisplay.heroCtaLabel,
                          heroCtaHref: nextDisplay.heroCtaHref,
                        });
                        setDashboard((current) => ({ ...current, display: nextDisplay }));
                        setDisplayMessage("메인 히어로 카피를 저장했습니다.");
                      } catch (error) {
                        setDisplayError(getErrorMessage(error, "메인 카피 저장 중 문제가 발생했습니다."));
                      }
                    })();
                  });
                }}
              >
                <label className="grid gap-2">
                  <span className="text-sm font-medium">메인 제목</span>
                  <input
                    name="heroTitle"
                    required
                    value={displayForm.heroTitle}
                    onChange={(event) =>
                      setDisplayForm((current) => ({ ...current, heroTitle: event.target.value }))
                    }
                    className="admin-input px-4 py-3"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-medium">메인 설명</span>
                  <textarea
                    name="heroSubtitle"
                    required
                    rows={4}
                    value={displayForm.heroSubtitle}
                    onChange={(event) =>
                      setDisplayForm((current) => ({ ...current, heroSubtitle: event.target.value }))
                    }
                    className="admin-input px-4 py-3"
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-sm font-medium">CTA 문구</span>
                    <input
                      name="heroCtaLabel"
                      required
                      value={displayForm.heroCtaLabel}
                      onChange={(event) =>
                        setDisplayForm((current) => ({ ...current, heroCtaLabel: event.target.value }))
                      }
                      className="admin-input px-4 py-3"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-medium">CTA 링크</span>
                    <input
                      name="heroCtaHref"
                      required
                      value={displayForm.heroCtaHref}
                      onChange={(event) =>
                        setDisplayForm((current) => ({ ...current, heroCtaHref: event.target.value }))
                      }
                      className="admin-input px-4 py-3"
                    />
                  </label>
                </div>
                {displayMessage ? <p className="text-sm text-[var(--teal)]">{displayMessage}</p> : null}
                {displayError ? <p className="text-sm text-red-600">{displayError}</p> : null}
                <button type="submit" disabled={isSavingDisplay} className="admin-button px-6 py-4 disabled:opacity-60">
                  {isSavingDisplay ? "저장 중입니다." : "메인 카피 저장"}
                </button>
              </form>
            </article>

            <AdminDisplayManager initialDisplay={display} />
            <AdminCategoryManager initialCategories={initialCategories} />
            <AdminStatisticsPanel statistics={initialStatistics} />
            <AdminMemberManager members={members} onMemberUpdated={handleMemberUpdated} />
          </section>

          <section className="grid gap-6">
            <article className="admin-card rounded-[36px] p-8">
              <p className="eyebrow text-[var(--ink-soft)]">Recent Orders</p>
              <h2 className="display mt-4 text-3xl font-semibold">최근 운영 흐름</h2>
              <div className="mt-8 space-y-4">
                {dashboard.recentOrders.map((order) => (
                  <div key={order.orderNumber} className="rounded-[28px] border border-[var(--line)] bg-white/72 p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-lg font-semibold">{order.orderNumber}</p>
                        <p className="mt-2 text-sm text-[var(--ink-soft)]">
                          {order.customerName} · {order.customerType}
                        </p>
                      </div>
                      <div className="space-y-1 text-sm sm:text-right">
                        <p className="font-semibold">{formatStatus(order.status)}</p>
                        <p className="text-[var(--ink-soft)]">{formatDateTime(order.createdAt)}</p>
                        <p>{formatPrice(order.total)}원</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="admin-card rounded-[36px] p-8">
              <p className="eyebrow text-[var(--ink-soft)]">Featured Picks</p>
              <h2 className="display mt-4 text-3xl font-semibold">현재 추천 상품</h2>
              <div className="mt-8 grid gap-4">
                {dashboard.spotlightProducts.map((product) => (
                  <div key={product.id} className="grid gap-4 rounded-[28px] border border-[var(--line)] bg-white/72 p-5 sm:grid-cols-[88px_minmax(0,1fr)]">
                    <div className="relative min-h-[88px] overflow-hidden rounded-[22px]">
                      <Image src={product.imageUrl} alt={product.imageAlt} fill sizes="88px" className="object-cover" />
                    </div>
                    <div>
                      <p className="eyebrow text-[var(--ink-soft)]">{product.categoryName}</p>
                      <p className="mt-2 text-lg font-semibold">{product.name}</p>
                      <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">{product.summary}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </div>

        <article className="admin-card rounded-[36px] p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow text-[var(--ink-soft)]">Products</p>
              <h2 className="display mt-4 text-3xl font-semibold">상품 편집</h2>
            </div>
            <input
              name="productQuery"
              value={productQuery}
              onChange={(event) => setProductQuery(event.target.value)}
              className="admin-input min-w-[240px] px-4 py-3"
              placeholder="상품명, 카테고리, 배지 검색"
            />
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
            <div className="space-y-3">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => syncSelectedProduct(product.id, products)}
                  className={`w-full rounded-[26px] border px-5 py-4 text-left transition ${
                    selectedProduct?.id === product.id
                      ? "border-[var(--accent)] bg-[rgba(214,81,45,0.08)]"
                      : "border-[var(--line)] bg-white/70 hover:border-[var(--line-strong)]"
                  }`}
                >
                  <p className="eyebrow text-[var(--ink-soft)]">{product.categoryName}</p>
                  <p className="mt-2 text-lg font-semibold">{product.name}</p>
                  <p className="mt-2 text-sm text-[var(--ink-soft)]">
                    재고 {product.stock} · 인기 {product.popularityScore}
                  </p>
                </button>
              ))}
            </div>

            {selectedProduct ? (
              <form
                className="grid gap-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  setProductMessage("");
                  setProductError("");

                  startSavingProduct(() => {
                    void (async () => {
                      try {
                        const updatedProduct = await updateProduct(selectedProduct.id, productForm);
                        const nextProducts = products.map((product) =>
                          product.id === updatedProduct.id ? updatedProduct : product,
                        );
                        setProducts(nextProducts);
                        setDashboard((current) => ({
                          ...current,
                          spotlightProducts: nextProducts.filter((product) => product.featured).slice(0, 4),
                          featuredProductCount: nextProducts.filter((product) => product.featured).length,
                          lowStockCount: nextProducts.filter((product) => product.stock <= 5).length,
                        }));
                        syncSelectedProduct(updatedProduct.id, nextProducts);
                        setProductMessage("상품 정보를 저장했습니다.");
                      } catch (error) {
                        setProductError(getErrorMessage(error, "상품 저장 중 문제가 발생했습니다."));
                      }
                    })();
                  });
                }}
              >
                <div className="grid gap-4 md:grid-cols-[120px_minmax(0,1fr)]">
                  <div className="relative min-h-[120px] overflow-hidden rounded-[30px]">
                    <Image src={selectedProduct.imageUrl} alt={selectedProduct.imageAlt} fill sizes="120px" className="object-cover" />
                  </div>
                  <div className="rounded-[30px] border border-[var(--line)] bg-white/62 p-5">
                    <p className="eyebrow text-[var(--ink-soft)]">{selectedProduct.categoryName}</p>
                    <p className="mt-3 text-2xl font-semibold">{selectedProduct.slug}</p>
                    <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
                      storefront 카드와 검색 결과에 바로 반영되는 핵심 필드를 편집합니다.
                    </p>
                  </div>
                </div>

                <label className="grid gap-2">
                  <span className="text-sm font-medium">상품명</span>
                  <input
                    name="productName"
                    value={productForm.name}
                    onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))}
                    className="admin-input px-4 py-3"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-medium">상품 요약</span>
                  <textarea
                    name="productSummary"
                    rows={3}
                    value={productForm.summary}
                    onChange={(event) => setProductForm((current) => ({ ...current, summary: event.target.value }))}
                    className="admin-input px-4 py-3"
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <label className="grid gap-2">
                    <span className="text-sm font-medium">배지</span>
                    <input
                      name="productBadge"
                      value={productForm.badge}
                      onChange={(event) => setProductForm((current) => ({ ...current, badge: event.target.value }))}
                      className="admin-input px-4 py-3"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-medium">가격</span>
                    <input
                      name="productPrice"
                      type="number"
                      min={0}
                      value={productForm.price}
                      onChange={(event) => setProductForm((current) => ({ ...current, price: Number(event.target.value) }))}
                      className="admin-input px-4 py-3"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-medium">재고</span>
                    <input
                      name="productStock"
                      type="number"
                      min={0}
                      value={productForm.stock}
                      onChange={(event) => setProductForm((current) => ({ ...current, stock: Number(event.target.value) }))}
                      className="admin-input px-4 py-3"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-medium">인기 점수</span>
                    <input
                      name="productPopularityScore"
                      type="number"
                      min={0}
                      value={productForm.popularityScore}
                      onChange={(event) =>
                        setProductForm((current) => ({
                          ...current,
                          popularityScore: Number(event.target.value),
                        }))
                      }
                      className="admin-input px-4 py-3"
                    />
                  </label>
                </div>
                <label className="flex items-center gap-3 rounded-[24px] border border-[var(--line)] bg-white/62 px-4 py-3 text-sm text-[var(--ink-soft)]">
                  <input
                    name="productFeatured"
                    type="checkbox"
                    checked={productForm.featured}
                    onChange={(event) => setProductForm((current) => ({ ...current, featured: event.target.checked }))}
                  />
                  메인 추천 상품으로 노출
                </label>
                {productMessage ? <p className="text-sm text-[var(--teal)]">{productMessage}</p> : null}
                {productError ? <p className="text-sm text-red-600">{productError}</p> : null}
                <button type="submit" disabled={isSavingProduct} className="admin-button px-6 py-4 disabled:opacity-60">
                  {isSavingProduct ? "저장 중입니다." : "상품 저장"}
                </button>
              </form>
            ) : null}
          </div>
        </article>

        <article className="admin-card rounded-[36px] p-8">
          <p className="eyebrow text-[var(--ink-soft)]">Orders</p>
          <h2 className="display mt-4 text-3xl font-semibold">주문 상태 관리</h2>
          <div className="mt-8 space-y-4">
            {orders.map((order) => (
              <div key={order.orderNumber} data-order-number={order.orderNumber} className="grid gap-4 rounded-[28px] border border-[var(--line)] bg-white/72 p-5 lg:grid-cols-[minmax(0,1fr)_220px]">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-lg font-semibold">{order.orderNumber}</p>
                    <span className="rounded-full bg-[rgba(36,93,90,0.12)] px-3 py-1 text-xs font-semibold text-[var(--teal)]">
                      {formatStatus(order.status)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
                    {order.customerName} · {order.customerType} · {order.phone}
                  </p>
                  <p className="mt-1 text-sm leading-7 text-[var(--ink-soft)]">
                    {order.itemCount}개 상품 · {order.paymentMethod} · {order.paymentStatus}
                  </p>
                  <p className="mt-1 text-sm leading-7 text-[var(--ink-soft)]">
                    {formatDateTime(order.createdAt)} · {formatPrice(order.total)}원
                  </p>
                </div>
                <div className="grid gap-3">
                  <select
                    name={`orderStatus-${order.orderNumber}`}
                    value={order.status}
                    onChange={(event) =>
                      setOrders((current) =>
                        current.map((item) =>
                          item.orderNumber === order.orderNumber ? { ...item, status: event.target.value } : item,
                        ),
                      )
                    }
                    className="admin-input px-4 py-3"
                  >
                    <option value="PENDING_PAYMENT">결제 대기</option>
                    <option value="PAID">결제 완료</option>
                    <option value="PREPARING">상품 준비중</option>
                    <option value="SHIPPED">배송중</option>
                    <option value="DELIVERED">배송 완료</option>
                    <option value="REFUND_REQUESTED">환불 요청</option>
                    <option value="REFUNDED">환불 완료</option>
                    <option value="CANCELLED">주문 취소</option>
                  </select>
                  <button
                    type="button"
                    aria-label={`${order.orderNumber} 상태 저장`}
                    disabled={isSavingOrder}
                    onClick={() => {
                      setOrderMessage("");
                      setOrderError("");
                      startSavingOrder(() => {
                        void (async () => {
                          try {
                            const nextStatus =
                              orders.find((item) => item.orderNumber === order.orderNumber)?.status ?? order.status;
                            const nextOrder = await updateOrderStatus(order.orderNumber, { status: nextStatus });
                            setOrders((current) =>
                              current.map((item) => (item.orderNumber === nextOrder.orderNumber ? nextOrder : item)),
                            );
                            setDashboard((current) => ({
                              ...current,
                              recentOrders: current.recentOrders.map((item) =>
                                item.orderNumber === nextOrder.orderNumber ? nextOrder : item,
                              ),
                            }));
                            setOrderMessage(`${nextOrder.orderNumber} 상태를 저장했습니다.`);
                          } catch (error) {
                            setOrderError(getErrorMessage(error, "주문 상태 저장 중 문제가 발생했습니다."));
                          }
                        })();
                      });
                    }}
                    className="admin-button-secondary px-5 py-3 disabled:opacity-60"
                  >
                    상태 저장
                  </button>
                </div>
              </div>
            ))}
          </div>
          {orderMessage ? <p className="mt-5 text-sm text-[var(--teal)]">{orderMessage}</p> : null}
          {orderError ? <p className="mt-5 text-sm text-red-600">{orderError}</p> : null}
        </article>
      </div>
    </main>
  );
}
