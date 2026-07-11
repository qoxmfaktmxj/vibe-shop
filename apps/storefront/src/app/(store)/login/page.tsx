import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const nextQuery = next ? `&next=${encodeURIComponent(next)}` : "";
  const errorQuery = error ? `&error=${encodeURIComponent(error)}` : "";
  redirect(`/auth?tab=login${nextQuery}${errorQuery}`);
}
