import { redirect } from "next/navigation";

import { LoginForm } from "@/components/login-form";
import { getAdminSession } from "@/lib/server-api";

export default async function LoginPage() {
  const session = await getAdminSession().catch(() => ({ authenticated: false, user: null }));

  if (session.authenticated) {
    redirect("/");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1200px] items-center px-6 py-12 sm:px-8 lg:px-10">
      <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="admin-dark rounded-[40px] p-8 sm:p-10 lg:p-12">
          <p className="eyebrow text-[rgba(237,244,239,0.66)]">Operations Panel</p>
          <h1 className="display mt-5 text-5xl font-semibold leading-[0.92] sm:text-6xl">
            Keep store operations in a dedicated control plane.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-[rgba(237,244,239,0.72)]">
            Manage merchandising, order state, and storefront messaging without forcing every
            operations surface through a single route.
          </p>
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            <article className="rounded-[28px] border border-white/10 bg-white/6 p-5">
              <p className="eyebrow text-[rgba(237,244,239,0.58)]">Products</p>
              <p className="mt-3 text-sm leading-7 text-[rgba(237,244,239,0.78)]">
                Update stock, popularity, badges, and featured placement in a dedicated product workspace.
              </p>
            </article>
            <article className="rounded-[28px] border border-white/10 bg-white/6 p-5">
              <p className="eyebrow text-[rgba(237,244,239,0.58)]">Orders</p>
              <p className="mt-3 text-sm leading-7 text-[rgba(237,244,239,0.78)]">
                Move order state transitions and queue review off the root dashboard path.
              </p>
            </article>
            <article className="rounded-[28px] border border-white/10 bg-white/6 p-5">
              <p className="eyebrow text-[rgba(237,244,239,0.58)]">Display</p>
              <p className="mt-3 text-sm leading-7 text-[rgba(237,244,239,0.78)]">
                Edit homepage hero copy and merchandising sections without touching catalog or reviews.
              </p>
            </article>
          </div>
        </section>

        <section className="admin-card rounded-[40px] p-8 sm:p-10 lg:p-12">
          <p className="eyebrow text-[var(--ink-soft)]">Admin Login</p>
          <h2 className="display mt-5 text-4xl font-semibold leading-[0.94]">
            Sign in to the operations console
          </h2>
          <p className="mt-5 text-base leading-8 text-[var(--ink-soft)]">
            Use an account with `OWNER` or `MANAGER` access.
          </p>
          <div className="mt-8">
            <LoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}
