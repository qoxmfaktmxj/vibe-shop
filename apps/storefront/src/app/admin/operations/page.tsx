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
      title="운영 모니터링"
      description="저재고, 이상 주문, 저평점 리뷰처럼 우선 확인이 필요한 항목만 따로 모아 보는 화면입니다."
    >
      <AdminOperationsPanel initialOperations={operations} />
    </AdminShell>
  );
}
