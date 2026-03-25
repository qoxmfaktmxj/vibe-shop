import { AdminDisplayManager } from "@/components/admin-display-manager";
import { AdminHeroEditor } from "@/components/admin-hero-editor";
import { AdminShell } from "@/components/admin-shell";
import { requireAdminSession } from "@/lib/admin-require-session";
import { getAdminDisplay } from "@/lib/admin-server-api";

export default async function AdminDisplayPage() {
  await requireAdminSession();
  const display = await getAdminDisplay();

  return (
    <AdminShell
      eyebrow="전시"
      title="메인 배너와 전시 구성을 관리하는 작업 공간"
      description="스토어프론트 전시에 필요한 데이터만 불러와 히어로와 배너 구성을 빠르게 조정할 수 있습니다."
    >
      <div className="grid gap-6">
        <AdminHeroEditor initialDisplay={display} />
        <AdminDisplayManager initialDisplay={display} />
      </div>
    </AdminShell>
  );
}
