import { AdminMemberManager } from "@/components/admin-member-manager";
import { AdminShell } from "@/components/admin-shell";
import { requireAdminSession } from "@/lib/admin-require-session";
import { getAdminManagedAccounts, getAdminMembers } from "@/lib/admin-server-api";

export default async function AdminMembersPage() {
  const session = await requireAdminSession();
  const members = await getAdminMembers();
  const managedAccounts =
    session.user?.role === "OWNER"
      ? await getAdminManagedAccounts().catch(() => [])
      : [];

  return (
    <AdminShell
      eyebrow="회원"
      title="회원 운영"
      description="회원 상태, 관리자 계정, 로그인 이력과 구매 규모를 함께 확인하는 운영 화면입니다."
    >
      <AdminMemberManager
        initialMembers={members}
        initialManagedAccounts={managedAccounts}
        currentAdminRole={session.user?.role ?? "ADMIN"}
      />
    </AdminShell>
  );
}
