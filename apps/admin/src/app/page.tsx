import { redirect } from "next/navigation";

import { AdminWorkspace } from "@/components/admin-workspace";
import { getAdminDashboard, getAdminOrders, getAdminProducts, getAdminSession } from "@/lib/server-api";

export default async function AdminPage() {
  const session = await getAdminSession().catch(() => ({ authenticated: false, user: null }));

  if (!session.authenticated || !session.user) {
    redirect("/login");
  }

  const [dashboard, products, orders] = await Promise.all([
    getAdminDashboard(),
    getAdminProducts(),
    getAdminOrders(),
  ]);

  return (
    <AdminWorkspace
      initialDashboard={dashboard}
      initialProducts={products}
      initialOrders={orders}
    />
  );
}
