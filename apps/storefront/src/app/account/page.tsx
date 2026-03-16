import { redirect } from "next/navigation";

import { AccountDashboard } from "@/components/account/account-dashboard";
import { getAccountProfile, getAuthSession, getShippingAddresses, listOrders } from "@/lib/server-api";

export default async function AccountPage() {
  const session = await getAuthSession().catch(() => ({ authenticated: false, user: null }));

  if (!session.authenticated || !session.user) {
    redirect("/login?next=/account");
  }

  const [profile, addresses, orders] = await Promise.all([
    getAccountProfile(),
    getShippingAddresses(),
    listOrders(),
  ]);

  return (
    <AccountDashboard
      initialProfile={profile}
      initialAddresses={addresses}
      recentOrders={orders.slice(0, 3)}
    />
  );
}
