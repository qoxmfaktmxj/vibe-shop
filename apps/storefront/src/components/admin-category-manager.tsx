"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";

import { createCategory, deleteCategory, updateCategory } from "@/lib/admin-client-api";
import type { AdminCategory, AdminCategoryPayload } from "@/lib/admin-contracts";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function createCategoryForm(category: AdminCategory): AdminCategoryPayload {
  return {
    slug: category.slug,
    name: category.name,
    description: category.description,
    accentColor: category.accentColor,
    displayOrder: category.displayOrder,
    visible: category.visible,
    coverImageUrl: category.coverImageUrl,
    coverImageAlt: category.coverImageAlt,
    heroTitle: category.heroTitle,
    heroSubtitle: category.heroSubtitle,
  };
}

function createEmptyCategoryForm(): AdminCategoryPayload {
  return {
    slug: "",
    name: "",
    description: "",
    accentColor: "#D6512D",
    displayOrder: 100,
    visible: true,
    coverImageUrl: "/images/products/living-01.jpg",
    coverImageAlt: "",
    heroTitle: "",
    heroSubtitle: "",
  };
}

function sortCategories(categories: AdminCategory[]) {
  return [...categories].sort((left, right) => {
    if (left.displayOrder !== right.displayOrder) {
      return left.displayOrder - right.displayOrder;
    }
    return left.id - right.id;
  });
}

