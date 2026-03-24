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
      eyebrow="Products"
      title="Catalog editing by route."
      description="Product editing and taxonomy management are grouped together without forcing display or reporting data to load."
    >
      <div className="grid gap-6">
        <AdminProductManager initialProducts={products} />
        <AdminCategoryManager initialCategories={categories} />
      </div>
    </AdminShell>
  );
}
