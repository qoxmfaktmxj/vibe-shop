"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import { createProduct, updateProduct } from "@/lib/admin-client-api";
import type {
  AdminCategory,
  AdminProduct,
  CreateAdminProductPayload,
  UpdateAdminProductPayload,
} from "@/lib/admin-contracts";
import { formatPrice } from "@/lib/currency";

type ProductEditorForm = CreateAdminProductPayload;

const PRODUCTS_PER_PAGE = 8;

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function createEmptyProductForm(categories: AdminCategory[]): ProductEditorForm {
  const firstCategory = categories[0];

  return {
    categorySlug: firstCategory?.slug ?? "",
    slug: "",
    name: "",
    summary: "",
    description: "",
    price: 0,
    badge: "NEW",
    accentColor: firstCategory?.accentColor ?? "#D6512D",
    imageUrl: "/images/products/living-01.jpg",
    imageAlt: "",
    featured: false,
    stock: 0,
    popularityScore: 0,
  };
}

function createProductForm(
  product: AdminProduct,
  categories: AdminCategory[],
): ProductEditorForm {
  const matchedCategory = categories.find(
    (category) => category.slug === product.categorySlug,
  );

  return {
    categorySlug: product.categorySlug,
    slug: product.slug,
    name: product.name,
    summary: product.summary,
    description: product.summary,
    price: product.price,
    badge: product.badge,
    accentColor: matchedCategory?.accentColor ?? "#D6512D",
    imageUrl: product.imageUrl,
    imageAlt: product.imageAlt,
    featured: product.featured,
    stock: product.stock,
    popularityScore: product.popularityScore,
  };
}

function toUpdatePayload(form: ProductEditorForm): UpdateAdminProductPayload {
  return {
    name: form.name,
    summary: form.summary,
    badge: form.badge,
    price: form.price,
    stock: form.stock,
    popularityScore: form.popularityScore,
    featured: form.featured,
  };
}

