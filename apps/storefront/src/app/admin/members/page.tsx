import { AdminMemberManager } from "@/components/admin-member-manager";
import { AdminShell } from "@/components/admin-shell";
import { requireAdminSession } from "@/lib/admin-require-session";
import { getAdminManagedAccounts, getAdminMembers } from "@/lib/admin-server-api";

export default async function AdminMembersPage() {
  const session = await requireAdminSession();
  const members = await getAdminMembers();
  const managedAccounts =
    session.user?.role === "OWNER" ? await getAdminManagedAccounts().catch(() => []) : [];

  return (
    <AdminShell
      eyebrow="회원"
      title="회원 상태와 운영 메모를 확인하는 전용 공간"
      description="회원 상태 변경을 별도 화면에서 처리해 대시보드와 다른 운영 화면을 가볍게 유지합니다."
    >
      <AdminMemberManager
        initialMembers={members}
        initialManagedAccounts={managedAccounts}
        currentAdminRole={session.user?.role ?? "ADMIN"}
      />
    </AdminShell>
  );
}
