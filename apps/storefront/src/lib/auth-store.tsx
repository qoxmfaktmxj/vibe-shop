"use client";

import { createContext, useContext, useState } from "react";

import { getAuthSession, signIn, signOut, signUp } from "@/lib/client-api";
import type { AuthSession, LoginPayload, SignUpPayload } from "@/lib/contracts";

type AuthContextValue = {
  session: AuthSession;
  signIn: (payload: LoginPayload) => Promise<AuthSession>;
  signUp: (payload: SignUpPayload) => Promise<AuthSession>;
  signOut: () => Promise<AuthSession>;
  refreshSession: () => Promise<AuthSession>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  initialSession,
  children,
}: {
  initialSession: AuthSession;
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<AuthSession>(initialSession);

  const refreshSession = async () => {
    const nextSession = await getAuthSession();
    setSession(nextSession);
    return nextSession;
  };

  const handleSignIn = async (payload: LoginPayload) => {
    await signIn(payload);
    const confirmedSession = await refreshSession();
    if (!confirmedSession.authenticated) {
      throw new Error("세션이 저장되지 않았습니다. 다시 시도해 주세요.");
    }
    return confirmedSession;
  };

  const handleSignUp = async (payload: SignUpPayload) => {
    await signUp(payload);
    const confirmedSession = await refreshSession();
    if (!confirmedSession.authenticated) {
      throw new Error("세션이 저장되지 않았습니다. 다시 시도해 주세요.");
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
        signUp: handleSignUp,
        signOut: handleSignOut,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