export function AdminCategoryManager({ initialCategories }: { initialCategories: AdminCategory[] }) {
  const [categories, setCategories] = useState(sortCategories(initialCategories));
  const [query, setQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(initialCategories[0]?.id ?? null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, startSaving] = useTransition();
  const [isDeleting, startDeleting] = useTransition();

  const filteredCategories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return categories;
    }

    return categories.filter((category) =>
      [category.slug, category.name, category.description, category.heroTitle]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [categories, query]);

  const selectedCategory =
    categories.find((category) => category.id === selectedCategoryId) ?? filteredCategories[0] ?? null;

  const [categoryForm, setCategoryForm] = useState<AdminCategoryPayload>(
    selectedCategory ? createCategoryForm(selectedCategory) : createEmptyCategoryForm(),
  );

  function selectCategory(categoryId: number | null, source = categories) {
    if (categoryId === null) {
      setSelectedCategoryId(null);
      setCategoryForm(createEmptyCategoryForm());
      return;
    }

    const nextCategory = source.find((category) => category.id === categoryId);
    if (!nextCategory) {
      return;
    }

    setSelectedCategoryId(nextCategory.id);
    setCategoryForm(createCategoryForm(nextCategory));
  }

  return (
    <article className="admin-card rounded-[36px] p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow text-[var(--ink-soft)]">Categories</p>
          <h2 className="display mt-4 text-3xl font-semibold">Category Management</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
            Control order, cover image, hero copy, and visibility for the categories shown in the storefront.
          </p>
        </div>
        <input
          name="categoryQuery"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="admin-input min-w-[240px] px-4 py-3"
          placeholder="Search category or slug"
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => {
              setMessage("");
              setError("");
              selectCategory(null);
            }}
            className="admin-button-secondary w-full px-5 py-4"
          >
            New category
          </button>

          {filteredCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => {
                setMessage("");
                setError("");
                selectCategory(category.id);
              }}
              className={`w-full rounded-[26px] border px-5 py-4 text-left transition ${
                selectedCategory?.id === category.id
                  ? "border-[var(--accent)] bg-[rgba(214,81,45,0.08)]"
                  : "border-[var(--line)] bg-white/70 hover:border-[var(--line-strong)]"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-lg font-semibold">{category.name}</p>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                  {category.visible ? "ON" : "OFF"}
                </span>
              </div>
              <p className="mt-2 text-sm text-[var(--ink-soft)]">{category.slug}</p>
              <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">{category.description}</p>
              <p className="mt-3 text-xs text-[var(--ink-soft)]">
                {category.productCount} products · order {category.displayOrder}
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
                  const nextCategory = selectedCategoryId
                    ? await updateCategory(selectedCategoryId, categoryForm)
                    : await createCategory(categoryForm);

                  const nextCategories = sortCategories(
                    selectedCategoryId
                      ? categories.map((category) =>
                          category.id === nextCategory.id ? nextCategory : category,
                        )
                      : [...categories, nextCategory],
                  );

                  setCategories(nextCategories);
                  setSelectedCategoryId(nextCategory.id);
                  setCategoryForm(createCategoryForm(nextCategory));
                  setMessage(selectedCategoryId ? "Category updated." : "Category created.");
                } catch (saveError) {
                  setError(getErrorMessage(saveError, "Failed to save the category."));
                }
              })();
            });
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow text-[var(--ink-soft)]">Category Editor</p>
              <h3 className="mt-2 text-xl font-semibold">{selectedCategoryId ? "Edit category" : "New category"}</h3>
            </div>
            <label className="flex items-center gap-2 text-sm text-[var(--ink-soft)]">
              <input
                type="checkbox"
                checked={categoryForm.visible}
                onChange={(event) =>
                  setCategoryForm((current) => ({ ...current, visible: event.target.checked }))
                }
              />
              Visible
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium">slug</span>
              <input name="categorySlug" value={categoryForm.slug} onChange={(event) => setCategoryForm((current) => ({ ...current, slug: event.target.value }))} className="admin-input px-4 py-3" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium">Name</span>
              <input name="categoryName" value={categoryForm.name} onChange={(event) => setCategoryForm((current) => ({ ...current, name: event.target.value }))} className="admin-input px-4 py-3" />
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-medium">Description</span>
            <textarea name="categoryDescription" rows={3} value={categoryForm.description} onChange={(event) => setCategoryForm((current) => ({ ...current, description: event.target.value }))} className="admin-input px-4 py-3" />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium">Accent color</span>
              <input name="categoryAccentColor" value={categoryForm.accentColor} onChange={(event) => setCategoryForm((current) => ({ ...current, accentColor: event.target.value }))} className="admin-input px-4 py-3" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium">Display order</span>
              <input name="categoryDisplayOrder" type="number" min={0} value={categoryForm.displayOrder} onChange={(event) => setCategoryForm((current) => ({ ...current, displayOrder: Number(event.target.value) }))} className="admin-input px-4 py-3" />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium">Cover image URL</span>
              <input name="categoryCoverImageUrl" value={categoryForm.coverImageUrl} onChange={(event) => setCategoryForm((current) => ({ ...current, coverImageUrl: event.target.value }))} className="admin-input px-4 py-3" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium">Cover image alt</span>
              <input name="categoryCoverImageAlt" value={categoryForm.coverImageAlt} onChange={(event) => setCategoryForm((current) => ({ ...current, coverImageAlt: event.target.value }))} className="admin-input px-4 py-3" />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium">Hero title</span>
              <input name="categoryHeroTitle" value={categoryForm.heroTitle} onChange={(event) => setCategoryForm((current) => ({ ...current, heroTitle: event.target.value }))} className="admin-input px-4 py-3" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium">Hero subtitle</span>
              <textarea name="categoryHeroSubtitle" rows={3} value={categoryForm.heroSubtitle} onChange={(event) => setCategoryForm((current) => ({ ...current, heroSubtitle: event.target.value }))} className="admin-input px-4 py-3" />
            </label>
          </div>

          <div className="relative min-h-[220px] overflow-hidden rounded-[24px] border border-[var(--line)]">
            <Image src={categoryForm.coverImageUrl} alt={categoryForm.coverImageAlt || categoryForm.name || "Category cover preview"} fill sizes="100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[rgba(11,14,22,0.72)] to-transparent" />
            <div className="relative flex h-full flex-col justify-end p-6 text-white">
              <p className="eyebrow text-white/70">{categoryForm.name || "Category"}</p>
              <h4 className="mt-3 text-2xl font-semibold">{categoryForm.heroTitle || categoryForm.description || "Category headline"}</h4>
              <p className="mt-3 max-w-xl text-sm leading-7 text-white/76">{categoryForm.heroSubtitle || "Add hero supporting copy here."}</p>
            </div>
          </div>

          {message ? <p className="text-sm text-[var(--teal)]">{message}</p> : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={isSaving} className="admin-button px-6 py-4 disabled:opacity-60">
              {isSaving ? "Saving..." : selectedCategoryId ? "Update category" : "Create category"}
            </button>
            {selectedCategoryId ? (
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  startDeleting(() => {
                    void (async () => {
                      try {
                        await deleteCategory(selectedCategoryId);
                        const nextCategories = categories.filter((category) => category.id !== selectedCategoryId);
                        setCategories(nextCategories);
                        setSelectedCategoryId(nextCategories[0]?.id ?? null);
                        setCategoryForm(nextCategories[0] ? createCategoryForm(nextCategories[0]) : createEmptyCategoryForm());
                        setMessage("Category deleted.");
                        setError("");
                      } catch (deleteError) {
                        setError(getErrorMessage(deleteError, "Failed to delete the category."));
                      }
                    })();
                  });
                }}
                className="admin-button-secondary px-6 py-4 disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Delete category"}
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </article>
  );
}
