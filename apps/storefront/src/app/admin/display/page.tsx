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
      title="메인 전시 관리"
      description="메인 배너, 히어로 카피, 섹션 구성을 storefront 관점에서 바로 조정하는 화면입니다."
    >
      <div className="grid gap-6">
        <AdminHeroEditor initialDisplay={display} />
        <AdminDisplayManager initialDisplay={display} />
      </div>
    </AdminShell>
  );
}
