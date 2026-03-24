import { AdminDisplayManager } from "@/components/admin-display-manager";
import { AdminHeroEditor } from "@/components/admin-hero-editor";
import { AdminShell } from "@/components/admin-shell";
import { requireAdminSession } from "@/lib/require-admin-session";
import { getAdminDisplay } from "@/lib/server-api";

export default async function AdminDisplayPage() {
  await requireAdminSession();
  const display = await getAdminDisplay();

  return (
    <AdminShell
      eyebrow="Display"
      title="Merchandising and hero control."
      description="Display editing now loads only the datasets needed for storefront merchandising changes."
    >
      <div className="grid gap-6">
        <AdminHeroEditor initialDisplay={display} />
        <AdminDisplayManager initialDisplay={display} />
      </div>
    </AdminShell>
  );
}
