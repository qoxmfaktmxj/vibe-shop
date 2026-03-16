"use client";

import { createContext, useContext, useState } from "react";

import { getAdminSession, signIn, signOut } from "@/lib/client-api";
import type { AdminSession, LoginPayload } from "@/lib/contracts";

type AuthContextValue = {
  session: AdminSession;
  signIn: (payload: LoginPayload) => Promise<AdminSession>;
  signOut: () => Promise<AdminSession>;
  refreshSession: () => Promise<AdminSession>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function writeSessionCookie(sessionToken: string) {
  document.cookie = `vibe_shop_admin_session=${sessionToken}; Max-Age=${60 * 60 * 24 * 30}; Path=/; SameSite=Lax`;
}

function clearSessionCookie() {
  document.cookie = "vibe_shop_admin_session=; Max-Age=0; Path=/; SameSite=Lax";
}

export function AdminAuthProvider({
  initialSession,
  children,
}: {
  initialSession: AdminSession;
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<AdminSession>(initialSession);

  const refreshSession = async () => {
    const nextSession = await getAdminSession();
    if (!nextSession.authenticated) {
      clearSessionCookie();
    }
    setSession(nextSession);
    return nextSession;
  };

  const handleSignIn = async (payload: LoginPayload) => {
    const nextSession = await signIn(payload);
    if (nextSession.sessionToken) {
      writeSessionCookie(nextSession.sessionToken);
    }
    const confirmedSession = await refreshSession();
    if (!confirmedSession.authenticated) {
      throw new Error("관리자 세션이 연결되지 않았습니다. 다시 시도해 주세요.");
    }
    return confirmedSession;
  };

  const handleSignOut = async () => {
    clearSessionCookie();
    const nextSession = await signOut();
    setSession(nextSession);
    return nextSession;
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        signIn: handleSignIn,
        signOut: handleSignOut,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }

  return context;
}
