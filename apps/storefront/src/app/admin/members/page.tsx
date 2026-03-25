import { AdminMemberManager } from "@/components/admin-member-manager";
import { AdminShell } from "@/components/admin-shell";
import { requireAdminSession } from "@/lib/admin-require-session";
import { getAdminMembers } from "@/lib/admin-server-api";

export default async function AdminMembersPage() {
  await requireAdminSession();
  const members = await getAdminMembers();

  return (
    <AdminShell
      eyebrow="회원"
      title="회원 상태와 운영 메모를 확인하는 전용 공간"
      description="회원 상태 변경을 별도 화면에서 처리해 대시보드와 다른 운영 화면을 가볍게 유지합니다."
    >
      <AdminMemberManager initialMembers={members} />
    </AdminShell>
  );
}
