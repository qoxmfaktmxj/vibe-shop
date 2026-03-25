import { AdminReviewManager } from "@/components/admin-review-manager";
import { AdminShell } from "@/components/admin-shell";
import { requireAdminSession } from "@/lib/admin-require-session";
import { getAdminReviews } from "@/lib/admin-server-api";

export default async function AdminReviewsPage() {
  await requireAdminSession();
  const reviews = await getAdminReviews();

  return (
    <AdminShell
      eyebrow="리뷰"
      title="리뷰 검토와 노출 상태를 관리하는 전용 공간"
      description="카탈로그와 주문 데이터에서 분리해 리뷰 운영만 빠르게 확인하고 처리할 수 있습니다."
    >
      <AdminReviewManager reviews={reviews} />
    </AdminShell>
  );
}
