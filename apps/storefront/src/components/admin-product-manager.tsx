"use client";

import Image from "next/image";
import { useState, useTransition } from "react";

import { updateProduct } from "@/lib/admin-client-api";
import type { AdminProduct, UpdateAdminProductPayload } from "@/lib/admin-contracts";

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

export function AdminProductManager({
  initialProducts,
}: {
  initialProducts: AdminProduct[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState("");
  const [selectedProductId, setSelectedProductId] = useState(initialProducts[0]?.id ?? 0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, startSaving] = useTransition();

  const filteredProducts = products.filter((product) => {
    const normalizedQuery = query.trim().toLowerCase();
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

  const [form, setForm] = useState<UpdateAdminProductPayload>(
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
    const nextProduct = sourceProducts.find((item) => item.id === productId) ?? sourceProducts[0];
    if (!nextProduct) {
      return;
    }

    setSelectedProductId(nextProduct.id);
    setForm(createProductForm(nextProduct));
  }

  return (
    <article className="admin-card rounded-[36px] p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-[var(--ink-soft)]">Products</p>
          <h2 className="display mt-4 text-3xl font-semibold">Product editing</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
            Search the catalog and update pricing, stock, badging, and featured placement from a page dedicated to product operations.
          </p>
        </div>

        <input
          name="productQuery"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="admin-input min-w-[260px] px-4 py-3"
          placeholder="Search products"
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
                Stock {product.stock} · Popularity {product.popularityScore}
              </p>
            </button>
          ))}
        </div>

        {selectedProduct ? (
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              setMessage("");
              setError("");

              startSaving(() => {
                void (async () => {
                  try {
                    const updatedProduct = await updateProduct(selectedProduct.id, form);
                    const nextProducts = products.map((product) =>
                      product.id === updatedProduct.id ? updatedProduct : product,
                    );
                    setProducts(nextProducts);
                    syncSelectedProduct(updatedProduct.id, nextProducts);
                    setMessage("Product updated.");
                  } catch (saveError) {
                    setError(getErrorMessage(saveError, "Failed to update product."));
                  }
                })();
              });
            }}
          >
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
                <p className="eyebrow text-[var(--ink-soft)]">{selectedProduct.categoryName}</p>
                <p className="mt-3 text-2xl font-semibold">{selectedProduct.slug}</p>
                <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
                  This editor is now isolated from orders, display, reviews, and member state.
                </p>
              </div>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-medium">Name</span>
              <input
                name="productName"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
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
                  setForm((current) => ({ ...current, summary: event.target.value }))
                }
                className="admin-input px-4 py-3"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <label className="grid gap-2">
                <span className="text-sm font-medium">Badge</span>
                <input
                  name="productBadge"
                  value={form.badge}
                  onChange={(event) => setForm((current) => ({ ...current, badge: event.target.value }))}
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
                    setForm((current) => ({ ...current, price: Number(event.target.value) }))
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
                    setForm((current) => ({ ...current, stock: Number(event.target.value) }))
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

            <label className="flex items-center gap-3 rounded-[24px] border border-[var(--line)] bg-white/62 px-4 py-3 text-sm text-[var(--ink-soft)]">
              <input
                name="productFeatured"
                type="checkbox"
                checked={form.featured}
                onChange={(event) =>
                  setForm((current) => ({ ...current, featured: event.target.checked }))
                }
              />
              Feature on storefront
            </label>

            {message ? <p className="text-sm text-[var(--teal)]">{message}</p> : null}
            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <button type="submit" disabled={isSaving} className="admin-button w-fit px-6 py-4 disabled:opacity-60">
              {isSaving ? "Saving" : "Save product"}
            </button>
          </form>
        ) : null}
      </div>
    </article>
  );
}
