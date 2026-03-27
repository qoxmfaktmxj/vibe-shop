"use client";

import { createContext, useContext, useState } from "react";

import {
  getAdminSession,
  signIn,
  signOut,
  signUpBootstrapAdmin,
} from "@/lib/admin-client-api";
import type {
  AdminSession,
  BootstrapAdminSignupPayload,
  LoginPayload,
} from "@/lib/admin-contracts";

type AuthContextValue = {
  session: AdminSession;
  signIn: (payload: LoginPayload) => Promise<AdminSession>;
  signUpBootstrapAdmin: (
    payload: BootstrapAdminSignupPayload,
  ) => Promise<AdminSession>;
  signOut: () => Promise<AdminSession>;
  refreshSession: () => Promise<AdminSession>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

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
    setSession(nextSession);
    return nextSession;
  };

  const handleSignIn = async (payload: LoginPayload) => {
    await signIn(payload);
    const confirmedSession = await refreshSession();
    if (!confirmedSession.authenticated) {
      throw new Error("관리자 세션이 연결되지 않았습니다. 다시 시도해 주세요.");
    }
    return confirmedSession;
  };

  const handleBootstrapSignUp = async (
    payload: BootstrapAdminSignupPayload,
  ) => {
    await signUpBootstrapAdmin(payload);
    const confirmedSession = await refreshSession();
    if (!confirmedSession.authenticated) {
      throw new Error("관리자 세션을 확인할 수 없습니다. 다시 시도해 주세요.");
    }
    return confirmedSession;
  };

  const handleSignOut = async () => {
    const nextSession = await signOut();
    setSession(nextSession);
    return nextSession;
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        signIn: handleSignIn,
        signUpBootstrapAdmin: handleBootstrapSignUp,
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
