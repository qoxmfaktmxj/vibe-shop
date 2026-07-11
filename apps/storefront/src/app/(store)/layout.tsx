import { SiteFooter } from "@/components/shell/site-footer";
import { SiteHeader } from "@/components/shell/site-header";
import { AuthProvider } from "@/lib/auth-store";
import { CartProvider } from "@/lib/cart-store";
import { getAuthSession, getCategories } from "@/lib/server-api";

export default async function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [categories, authSession] = await Promise.all([
    getCategories().catch(() => []),
    getAuthSession().catch(() => ({ authenticated: false, user: null })),
  ]);
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  return (
    <AuthProvider initialSession={authSession}>
      <CartProvider>
        <div className="min-h-screen bg-[var(--background)] text-[var(--ink)]">
          <a
            href="#main-content"
            className="sr-only fixed left-4 top-4 z-[100] rounded-lg bg-[var(--ink)] px-4 py-3 text-white focus:not-sr-only"
          >
            본문으로 건너뛰기
          </a>
          {isDemoMode ? (
            <div role="note" className="bg-[var(--ink)] px-4 py-3 text-center text-sm font-semibold text-[var(--background)]">
              DEMO STORE · 실제 주문과 결제가 발생하지 않습니다. 실제 개인정보를 입력하지 마세요.
            </div>
          ) : null}
          <SiteHeader categories={categories} />
          <main id="main-content" tabIndex={-1} className="page-container flex w-full flex-col pb-24 pt-6 sm:pb-24 sm:pt-8 lg:pb-28">
            {children}
          </main>
          <SiteFooter />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}
