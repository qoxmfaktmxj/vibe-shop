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
      title="리뷰 운영"
      description="공개 상태, 품질 이슈, 상품별 반응을 확인하고 필요한 리뷰만 빠르게 조정합니다."
    >
      <AdminReviewManager reviews={reviews} />
    </AdminShell>
  );
}
