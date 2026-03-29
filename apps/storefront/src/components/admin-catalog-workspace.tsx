"use client";

import { useState } from "react";

import { AdminCategoryManager } from "@/components/admin-category-manager";
import { AdminProductManager } from "@/components/admin-product-manager";
import type { AdminCategory, AdminProduct } from "@/lib/admin-contracts";

type CatalogTab = "products" | "categories";

const tabs: Array<{
  id: CatalogTab;
  label: string;
  description: string;
}> = [
  {
    id: "products",
    label: "상품",
    description: "신규 상품 등록과 기존 상품 편집을 집중해서 처리합니다.",
  },
  {
    id: "categories",
    label: "카테고리",
    description: "카테고리 순서, 히어로 문구, 노출 상태를 따로 관리합니다.",
  },
];

export function AdminCatalogWorkspace({
  initialProducts,
  categories,
}: {
  initialProducts: AdminProduct[];
  categories: AdminCategory[];
}) {
  const [activeTab, setActiveTab] = useState<CatalogTab>("products");
  const activeTabMeta = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  return (
    <div className="grid gap-5">
      <section className="admin-card rounded-[32px] p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow text-[var(--ink-soft)]">카탈로그 구분</p>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--ink)]">
              작업 대상을 먼저 선택하세요
            </h2>
            <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
              {activeTabMeta.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const active = tab.id === activeTab;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? "border-[var(--accent)] bg-[rgba(214,81,45,0.1)] text-[var(--ink)]"
                      : "border-[var(--line)] bg-white/72 text-[var(--ink-soft)] hover:border-[var(--line-strong)] hover:text-[var(--ink)]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {activeTab === "products" ? (
        <AdminProductManager initialProducts={initialProducts} categories={categories} />
      ) : (
        <AdminCategoryManager initialCategories={categories} />
      )}
    </div>
  );
}
