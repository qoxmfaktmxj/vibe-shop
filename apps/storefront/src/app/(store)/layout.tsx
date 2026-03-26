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

  return (
    <AuthProvider initialSession={authSession}>
      <CartProvider>
        <div className="min-h-screen bg-[var(--background)] text-[var(--ink)]">
          <SiteHeader categories={categories} />
          <main className="page-container flex w-full flex-col pb-24 pt-6 sm:pb-24 sm:pt-8 lg:pb-28">
            {children}
          </main>
          <SiteFooter />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}
