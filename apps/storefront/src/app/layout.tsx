import type { Metadata } from "next";
import { Geist_Mono, Noto_Sans_KR } from "next/font/google";

import { SiteFooter } from "@/components/shell/site-footer";
import { SiteHeader } from "@/components/shell/site-header";
import { AuthProvider } from "@/lib/auth-store";
import { CartProvider } from "@/lib/cart-store";
import { getAuthSession, getCategories } from "@/lib/server-api";

import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["200", "400", "500", "700"],
});

const notoSans = Noto_Sans_KR({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Vibe Shop",
  description: "Search-first commerce storefront for discovery, checkout, and account journeys.",
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
      <body className={`${geistMono.variable} ${notoSans.variable} antialiased`}>
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
