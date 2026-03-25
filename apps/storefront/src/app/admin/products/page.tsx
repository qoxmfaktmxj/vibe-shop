import { AdminCategoryManager } from "@/components/admin-category-manager";
import { AdminProductManager } from "@/components/admin-product-manager";
import { AdminShell } from "@/components/admin-shell";
import { requireAdminSession } from "@/lib/admin-require-session";
import { getAdminCategories, getAdminProducts } from "@/lib/admin-server-api";

export default async function AdminProductsPage() {
  await requireAdminSession();
  const [products, categories] = await Promise.all([getAdminProducts(), getAdminCategories()]);

  return (
    <AdminShell
      eyebrow="상품"
      title="상품과 카테고리를 함께 관리하는 카탈로그 작업 공간"
      description="전시와 통계 데이터와 분리해 상품 편집과 분류 체계 관리에 집중할 수 있도록 구성했습니다."
    >
      <div className="grid gap-6">
        <AdminProductManager initialProducts={products} />
        <AdminCategoryManager initialCategories={categories} />
      </div>
    </AdminShell>
  );
}
