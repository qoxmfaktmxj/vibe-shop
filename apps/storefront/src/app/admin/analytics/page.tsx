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
      title="운영 콘솔과 분리된 보고용 통계 화면"
      description="통계 조회를 별도 경로에서 처리해 메인 대시보드와 다른 작업 화면의 응답성을 유지합니다."
    >
      <AdminStatisticsPanel statistics={statistics} />
    </AdminShell>
  );
}
