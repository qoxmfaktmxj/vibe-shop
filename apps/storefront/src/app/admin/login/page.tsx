import { redirect } from "next/navigation";

import { AdminBootstrapSignupForm } from "@/components/admin-bootstrap-signup-form";
import { LoginForm } from "@/components/admin-login-form";
import {
  getAdminBootstrapStatus,
  getAdminSession,
} from "@/lib/admin-server-api";

const pageTitle = "\uAD00\uB9AC\uC790 \uD398\uC774\uC9C0";
const pageDescription =
  "\uC804\uC2DC, \uC0C1\uD488, \uC8FC\uBB38, \uD68C\uC6D0, \uB9AC\uBDF0\uB97C \uAD00\uB9AC\uC790 \uD398\uC774\uC9C0\uC5D0\uC11C \uC6B4\uC601\uD569\uB2C8\uB2E4.";
const loginTitle = "\uAD00\uB9AC\uC790 \uB85C\uADF8\uC778";
const loginDescription =
  "\uAD00\uB9AC\uC790 \uAD8C\uD55C \uACC4\uC815\uC73C\uB85C \uC811\uADFC\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.";
const bootstrapTitle =
  "\uCD08\uAE30 \uAD00\uB9AC\uC790 \uD68C\uC6D0\uAC00\uC785";
const bootstrapEnabledDescription =
  "\uC544\uC9C1 \uAD00\uB9AC\uC790 \uACC4\uC815\uC774 \uC5C6\uB2E4\uBA74 \uC5EC\uAE30\uC5D0\uC11C \uCCAB \uAD00\uB9AC\uC790 \uACC4\uC815\uC744 \uC0DD\uC131\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.";
const bootstrapDisabledDescription =
  "\uCD08\uAE30 \uAD00\uB9AC\uC790 \uACC4\uC815\uC740 \uC774\uBBF8 \uC0DD\uC131\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uCD94\uAC00 \uAD00\uB9AC\uC790 \uACC4\uC815\uC740 \uB85C\uADF8\uC778 \uD6C4 \uD68C\uC6D0 \uAD00\uB9AC\uC5D0\uC11C \uC0DD\uC131\uD574 \uC8FC\uC138\uC694.";

const panels = [
  {
    title: "\uC0C1\uD488",
    description:
      "\uC7AC\uACE0, \uC778\uAE30 \uC810\uC218, \uBA54\uC778 \uB178\uCD9C \uC0C1\uD0DC\uB97C \uC0C1\uD488 \uC791\uC5C5 \uACF5\uAC04\uC5D0\uC11C \uBC14\uB85C \uC870\uC815\uD569\uB2C8\uB2E4.",
  },
  {
    title: "\uC8FC\uBB38",
    description:
      "\uC8FC\uBB38 \uC0C1\uD0DC \uBCC0\uACBD\uACFC \uD655\uC778\uC5D0 \uD544\uC694\uD55C \uD750\uB984\uC744 \uBD84\uB9AC\uB41C \uD654\uBA74\uC5D0\uC11C \uBE60\uB974\uAC8C \uCC98\uB9AC\uD569\uB2C8\uB2E4.",
  },
  {
    title: "\uC804\uC2DC",
    description:
      "\uBA54\uC778 \uCE74\uD53C\uC640 \uBC30\uB108, \uCE74\uD14C\uACE0\uB9AC \uBA54\uC2DC\uC9C0\uB97C \uBCC4\uB3C4 \uD654\uBA74\uC5D0\uC11C \uAD00\uB9AC\uD569\uB2C8\uB2E4.",
  },
];

export default async function LoginPage() {
  const session = await getAdminSession().catch(() => ({
    authenticated: false,
    user: null,
  }));
  const bootstrap = await getAdminBootstrapStatus().catch(() => ({
    signupEnabled: false,
  }));

  if (session.authenticated) {
    redirect("/admin");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1200px] items-center px-6 py-12 sm:px-8 lg:px-10">
      <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="admin-dark rounded-[40px] p-8 sm:p-10 lg:p-12">
          <p className="eyebrow text-[rgba(237,244,239,0.66)]">
            Operations Panel
          </p>
          <h1 className="display mt-5 text-5xl font-semibold leading-[0.92] sm:text-6xl">
            {pageTitle}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-[rgba(237,244,239,0.72)]">
            {pageDescription}
          </p>
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {panels.map((panel) => (
              <article
                key={panel.title}
                className="rounded-[28px] border border-white/10 bg-white/6 p-5"
              >
                <p className="eyebrow text-[rgba(237,244,239,0.58)]">
                  {panel.title}
                </p>
                <p className="mt-3 text-sm leading-7 text-[rgba(237,244,239,0.78)]">
                  {panel.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="admin-card rounded-[40px] p-8 sm:p-10 lg:p-12">
          <p className="eyebrow text-[var(--ink-soft)]">{loginTitle}</p>
          <h2 className="display mt-5 text-4xl font-semibold leading-[0.94]">
            {loginTitle}
          </h2>
          <p className="mt-5 text-base leading-8 text-[var(--ink-soft)]">
            {loginDescription}
          </p>
          <div className="mt-8">
            <LoginForm />
          </div>
          <div className="mt-8 border-t border-[var(--line)] pt-8">
            <p className="eyebrow text-[var(--ink-soft)]">{bootstrapTitle}</p>
            <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
              {bootstrap.signupEnabled
                ? bootstrapEnabledDescription
                : bootstrapDisabledDescription}
            </p>
            <div className="mt-6">
              <AdminBootstrapSignupForm enabled={bootstrap.signupEnabled} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
