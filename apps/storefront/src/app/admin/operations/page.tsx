import { AdminOperationsPanel } from "@/components/admin-operations-panel";
import { AdminShell } from "@/components/admin-shell";
import { requireAdminSession } from "@/lib/admin-require-session";
import { getAdminOperations } from "@/lib/admin-server-api";

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
