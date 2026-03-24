import { AdminShell } from "@/components/admin-shell";
import { AdminStatisticsPanel } from "@/components/admin-statistics-panel";
import { requireAdminSession } from "@/lib/admin-require-session";
import { getAdminStatistics } from "@/lib/admin-server-api";

export default async function AdminAnalyticsPage() {
  await requireAdminSession();
  const statistics = await getAdminStatistics();

  return (
    <AdminShell
      eyebrow="Analytics"
      title="Reporting without the rest of the console."
      description="Analytics is now its own route so reporting queries do not block the main dashboard render path."
    >
      <AdminStatisticsPanel statistics={statistics} />
    </AdminShell>
  );
}