export function AdminProductManager({
  initialProducts,
  categories,
}: {
  initialProducts: AdminProduct[];
  categories: AdminCategory[];
}) {
  const initialSelectedProduct = initialProducts[0] ?? null;

  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    initialSelectedProduct?.id ?? null,
  );
  const [form, setForm] = useState<ProductEditorForm>(() =>
    initialSelectedProduct
      ? createProductForm(initialSelectedProduct, categories)
      : createEmptyProductForm(categories),
  );
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, startSaving] = useTransition();
  const editorRef = useRef<HTMLFormElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return products;
    }

    return products.filter((product) =>
      [
        product.name,
        product.summary,
        product.slug,
        product.categoryName,
        product.badge,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [products, query]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE),
  );
  const currentPage = Math.min(page, totalPages);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE,
  );

  const selectedProduct =
    selectedProductId === null
      ? null
      : products.find((product) => product.id === selectedProductId) ??
        filteredProducts[0] ??
        null;
  const selectedCategory =
    categories.find((category) => category.slug === form.categorySlug) ??
    categories[0] ??
    null;
  const isCreateMode = selectedProductId === null;

  useEffect(() => {
    if (!isCreateMode) {
      return;
    }

    editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    nameInputRef.current?.focus();
  }, [isCreateMode]);

  function selectExistingProduct(productId: number) {
    const nextProduct = products.find((product) => product.id === productId);
    if (!nextProduct) {
      return;
    }

    setSelectedProductId(nextProduct.id);
    setForm(createProductForm(nextProduct, categories));
  }

  function startNewProduct() {
    setSelectedProductId(null);
    setForm(createEmptyProductForm(categories));
    setPage(1);
  }

  return (
    <article className="admin-card rounded-[36px] p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow text-[var(--ink-soft)]">상품 관리</p>
          <h2 className="display mt-4 text-3xl font-semibold">
            상품 목록과 등록을 분리한 편집 화면
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
            왼쪽에서는 상품을 빠르게 스캔하고, 오른쪽에서는 선택한 상품 편집 또는
            신규 등록 작업만 집중해서 처리할 수 있도록 구성했습니다.
          </p>
        </div>

        <input
          name="productQuery"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
          className="admin-input min-w-[260px] px-4 py-3"
          placeholder="상품명, 슬러그, 배지 검색"
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 rounded-[24px] border border-[var(--line)] bg-white/70 px-4 py-3 text-sm text-[var(--ink-soft)]">
            <div>
              총{" "}
              <span className="font-semibold text-[var(--ink)]">
                {filteredProducts.length}
              </span>
              개
            </div>
            <div>
              {currentPage} / {totalPages} 페이지
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setMessage("");
              setError("");
              startNewProduct();
            }}
            disabled={!categories.length}
            className={`w-full rounded-[24px] border px-5 py-4 text-sm font-semibold transition disabled:opacity-60 ${
              isCreateMode
                ? "border-[var(--accent)] bg-[rgba(214,81,45,0.1)] text-[var(--ink)]"
                : "border-[var(--line)] bg-white/80 text-[var(--ink-soft)] hover:border-[var(--line-strong)] hover:text-[var(--ink)]"
            }`}
          >
            새 상품 등록
          </button>

          <div className="space-y-3 xl:max-h-[calc(100vh-23rem)] xl:overflow-y-auto xl:pr-2">
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => {
                    setMessage("");
                    setError("");
                    selectExistingProduct(product.id);
                  }}
                  className={`w-full rounded-[26px] border px-4 py-4 text-left transition ${
                    selectedProduct?.id === product.id
                      ? "border-[var(--accent)] bg-[rgba(214,81,45,0.08)]"
                      : "border-[var(--line)] bg-white/70 hover:border-[var(--line-strong)]"
                  }`}
                >
                  <div className="grid gap-4 sm:grid-cols-[84px_minmax(0,1fr)]">
                    <div className="relative min-h-[84px] overflow-hidden rounded-[20px] border border-[var(--line)] bg-white">
                      <Image
                        src={product.imageUrl}
                        alt={product.imageAlt}
                        fill
                        sizes="84px"
                        className="object-cover"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-base font-semibold text-[var(--ink)]">
                            {product.name}
                          </p>
                          <p className="mt-1 text-xs text-[var(--ink-soft)]">
                            {product.categoryName} / {product.slug}
                          </p>
                        </div>
                        <span className="rounded-full border border-[var(--line)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                          {product.featured ? "대표" : "일반"}
                        </span>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
                        {product.summary}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--ink-soft)]">
                        <span className="rounded-full bg-[rgba(16,33,39,0.06)] px-2.5 py-1 font-semibold text-[var(--ink)]">
                          {formatPrice(product.price)}원
                        </span>
                        <span className="rounded-full bg-[rgba(16,33,39,0.04)] px-2.5 py-1">
                          재고 {product.stock}
                        </span>
                        <span className="rounded-full bg-[rgba(16,33,39,0.04)] px-2.5 py-1">
                          인기 {product.popularityScore}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="rounded-[24px] border border-[var(--line)] bg-white/70 px-5 py-6 text-sm leading-7 text-[var(--ink-soft)]">
                검색 조건에 맞는 상품이 없습니다.
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="admin-button-secondary px-4 py-3 disabled:opacity-50"
            >
              이전
            </button>
            <p className="text-xs text-[var(--ink-soft)]">
              {filteredProducts.length === 0
                ? "결과 없음"
                : `${(currentPage - 1) * PRODUCTS_PER_PAGE + 1}-${Math.min(
                    currentPage * PRODUCTS_PER_PAGE,
                    filteredProducts.length,
                  )}번째 상품 표시`}
            </p>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              className="admin-button-secondary px-4 py-3 disabled:opacity-50"
            >
              다음
            </button>
          </div>
        </div>

        <form
          ref={editorRef}
          className="grid gap-4 self-start rounded-[28px] border border-[var(--line)] bg-white/70 p-6 xl:sticky xl:top-6 xl:max-h-[calc(100vh-13rem)] xl:overflow-y-auto"
          onSubmit={(event) => {
            event.preventDefault();
            setMessage("");
            setError("");

            startSaving(() => {
              void (async () => {
                try {
                  if (isCreateMode) {
                    const createdProduct = await createProduct(form);
                    const nextProducts = [createdProduct, ...products];
                    setProducts(nextProducts);
                    setSelectedProductId(createdProduct.id);
                    setForm(createProductForm(createdProduct, categories));
                    setPage(1);
                    setMessage("상품을 등록했습니다.");
                    return;
                  }

                  if (!selectedProduct) {
                    setError("먼저 편집할 상품을 선택해 주세요.");
                    return;
                  }

                  const updatedProduct = await updateProduct(
                    selectedProduct.id,
                    toUpdatePayload(form),
                  );
                  const nextProducts = products.map((product) =>
                    product.id === updatedProduct.id ? updatedProduct : product,
                  );
                  setProducts(nextProducts);
                  setForm(createProductForm(updatedProduct, categories));
                  setMessage("상품 정보를 저장했습니다.");
                } catch (saveError) {
                  setError(
                    getErrorMessage(
                      saveError,
                      isCreateMode
                        ? "상품을 등록하지 못했습니다."
                        : "상품 정보를 저장하지 못했습니다.",
                    ),
                  );
                }
              })();
            });
          }}
        >
          <div
            className={`rounded-[24px] border px-5 py-5 ${
              isCreateMode
                ? "border-[rgba(214,81,45,0.2)] bg-[rgba(214,81,45,0.08)]"
                : "border-[var(--line)] bg-white/72"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow text-[var(--ink-soft)]">
                  {isCreateMode ? "새 상품 등록" : "상품 편집"}
                </p>
                <h3 className="mt-2 text-xl font-semibold">
                  {isCreateMode
                    ? "새 상품을 만드는 중입니다"
                    : "선택한 상품을 수정합니다"}
                </h3>
              </div>
              <label className="flex items-center gap-2 text-sm text-[var(--ink-soft)]">
                <input
                  name="productFeatured"
                  type="checkbox"
                  checked={form.featured}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      featured: event.target.checked,
                    }))
                  }
                />
                대표 노출
              </label>
            </div>
            <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
              {isCreateMode
                ? "왼쪽 목록과 분리된 전용 편집 패널에서 핵심 필드만 채우면 바로 등록됩니다."
                : "현재 선택한 상품의 판매 정보와 노출 상태를 빠르게 조정할 수 있습니다."}
            </p>
          </div>

          {isCreateMode ? (
            <div className="grid gap-4 rounded-[24px] border border-[var(--line)] bg-white/72 p-5">
              <p className="eyebrow text-[var(--ink-soft)]">기본 정보</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-medium">카테고리</span>
                  <select
                    name="productCategorySlug"
                    value={form.categorySlug}
                    onChange={(event) => {
                      const nextCategory = categories.find(
                        (category) => category.slug === event.target.value,
                      );
                      setForm((current) => ({
                        ...current,
                        categorySlug: event.target.value,
                        accentColor:
                          nextCategory?.accentColor ?? current.accentColor,
                      }));
                    }}
                    className="admin-input px-4 py-3"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-medium">슬러그</span>
                  <input
                    name="productSlug"
                    value={form.slug}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        slug: event.target.value,
                      }))
                    }
                    className="admin-input px-4 py-3"
                  />
                </label>
              </div>
            </div>
          ) : null}

          {!isCreateMode && selectedProduct ? (
            <div className="grid gap-4 rounded-[24px] border border-[var(--line)] bg-white/72 p-5 md:grid-cols-[120px_minmax(0,1fr)]">
              <div className="relative min-h-[120px] overflow-hidden rounded-[30px]">
                <Image
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.imageAlt}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="eyebrow text-[var(--ink-soft)]">
                  {selectedProduct.categoryName}
                </p>
                <p className="mt-3 text-2xl font-semibold">
                  {selectedProduct.slug}
                </p>
                <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
                  카테고리, 슬러그, 대표 이미지는 등록 이후 고정됩니다. 새 상품이
                  필요할 때는 왼쪽의{" "}
                  <span className="font-semibold text-[var(--ink)]">
                    새 상품 등록
                  </span>
                  으로 전환하세요.
                </p>
              </div>
            </div>
          ) : null}

          <div className="grid gap-4 rounded-[24px] border border-[var(--line)] bg-white/72 p-5">
            <p className="eyebrow text-[var(--ink-soft)]">판매 정보</p>
            <label className="grid gap-2">
              <span className="text-sm font-medium">상품명</span>
              <input
                ref={nameInputRef}
                name="productName"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                className="admin-input px-4 py-3"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium">한 줄 요약</span>
              <textarea
                name="productSummary"
                rows={3}
                value={form.summary}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    summary: event.target.value,
                  }))
                }
                className="admin-input px-4 py-3"
              />
            </label>

            {isCreateMode ? (
              <label className="grid gap-2">
                <span className="text-sm font-medium">상세 설명</span>
                <textarea
                  name="productDescription"
                  rows={4}
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  className="admin-input px-4 py-3"
                />
              </label>
            ) : null}
          </div>

          <div className="grid gap-4 rounded-[24px] border border-[var(--line)] bg-white/72 p-5">
            <p className="eyebrow text-[var(--ink-soft)]">가격과 재고</p>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <label className="grid gap-2">
                <span className="text-sm font-medium">배지</span>
                <input
                  name="productBadge"
                  value={form.badge}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      badge: event.target.value,
                    }))
                  }
                  className="admin-input px-4 py-3"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium">가격</span>
                <input
                  name="productPrice"
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      price: Number(event.target.value),
                    }))
                  }
                  className="admin-input px-4 py-3"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium">재고</span>
                <input
                  name="productStock"
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      stock: Number(event.target.value),
                    }))
                  }
                  className="admin-input px-4 py-3"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium">인기 점수</span>
                <input
                  name="productPopularityScore"
                  type="number"
                  min={0}
                  value={form.popularityScore}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      popularityScore: Number(event.target.value),
                    }))
                  }
                  className="admin-input px-4 py-3"
                />
              </label>
            </div>
          </div>

          {isCreateMode ? (
            <div className="grid gap-4 rounded-[24px] border border-[var(--line)] bg-white/72 p-5">
              <p className="eyebrow text-[var(--ink-soft)]">이미지와 미리보기</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-medium">강조 색상</span>
                  <input
                    name="productAccentColor"
                    value={form.accentColor}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        accentColor: event.target.value,
                      }))
                    }
                    className="admin-input px-4 py-3"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-medium">이미지 URL</span>
                  <input
                    name="productImageUrl"
                    value={form.imageUrl}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        imageUrl: event.target.value,
                      }))
                    }
                    className="admin-input px-4 py-3"
                  />
                </label>
              </div>

              <label className="grid gap-2">
                <span className="text-sm font-medium">이미지 대체 텍스트</span>
                <input
                  name="productImageAlt"
                  value={form.imageAlt}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      imageAlt: event.target.value,
                    }))
                  }
                  className="admin-input px-4 py-3"
                />
              </label>

              <div className="relative min-h-[220px] overflow-hidden rounded-[24px] border border-[var(--line)]">
                <Image
                  src={form.imageUrl}
                  alt={form.imageAlt || form.name || "상품 미리보기"}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[rgba(11,14,22,0.72)] to-transparent" />
                <div className="relative flex h-full flex-col justify-end p-6 text-white">
                  <p className="eyebrow text-white/70">
                    {selectedCategory?.name ?? "카테고리"}
                  </p>
                  <h4 className="mt-3 text-2xl font-semibold">
                    {form.name || "상품명 미리보기"}
                  </h4>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-white/76">
                    {form.summary ||
                      "상품 요약을 입력하면 여기에 미리보기가 표시됩니다."}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {message ? <p className="text-sm text-[var(--teal)]">{message}</p> : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {!categories.length ? (
            <p className="text-sm text-red-600">
              상품을 추가하기 전에 카테고리를 먼저 만들어 주세요.
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSaving || (!categories.length && isCreateMode)}
            className="admin-button w-fit px-6 py-4 disabled:opacity-60"
          >
            {isSaving
              ? isCreateMode
                ? "등록 중..."
                : "저장 중..."
              : isCreateMode
                ? "상품 등록"
                : "상품 저장"}
          </button>
        </form>
      </div>
    </article>
  );
}
