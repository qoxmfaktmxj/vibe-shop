import { AdminOperationsPanel } from "@/components/admin-operations-panel";
import { AdminShell } from "@/components/admin-shell";
import { requireAdminSession } from "@/lib/require-admin-session";
import { getAdminOperations } from "@/lib/server-api";

export default async function AdminOperationsPage() {
  await requireAdminSession();
  const operations = await getAdminOperations();

  return (
    <AdminShell
      eyebrow="Operations"
      title="Operational watchlists by route."
      description="Low-stock queues, suspicious orders, and review watchlists now load in isolation."
    >
      <AdminOperationsPanel initialOperations={operations} />
    </AdminShell>
  );
}
