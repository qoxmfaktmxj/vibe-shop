"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";

import { createProduct, updateProduct } from "@/lib/admin-client-api";
import type {
  AdminCategory,
  AdminProduct,
  CreateAdminProductPayload,
  UpdateAdminProductPayload,
} from "@/lib/admin-contracts";

type ProductEditorForm = CreateAdminProductPayload;

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
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, startSaving] = useTransition();

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
  }

  return (
    <article className="admin-card rounded-[36px] p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow text-[var(--ink-soft)]">Products</p>
          <h2 className="display mt-4 text-3xl font-semibold">
            Product Catalog Control
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
            Create new products for the storefront and keep price, stock, badge,
            and featured status aligned from one workspace.
          </p>
        </div>
        <input
          name="productQuery"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="admin-input min-w-[260px] px-4 py-3"
          placeholder="Search product, slug, or badge"
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => {
              setMessage("");
              setError("");
              startNewProduct();
            }}
            disabled={!categories.length}
            className="admin-button-secondary w-full px-5 py-4 disabled:opacity-60"
          >
            New product
          </button>

          {filteredProducts.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => {
                setMessage("");
                setError("");
                selectExistingProduct(product.id);
              }}
              className={`w-full rounded-[26px] border px-5 py-4 text-left transition ${
                selectedProduct?.id === product.id
                  ? "border-[var(--accent)] bg-[rgba(214,81,45,0.08)]"
                  : "border-[var(--line)] bg-white/70 hover:border-[var(--line-strong)]"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-lg font-semibold">{product.name}</p>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                  {product.featured ? "FEATURED" : "STANDARD"}
                </span>
              </div>
              <p className="mt-2 text-sm text-[var(--ink-soft)]">
                {product.categoryName} / {product.slug}
              </p>
              <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
                {product.summary}
              </p>
              <p className="mt-3 text-xs text-[var(--ink-soft)]">
                Stock {product.stock} · Popularity {product.popularityScore}
              </p>
            </button>
          ))}
        </div>

        <form
          className="grid gap-4 rounded-[28px] border border-[var(--line)] bg-white/70 p-6"
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
                    setMessage("Product created.");
                    return;
                  }

                  if (!selectedProduct) {
                    setError("Select a product first.");
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
                  setMessage("Product updated.");
                } catch (saveError) {
                  setError(
                    getErrorMessage(
                      saveError,
                      isCreateMode
                        ? "Failed to create the product."
                        : "Failed to update the product.",
                    ),
                  );
                }
              })();
            });
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow text-[var(--ink-soft)]">Product Editor</p>
              <h3 className="mt-2 text-xl font-semibold">
                {isCreateMode ? "New product" : "Edit product"}
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
              Featured
            </label>
          </div>

          {isCreateMode ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-medium">Category</span>
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
                <span className="text-sm font-medium">Slug</span>
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
          ) : selectedProduct ? (
            <div className="grid gap-4 md:grid-cols-[120px_minmax(0,1fr)]">
              <div className="relative min-h-[120px] overflow-hidden rounded-[30px]">
                <Image
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.imageAlt}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </div>
              <div className="rounded-[30px] border border-[var(--line)] bg-white/62 p-5">
                <p className="eyebrow text-[var(--ink-soft)]">
                  {selectedProduct.categoryName}
                </p>
                <p className="mt-3 text-2xl font-semibold">
                  {selectedProduct.slug}
                </p>
                <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
                  Structural fields such as category, slug, and primary media stay
                  fixed here. Use the create flow when you need a new product
                  record.
                </p>
              </div>
            </div>
          ) : null}

          <label className="grid gap-2">
            <span className="text-sm font-medium">Name</span>
            <input
              name="productName"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              className="admin-input px-4 py-3"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium">Summary</span>
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
              <span className="text-sm font-medium">Description</span>
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

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <label className="grid gap-2">
              <span className="text-sm font-medium">Badge</span>
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
              <span className="text-sm font-medium">Price</span>
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
              <span className="text-sm font-medium">Stock</span>
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
              <span className="text-sm font-medium">Popularity</span>
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

          {isCreateMode ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-medium">Accent color</span>
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
                  <span className="text-sm font-medium">Image URL</span>
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
                <span className="text-sm font-medium">Image alt</span>
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
                  alt={form.imageAlt || form.name || "Product preview"}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[rgba(11,14,22,0.72)] to-transparent" />
                <div className="relative flex h-full flex-col justify-end p-6 text-white">
                  <p className="eyebrow text-white/70">
                    {selectedCategory?.name ?? "Category"}
                  </p>
                  <h4 className="mt-3 text-2xl font-semibold">
                    {form.name || "Product name"}
                  </h4>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-white/76">
                    {form.summary || "Short product summary for the storefront."}
                  </p>
                </div>
              </div>
            </>
          ) : null}

          {message ? (
            <p className="text-sm text-[var(--teal)]">{message}</p>
          ) : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {!categories.length ? (
            <p className="text-sm text-red-600">
              Create a category first before adding products.
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSaving || (!categories.length && isCreateMode)}
            className="admin-button w-fit px-6 py-4 disabled:opacity-60"
          >
            {isSaving
              ? isCreateMode
                ? "Creating..."
                : "Saving..."
              : isCreateMode
                ? "Create product"
                : "Update product"}
          </button>
        </form>
      </div>
    </article>
  );
}
