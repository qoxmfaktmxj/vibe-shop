import type { NextRequest } from "next/server";

import { resolveApiBaseUrl } from "@/lib/api-base-url";

const BLOCKED_REQUEST_HEADERS = new Set([
  "connection",
  "content-length",
  "host",
  "origin",
  "referer",
  "transfer-encoding",
]);

const BLOCKED_RESPONSE_HEADERS = new Set([
  "connection",
  "content-length",
  "transfer-encoding",
]);

function buildTargetUrl(pathSegments: string[], search: string) {
  return `${resolveApiBaseUrl()}/api/v1/${pathSegments.join("/")}${search}`;
}

function forwardHeaders(request: NextRequest) {
  const headers = new Headers();

  request.headers.forEach((value, key) => {
    if (BLOCKED_REQUEST_HEADERS.has(key.toLowerCase())) {
      return;
    }
    headers.set(key, value);
  });

  return headers;
}

function responseHeaders(source: Headers) {
  const headers = new Headers();

  source.forEach((value, key) => {
    if (BLOCKED_RESPONSE_HEADERS.has(key.toLowerCase())) {
      return;
    }
    headers.append(key, value);
  });
  return headers;
}

async function handle(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const method = request.method.toUpperCase();
  const hasBody = !["GET", "HEAD"].includes(method);
  const body = hasBody ? await request.arrayBuffer() : undefined;

  const upstream = await fetch(buildTargetUrl(path, request.nextUrl.search), {
    method,
    headers: forwardHeaders(request),
    body,
    redirect: "manual",
    cache: "no-store",
  });

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders(upstream.headers),
  });
}

export const runtime = "nodejs";

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handle(request, context);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handle(request, context);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handle(request, context);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handle(request, context);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handle(request, context);
}

export async function OPTIONS(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handle(request, context);
}
