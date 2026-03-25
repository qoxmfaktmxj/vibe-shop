import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const nextQuery = next ? `&next=${encodeURIComponent(next)}` : "";
  redirect(`/auth?tab=login${nextQuery}`);
}
