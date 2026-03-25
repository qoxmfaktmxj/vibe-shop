import { AdminOrderManager } from "@/components/admin-order-manager";
import { AdminShell } from "@/components/admin-shell";
import { requireAdminSession } from "@/lib/admin-require-session";
import { getAdminOrders } from "@/lib/admin-server-api";

export default async function AdminOrdersPage() {
  await requireAdminSession();
  const orders = await getAdminOrders();

  return (
    <AdminShell
      eyebrow="주문"
      title="운영 처리가 필요한 주문 작업 공간"
      description="주문 상태 변경과 확인 흐름을 분리해 다른 운영 화면에 영향을 주지 않고 빠르게 처리합니다."
    >
      <AdminOrderManager initialOrders={orders} />
    </AdminShell>
  );
}
