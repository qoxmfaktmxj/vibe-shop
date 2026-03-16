import { NextRequest, NextResponse } from "next/server";

import { sanitizeNextPath } from "@/lib/auth-paths";
import { isSocialProvider, type SocialProvider } from "@/lib/social-auth";

type SocialProfile = {
  providerUserId: string;
  email: string;
  displayName: string;
};

type AuthSessionResponse = {
  authenticated: boolean;
  sessionToken?: string | null;
};

const API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8080";

const AUTH_SESSION_COOKIE = "vibe_shop_session";
const OAUTH_NEXT_COOKIE = "vibe_shop_oauth_next";
const AUTH_SESSION_MAX_AGE = 60 * 60 * 24 * 30;

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
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      redirectUri:
        process.env.GOOGLE_REDIRECT_URI ??
        `${appOrigin}/api/auth/social/callback/google`,
      tokenUrl: "https://oauth2.googleapis.com/token",
      profileUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
    };
  }

  return {
    clientId: process.env.KAKAO_CLIENT_ID ?? "",
    clientSecret: process.env.KAKAO_CLIENT_SECRET ?? "",
    redirectUri:
      process.env.KAKAO_REDIRECT_URI ??
      `${appOrigin}/api/auth/social/callback/kakao`,
    tokenUrl: "https://kauth.kakao.com/oauth/token",
    profileUrl: "https://kapi.kakao.com/v2/user/me",
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

async function fetchProfile(provider: SocialProvider, accessToken: string, request: NextRequest) {
  const appOrigin = resolveAppOrigin(request);
  const config = getProviderConfig(provider, appOrigin);

  const profileResponse = await fetch(config.profileUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  const profileJson = (await profileResponse.json().catch(() => null)) as Record<string, unknown> | null;
  if (!profileResponse.ok || !profileJson) {
    return {
      error: "profile_fetch_failed",
      profile: null,
    };
  }

  if (provider === "google") {
    const profile = {
      providerUserId: String(profileJson.id ?? ""),
      email: String(profileJson.email ?? "").trim().toLowerCase(),
      displayName: String(profileJson.name ?? profileJson.email ?? "Google User"),
    };
    return {
      error: profile.providerUserId && profile.email ? "" : "email_required",
      profile,
    };
  }

  const kakaoAccount = (profileJson.kakao_account ?? {}) as Record<string, unknown>;
  const kakaoProfile = (kakaoAccount.profile ?? {}) as Record<string, unknown>;
  const profile = {
    providerUserId: String(profileJson.id ?? ""),
    email: String(kakaoAccount.email ?? "").trim().toLowerCase(),
    displayName: String(kakaoProfile.nickname ?? "Kakao User"),
  };
  return {
    error: profile.providerUserId && profile.email ? "" : "email_required",
    profile,
  };
}

async function createStorefrontSession(
  profile: SocialProfile,
  provider: SocialProvider,
  cartSessionToken?: string,
) {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/social/exchange`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cartSessionToken
        ? {
            Cookie: `vibe_shop_cart=${cartSessionToken}`,
          }
        : {}),
    },
    body: JSON.stringify({
      provider: provider.toUpperCase(),
      providerUserId: profile.providerUserId,
      email: profile.email,
      displayName: profile.displayName,
    }),
    cache: "no-store",
  });

  const json = (await response.json().catch(() => null)) as AuthSessionResponse | null;
  if (!response.ok || !json?.authenticated || !json.sessionToken) {
    return {
      error: "social_exchange_failed",
      sessionToken: "",
    };
  }

  return {
    error: "",
    sessionToken: json.sessionToken,
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

  const profileResult = await fetchProfile(rawProvider, tokenResult.accessToken, request);
  if (profileResult.error || !profileResult.profile) {
    return redirectToLogin(
      request,
      profileResult.error || "profile_fetch_failed",
      nextPath,
      rawProvider,
    );
  }

  const cartSessionToken = request.cookies.get("vibe_shop_cart")?.value;
  const sessionResult = await createStorefrontSession(
    profileResult.profile,
    rawProvider,
    cartSessionToken,
  );
  if (sessionResult.error) {
    return redirectToLogin(request, sessionResult.error, nextPath, rawProvider);
  }

  const appOrigin = resolveAppOrigin(request);
  const response = NextResponse.redirect(new URL(nextPath, appOrigin));
  response.cookies.set({
    name: AUTH_SESSION_COOKIE,
    value: sessionResult.sessionToken,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AUTH_SESSION_MAX_AGE,
  });
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
