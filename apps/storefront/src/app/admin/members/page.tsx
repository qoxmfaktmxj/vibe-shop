import { AdminMemberManager } from "@/components/admin-member-manager";
import { AdminShell } from "@/components/admin-shell";
import { requireAdminSession } from "@/lib/admin-require-session";
import { getAdminMembers } from "@/lib/admin-server-api";

export default async function AdminMembersPage() {
  await requireAdminSession();
  const members = await getAdminMembers();

  return (
    <AdminShell
      eyebrow="Members"
      title="Member moderation in a focused workspace."
      description="Member status changes now load independently and keep the dashboard route lightweight."
    >
      <AdminMemberManager initialMembers={members} />
    </AdminShell>
  );
}
