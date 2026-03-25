import { redirect } from "next/navigation";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const nextQuery = next ? `&next=${encodeURIComponent(next)}` : "";
  redirect(`/auth?tab=signup${nextQuery}`);
}
