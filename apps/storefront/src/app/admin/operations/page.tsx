import { AdminOperationsPanel } from "@/components/admin-operations-panel";
import { AdminShell } from "@/components/admin-shell";
import { requireAdminSession } from "@/lib/admin-require-session";
import { getAdminOperations } from "@/lib/admin-server-api";

export default async function AdminOperationsPage() {
  await requireAdminSession();
  const operations = await getAdminOperations();

  return (
    <AdminShell
      eyebrow="운영"
      title="주의가 필요한 운영 이슈를 모아 보는 감시 화면"
      description="재고 부족, 위험 주문, 리뷰 감시 목록을 한 화면에서 모니터링할 수 있습니다."
    >
      <AdminOperationsPanel initialOperations={operations} />
    </AdminShell>
  );
}
