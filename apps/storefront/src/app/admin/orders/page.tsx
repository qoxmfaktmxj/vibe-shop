import { AdminOrderManager } from "@/components/admin-order-manager";
import { AdminShell } from "@/components/admin-shell";
import { requireAdminSession } from "@/lib/admin-require-session";
import { getAdminOrders } from "@/lib/admin-server-api";

export default async function AdminOrdersPage() {
  await requireAdminSession();
  const orders = await getAdminOrders();

  return (
    <AdminShell
      eyebrow="Orders"
      title="Order operations without extra payload."
      description="The order queue is isolated so state changes do not wait on unrelated admin datasets."
    >
      <AdminOrderManager initialOrders={orders} />
    </AdminShell>
  );
}
