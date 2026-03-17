import { redirect } from "next/navigation";

import { AdminWorkspace } from "@/components/admin-workspace";
import {
  getAdminCategories,
  getAdminDashboard,
  getAdminDisplay,
  getAdminOrders,
  getAdminProducts,
  getAdminSession,
} from "@/lib/server-api";

export default async function AdminPage() {
  const session = await getAdminSession().catch(() => ({ authenticated: false, user: null }));

  if (!session.authenticated || !session.user) {
    redirect("/login");
  }

  const [dashboard, display, products, orders, categories] = await Promise.all([
    getAdminDashboard(),
    getAdminDisplay(),
    getAdminProducts(),
    getAdminOrders(),
    getAdminCategories(),
  ]);

  return (
    <AdminWorkspace
      initialDashboard={dashboard}
      initialDisplay={display}
      initialProducts={products}
      initialOrders={orders}
      initialCategories={categories}
    />
  );
}
