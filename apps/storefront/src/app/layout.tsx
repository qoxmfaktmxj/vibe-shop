import type { Metadata } from "next";
import { Manrope, Noto_Sans_KR } from "next/font/google";

import { SiteFooter } from "@/components/shell/site-footer";
import { SiteHeader } from "@/components/shell/site-header";
import { AuthProvider } from "@/lib/auth-store";
import { CartProvider } from "@/lib/cart-store";
import { getAuthSession, getCategories } from "@/lib/server-api";

import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const notoSans = Noto_Sans_KR({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Vibe Shop",
  description: "리빙, 키친, 웰니스 셀렉션을 담은 감도 높은 라이프스타일 쇼핑몰.",
  icons: {
    icon: "/vibe-shop-favicon.svg",
    shortcut: "/vibe-shop-favicon.svg",
    apple: "/vibe-shop-favicon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [categories, authSession] = await Promise.all([
    getCategories().catch(() => []),
    getAuthSession().catch(() => ({ authenticated: false, user: null })),
  ]);

  return (
    <html lang="ko">
      <body className={`${manrope.variable} ${notoSans.variable} antialiased`}>
        <AuthProvider initialSession={authSession}>
          <CartProvider>
            <div className="min-h-screen bg-[var(--surface)] text-[var(--ink)]">
              <SiteHeader categories={categories} />
              <main className="mx-auto flex w-full max-w-[1280px] flex-col px-5 pb-24 pt-8 sm:px-8 lg:px-10">
                {children}
              </main>
              <SiteFooter />
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
