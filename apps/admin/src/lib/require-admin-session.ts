import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/server-api";

export async function requireAdminSession() {
  const session = await getAdminSession().catch(() => ({ authenticated: false, user: null }));

  if (!session.authenticated || !session.user) {
    redirect("/login");
  }

  return session;
}
