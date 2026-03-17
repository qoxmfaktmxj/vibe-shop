"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";

import { createCategory, deleteCategory, updateCategory } from "@/lib/client-api";
import type { AdminCategory, AdminCategoryPayload } from "@/lib/contracts";

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

export function AdminCategoryManager({
  initialCategories,
}: {
  initialCategories: AdminCategory[];
}) {
  const [categories, setCategories] = useState(sortCategories(initialCategories));
  const [query, setQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    initialCategories[0]?.id ?? null,
  );
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
          <h2 className="display mt-4 text-3xl font-semibold">카테고리 관리</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
            사용자 화면에 노출되는 카테고리 순서, 커버 이미지, 히어로 카피를 직접 관리합니다.
          </p>
        </div>
        <input
          name="categoryQuery"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="admin-input min-w-[240px] px-4 py-3"
          placeholder="카테고리명, slug 검색"
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
            새 카테고리
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
                상품 {category.productCount}개 · 순서 {category.displayOrder}
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
                  setMessage(selectedCategoryId ? "카테고리를 수정했습니다." : "카테고리를 생성했습니다.");
                } catch (saveError) {
                  setError(getErrorMessage(saveError, "카테고리 저장 중 문제가 발생했습니다."));
                }
              })();
            });
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow text-[var(--ink-soft)]">Category Editor</p>
              <h3 className="mt-2 text-xl font-semibold">
                {selectedCategoryId ? "카테고리 수정" : "새 카테고리"}
              </h3>
            </div>
            <label className="flex items-center gap-2 text-sm text-[var(--ink-soft)]">
              <input
                type="checkbox"
                checked={categoryForm.visible}
                onChange={(event) =>
                  setCategoryForm((current) => ({ ...current, visible: event.target.checked }))
                }
              />
              노출
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium">slug</span>
              <input
                name="categorySlug"
                value={categoryForm.slug}
                onChange={(event) =>
                  setCategoryForm((current) => ({ ...current, slug: event.target.value }))
                }
                className="admin-input px-4 py-3"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium">카테고리명</span>
              <input
                name="categoryName"
                value={categoryForm.name}
                onChange={(event) =>
                  setCategoryForm((current) => ({ ...current, name: event.target.value }))
                }
                className="admin-input px-4 py-3"
              />
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-medium">설명</span>
            <textarea
              name="categoryDescription"
              rows={3}
              value={categoryForm.description}
              onChange={(event) =>
                setCategoryForm((current) => ({ ...current, description: event.target.value }))
              }
              className="admin-input px-4 py-3"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium">강조 색상</span>
              <input
                name="categoryAccentColor"
                value={categoryForm.accentColor}
                onChange={(event) =>
                  setCategoryForm((current) => ({ ...current, accentColor: event.target.value }))
                }
                className="admin-input px-4 py-3"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium">정렬 순서</span>
              <input
                name="categoryDisplayOrder"
                type="number"
                min={0}
                value={categoryForm.displayOrder}
                onChange={(event) =>
                  setCategoryForm((current) => ({
                    ...current,
                    displayOrder: Number(event.target.value),
                  }))
                }
                className="admin-input px-4 py-3"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium">커버 이미지 경로</span>
              <input
                name="categoryCoverImageUrl"
                value={categoryForm.coverImageUrl}
                onChange={(event) =>
                  setCategoryForm((current) => ({ ...current, coverImageUrl: event.target.value }))
                }
                className="admin-input px-4 py-3"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium">커버 이미지 ALT</span>
              <input
                name="categoryCoverImageAlt"
                value={categoryForm.coverImageAlt}
                onChange={(event) =>
                  setCategoryForm((current) => ({ ...current, coverImageAlt: event.target.value }))
                }
                className="admin-input px-4 py-3"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium">히어로 제목</span>
              <input
                name="categoryHeroTitle"
                value={categoryForm.heroTitle}
                onChange={(event) =>
                  setCategoryForm((current) => ({ ...current, heroTitle: event.target.value }))
                }
                className="admin-input px-4 py-3"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium">히어로 설명</span>
              <textarea
                name="categoryHeroSubtitle"
                rows={3}
                value={categoryForm.heroSubtitle}
                onChange={(event) =>
                  setCategoryForm((current) => ({ ...current, heroSubtitle: event.target.value }))
                }
                className="admin-input px-4 py-3"
              />
            </label>
          </div>

          <div className="relative min-h-[220px] overflow-hidden rounded-[24px] border border-[var(--line)]">
            <Image
              src={categoryForm.coverImageUrl}
              alt={categoryForm.coverImageAlt || categoryForm.name || "Category cover preview"}
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[rgba(11,14,22,0.72)] to-transparent" />
            <div className="relative flex h-full flex-col justify-end p-6 text-white">
              <p className="eyebrow text-white/70">{categoryForm.name || "Category"}</p>
              <h4 className="mt-3 text-2xl font-semibold">
                {categoryForm.heroTitle || categoryForm.description || "카테고리 제목"}
              </h4>
              <p className="mt-3 max-w-xl text-sm leading-7 text-white/76">
                {categoryForm.heroSubtitle || "카테고리 소개 문구를 입력해 주세요."}
              </p>
            </div>
          </div>

          {message ? <p className="text-sm text-[var(--teal)]">{message}</p> : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={isSaving} className="admin-button px-6 py-4 disabled:opacity-60">
              {isSaving ? "저장 중입니다." : selectedCategoryId ? "카테고리 수정" : "카테고리 생성"}
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
                        setCategoryForm(
                          nextCategories[0] ? createCategoryForm(nextCategories[0]) : createEmptyCategoryForm(),
                        );
                        setMessage("카테고리를 삭제했습니다.");
                        setError("");
                      } catch (deleteError) {
                        setError(getErrorMessage(deleteError, "카테고리 삭제 중 문제가 발생했습니다."));
                      }
                    })();
                  });
                }}
                className="admin-button-secondary px-6 py-4 disabled:opacity-60"
              >
                {isDeleting ? "삭제 중입니다." : "카테고리 삭제"}
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </article>
  );
}
