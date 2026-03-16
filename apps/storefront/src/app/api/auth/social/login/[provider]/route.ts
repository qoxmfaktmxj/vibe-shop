import { NextRequest, NextResponse } from "next/server";

import { sanitizeNextPath } from "@/lib/auth-paths";
import { isSocialProvider, type SocialProvider } from "@/lib/social-auth";

const OAUTH_NEXT_COOKIE = "vibe_shop_oauth_next";

function resolveAppOrigin(request: NextRequest) {
  const configuredOrigin =
    process.env.APP_ORIGIN ?? process.env.NEXT_PUBLIC_APP_URL ?? "";
  if (configuredOrigin) {
    return configuredOrigin;
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  if (forwardedHost) {
    const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
    return `${forwardedProto}://${forwardedHost}`;
  }

  const host = request.headers.get("host") ?? request.nextUrl.host;
  const protocol = request.nextUrl.protocol.replace(":", "") || "https";
  return `${protocol}://${host}`;
}

function getProviderConfig(provider: SocialProvider, appOrigin: string) {
  if (provider === "google") {
    return {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      redirectUri:
        process.env.GOOGLE_REDIRECT_URI ??
        `${appOrigin}/api/auth/social/callback/google`,
      authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      scope: "openid email profile",
      extra: {
        access_type: "offline",
        prompt: "consent",
      },
    };
  }

  return {
    clientId: process.env.KAKAO_CLIENT_ID ?? "",
    redirectUri:
      process.env.KAKAO_REDIRECT_URI ??
      `${appOrigin}/api/auth/social/callback/kakao`,
    authUrl: "https://kauth.kakao.com/oauth/authorize",
    scope: "profile_nickname account_email",
    extra: {},
  };
}

function redirectToLogin(
  request: NextRequest,
  error: string,
  nextPath: string,
) {
  const appOrigin = resolveAppOrigin(request);
  const url = new URL("/login", appOrigin);
  url.searchParams.set("error", error);
  if (nextPath !== "/account") {
    url.searchParams.set("next", nextPath);
  }
  return NextResponse.redirect(url);
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> },
) {
  const { provider: rawProvider } = await context.params;
  if (!isSocialProvider(rawProvider)) {
    return redirectToLogin(request, "unsupported_provider", "/account");
  }

  const requestedNext = request.nextUrl.searchParams.get("next");
  const nextPath = sanitizeNextPath(requestedNext);
  const appOrigin = resolveAppOrigin(request);
  const config = getProviderConfig(rawProvider, appOrigin);
  if (!config.clientId) {
    return redirectToLogin(request, `social_${rawProvider}_unavailable`, nextPath);
  }

  const state = crypto.randomUUID();
  const authorizeUrl = new URL(config.authUrl);
  authorizeUrl.searchParams.set("client_id", config.clientId);
  authorizeUrl.searchParams.set("redirect_uri", config.redirectUri);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", config.scope);
  authorizeUrl.searchParams.set("state", state);

  Object.entries(config.extra).forEach(([key, value]) => {
    authorizeUrl.searchParams.set(key, value);
  });

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set({
    name: `vibe_shop_oauth_state_${rawProvider}`,
    value: state,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });
  response.cookies.set({
    name: OAUTH_NEXT_COOKIE,
    value: nextPath,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });
  return response;
}
