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
      title="주문 상태 업데이트"
      description="결제와 배송 단계가 있는 주문만 빠르게 확인하고 상태를 변경하는 작업 화면입니다."
    >
      <AdminOrderManager initialOrders={orders} />
    </AdminShell>
  );
}
