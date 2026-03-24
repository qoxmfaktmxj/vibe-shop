import { NextRequest, NextResponse } from "next/server";

import { sanitizeNextPath } from "@/lib/auth-paths";
import { resolveApiBaseUrl } from "@/lib/api-base-url";
import { isSocialProvider, type SocialProvider } from "@/lib/social-auth";

type AuthSessionResponse = {
  authenticated: boolean;
  user: {
    id: number;
    name: string;
    email: string;
    provider: string;
  } | null;
};

const OAUTH_NEXT_COOKIE = "vibe_shop_oauth_next";

function resolveAppOrigin(request: NextRequest) {
  const configuredOrigin = process.env.APP_ORIGIN ?? process.env.NEXT_PUBLIC_APP_URL ?? "";
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
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      redirectUri: process.env.GOOGLE_REDIRECT_URI ?? `${appOrigin}/api/auth/social/callback/google`,
      tokenUrl: "https://oauth2.googleapis.com/token",
    };
  }

  return {
    clientId: process.env.KAKAO_CLIENT_ID ?? "",
    clientSecret: process.env.KAKAO_CLIENT_SECRET ?? "",
    redirectUri: process.env.KAKAO_REDIRECT_URI ?? `${appOrigin}/api/auth/social/callback/kakao`,
    tokenUrl: "https://kauth.kakao.com/oauth/token",
  };
}

function redirectToLogin(
  request: NextRequest,
  error: string,
  nextPath: string,
  provider?: SocialProvider,
) {
  const appOrigin = resolveAppOrigin(request);
  const url = new URL("/login", appOrigin);
  url.searchParams.set("error", error);
  if (nextPath !== "/account") {
    url.searchParams.set("next", nextPath);
  }

  const response = NextResponse.redirect(url);
  response.cookies.set({
    name: OAUTH_NEXT_COOKIE,
    value: "",
    path: "/",
    maxAge: 0,
  });

  if (provider) {
    response.cookies.set({
      name: `vibe_shop_oauth_state_${provider}`,
      value: "",
      path: "/",
      maxAge: 0,
    });
  }

  return response;
}

async function exchangeToken(
  provider: SocialProvider,
  code: string,
  request: NextRequest,
) {
  const appOrigin = resolveAppOrigin(request);
  const config = getProviderConfig(provider, appOrigin);
  if (!config.clientId) {
    return {
      error: `social_${provider}_unavailable`,
      accessToken: "",
    };
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    code,
  });

  if (config.clientSecret) {
    body.set("client_secret", config.clientSecret);
  }

  const tokenResponse = await fetch(config.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
    cache: "no-store",
  });

  const tokenJson = (await tokenResponse.json().catch(() => null)) as
    | { access_token?: string }
    | null;
  if (!tokenResponse.ok || !tokenJson?.access_token) {
    return {
      error: "token_exchange_failed",
      accessToken: "",
    };
  }

  return {
    error: "",
    accessToken: tokenJson.access_token,
  };
}

async function createStorefrontSession(
  provider: SocialProvider,
  accessToken: string,
  cartSessionToken?: string,
) {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (cartSessionToken) {
    headers.Cookie = `vibe_shop_cart=${cartSessionToken}`;
  }

  const response = await fetch(`${resolveApiBaseUrl()}/api/v1/auth/social/exchange`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      provider: provider.toUpperCase(),
      accessToken,
    }),
    cache: "no-store",
  });

  const json = (await response.json().catch(() => null)) as AuthSessionResponse | null;
  const setCookieHeader = response.headers.get("set-cookie");
  if (!response.ok || !json?.authenticated || !setCookieHeader) {
    return {
      error: "social_exchange_failed",
      setCookieHeader: "",
    };
  }

  return {
    error: "",
    setCookieHeader,
  };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> },
) {
  const { provider: rawProvider } = await context.params;
  const requestedNextPath = request.cookies.get(OAUTH_NEXT_COOKIE)?.value;
  const nextPath = sanitizeNextPath(requestedNextPath);

  if (!isSocialProvider(rawProvider)) {
    return redirectToLogin(request, "unsupported_provider", nextPath);
  }

  const error = request.nextUrl.searchParams.get("error");
  if (error) {
    return redirectToLogin(request, "oauth_access_denied", nextPath, rawProvider);
  }

  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return redirectToLogin(request, "missing_code", nextPath, rawProvider);
  }

  const incomingState = request.nextUrl.searchParams.get("state");
  const cookieState = request.cookies.get(`vibe_shop_oauth_state_${rawProvider}`)?.value;
  if (!incomingState || !cookieState || incomingState !== cookieState) {
    return redirectToLogin(request, "invalid_state", nextPath, rawProvider);
  }

  const tokenResult = await exchangeToken(rawProvider, code, request);
  if (tokenResult.error) {
    return redirectToLogin(request, tokenResult.error, nextPath, rawProvider);
  }

  const cartSessionToken = request.cookies.get("vibe_shop_cart")?.value;
  const sessionResult = await createStorefrontSession(
    rawProvider,
    tokenResult.accessToken,
    cartSessionToken,
  );
  if (sessionResult.error) {
    return redirectToLogin(request, sessionResult.error, nextPath, rawProvider);
  }

  const appOrigin = resolveAppOrigin(request);
  const response = NextResponse.redirect(new URL(nextPath, appOrigin));
  response.headers.append("set-cookie", sessionResult.setCookieHeader);
  response.cookies.set({
    name: OAUTH_NEXT_COOKIE,
    value: "",
    path: "/",
    maxAge: 0,
  });
  response.cookies.set({
    name: `vibe_shop_oauth_state_${rawProvider}`,
    value: "",
    path: "/",
    maxAge: 0,
  });
  return response;
}
