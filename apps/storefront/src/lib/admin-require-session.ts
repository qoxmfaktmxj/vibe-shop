import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/admin-server-api";

export async function requireAdminSession() {
  const session = await getAdminSession().catch(() => ({ authenticated: false, user: null }));

  if (!session.authenticated || !session.user) {
    redirect("/admin/login");
  }

  return session;
}
