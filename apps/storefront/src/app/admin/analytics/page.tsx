import { AdminShell } from "@/components/admin-shell";
import { AdminStatisticsPanel } from "@/components/admin-statistics-panel";
import { requireAdminSession } from "@/lib/admin-require-session";
import { getAdminStatistics } from "@/lib/admin-server-api";

export default async function AdminAnalyticsPage() {
  await requireAdminSession();
  const statistics = await getAdminStatistics();

  return (
    <AdminShell
      eyebrow="통계"
      title="운영 통계"
      description="주문, 회원, 카테고리별 추이를 메인 대시보드와 분리해서 보는 분석 화면입니다."
    >
      <AdminStatisticsPanel statistics={statistics} />
    </AdminShell>
  );
}
