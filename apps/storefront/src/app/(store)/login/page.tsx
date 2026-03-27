import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;
  const params = new URLSearchParams({ tab: "login" });

  if (next) {
    params.set("next", next);
  }
  if (error) {
    params.set("error", error);
  }

  redirect(`/auth?${params.toString()}`);
}
