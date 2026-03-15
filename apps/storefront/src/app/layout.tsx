import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";

import { SiteFooter } from "@/components/shell/site-footer";
import { SiteHeader } from "@/components/shell/site-header";
import { CartProvider } from "@/lib/cart-store";
import { getCategories } from "@/lib/server-api";

import "./globals.css";

const notoSans = Noto_Sans_KR({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Vibe Shop",
  description: "차분한 일상을 위한 리빙 셀렉션 스토어",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getCategories().catch(() => []);

  return (
    <html lang="ko">
      <body className={`${notoSans.variable} antialiased`}>
        <CartProvider>
          <div className="min-h-screen bg-[var(--surface)] text-[var(--ink)]">
            <SiteHeader categories={categories} />
            <main className="mx-auto flex w-full max-w-7xl flex-col px-5 pb-16 pt-6 sm:px-8">
              {children}
            </main>
            <SiteFooter />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
