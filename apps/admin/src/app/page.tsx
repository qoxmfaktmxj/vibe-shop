import { redirect } from "next/navigation";

import { AdminWorkspace } from "@/components/admin-workspace";
import {
  getAdminCategories,
  getAdminDashboard,
  getAdminDisplay,
  getAdminMembers,
  getAdminOrders,
  getAdminProducts,
  getAdminReviews,
  getAdminSession,
  getAdminStatistics,
} from "@/lib/server-api";

export default async function AdminPage() {
  const session = await getAdminSession().catch(() => ({ authenticated: false, user: null }));

  if (!session.authenticated || !session.user) {
    redirect("/login");
  }

  const [dashboard, display, products, orders, categories, members, statistics, reviews] = await Promise.all([
    getAdminDashboard(),
    getAdminDisplay(),
    getAdminProducts(),
    getAdminOrders(),
    getAdminCategories(),
    getAdminMembers(),
    getAdminStatistics(),
    getAdminReviews(),
  ]);

  return (
    <AdminWorkspace
      initialDashboard={dashboard}
      initialDisplay={display}
      initialProducts={products}
      initialOrders={orders}
      initialCategories={categories}
      initialMembers={members}
      initialStatistics={statistics}
      initialReviews={reviews}
    />
  );
}
