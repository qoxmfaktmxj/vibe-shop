import type { Metadata } from "next";
import { Noto_Sans_KR, Space_Grotesk } from "next/font/google";

import { AdminAuthProvider } from "@/lib/auth-store";
import { getAdminSession } from "@/lib/server-api";

import "./globals.css";

const space = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const notoSans = Noto_Sans_KR({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "MARU Admin",
  description: "MARU 운영용 관리자 앱",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getAdminSession().catch(() => ({ authenticated: false, user: null }));

  return (
    <html lang="ko">
      <body className={`${space.variable} ${notoSans.variable} antialiased`}>
        <AdminAuthProvider initialSession={session}>
          <div className="min-h-screen bg-[var(--background)] text-[var(--ink)]">{children}</div>
        </AdminAuthProvider>
      </body>
    </html>
  );
}
