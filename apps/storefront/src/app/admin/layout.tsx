import { Noto_Sans_KR } from "next/font/google";

import { AdminAuthProvider } from "@/lib/admin-auth-store";
import { getAdminSession } from "@/lib/admin-server-api";

import "./admin.css";

const notoSans = Noto_Sans_KR({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getAdminSession().catch(() => ({ authenticated: false, user: null }));

  return (
    <div className={`${notoSans.variable} min-h-screen bg-[var(--background)] text-[var(--ink)]`}>
      <AdminAuthProvider initialSession={session}>{children}</AdminAuthProvider>
    </div>
  );
}
