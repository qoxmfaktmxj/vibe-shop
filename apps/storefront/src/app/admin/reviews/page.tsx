import { AdminReviewManager } from "@/components/admin-review-manager";
import { AdminShell } from "@/components/admin-shell";
import { requireAdminSession } from "@/lib/admin-require-session";
import { getAdminReviews } from "@/lib/admin-server-api";

export default async function AdminReviewsPage() {
  await requireAdminSession();
  const reviews = await getAdminReviews();

  return (
    <AdminShell
      eyebrow="Reviews"
      title="Review moderation as a dedicated route."
      description="Review status changes no longer wait on catalog, order, or analytics requests."
    >
      <AdminReviewManager reviews={reviews} />
    </AdminShell>
  );
}
