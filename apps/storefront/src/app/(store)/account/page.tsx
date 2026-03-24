import { redirect } from "next/navigation";

import { AccountDashboard } from "@/components/account/account-dashboard";
import {
  getAccountProfile,
  getAccountReviews,
  getAccountWishlist,
  getAuthSession,
  getShippingAddresses,
  listOrders,
} from "@/lib/server-api";

export default async function AccountPage() {
  const session = await getAuthSession().catch(() => ({ authenticated: false, user: null }));

  if (!session.authenticated || !session.user) {
    redirect("/login?next=/account");
  }

  const [profile, addresses, orders, wishlist, reviews] = await Promise.all([
    getAccountProfile(),
    getShippingAddresses(),
    listOrders(),
    getAccountWishlist(),
    getAccountReviews(),
  ]);

  return (
    <AccountDashboard
      initialProfile={profile}
      initialAddresses={addresses}
      recentOrders={orders.slice(0, 3)}
      initialWishlist={wishlist}
      initialReviews={reviews}
    />
  );
}
