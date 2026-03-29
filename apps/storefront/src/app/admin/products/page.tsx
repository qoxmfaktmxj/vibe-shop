import { AdminCatalogWorkspace } from "@/components/admin-catalog-workspace";
import { AdminShell } from "@/components/admin-shell";
import { requireAdminSession } from "@/lib/admin-require-session";
import { getAdminCategories, getAdminProducts } from "@/lib/admin-server-api";

export default async function AdminProductsPage() {
  await requireAdminSession();
  const [products, categories] = await Promise.all([
    getAdminProducts(),
    getAdminCategories(),
  ]);

  return (
    <AdminShell
      eyebrow="상품"
      title="상품 카탈로그"
      description="상품 등록과 편집을 먼저 처리하고, 카테고리 관리는 별도 탭으로 분리한 작업 화면입니다."
    >
      <AdminCatalogWorkspace initialProducts={products} categories={categories} />
    </AdminShell>
  );
}
