import { NextRequest, NextResponse } from "next/server";

export const API_SECRET_ENV = "API_SECRET";
export const COOKIE_NAME = "api_secret";

function getRequestOrigin(request: NextRequest): string | null {
  const origin = request.headers.get("origin");
  if (origin) return origin;

  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const url = new URL(referer);
      return url.origin;
    } catch {
      return null;
    }
  }

  return null;
}

function isSameOrigin(request: NextRequest, origin: string | null): boolean {
  if (!origin) return false;
  try {
    const requestUrl = new URL(request.url);
    return requestUrl.origin === origin;
  } catch {
    return false;
  }
}

export function validateOrigin(request: NextRequest): boolean {
  const origin = getRequestOrigin(request);

  if (!origin) {
    return false;
  }

  if (isSameOrigin(request, origin)) {
    return true;
  }

  const notionDomains = ["https://www.notion.so", "https://notion.so"];

  if (notionDomains.includes(origin)) {
    return true;
  }

  try {
    const originUrl = new URL(origin);
    if (originUrl.hostname.endsWith(".notion.so")) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

function validateApiSecret(request: NextRequest): boolean {
  const apiSecret = process.env[API_SECRET_ENV];

  if (!apiSecret) {
    console.warn(`API is not protected. Use ${API_SECRET_ENV} to protect it.`);
    return true;
  }

  const cookieSecret = request.cookies.get(COOKIE_NAME)?.value;

  if (!cookieSecret) {
    return false;
  }

  return cookieSecret === apiSecret;
}

function createUnauthorizedResponse(message?: string): NextResponse {
  return NextResponse.json(
    { error: message || "Unauthorized: Invalid or missing API secret" },
    { status: 401 }
  );
}

type RouteHandler = (
  request: NextRequest
) => Promise<NextResponse> | NextResponse;

export function withAuth(handler: RouteHandler): RouteHandler {
  return async (request: NextRequest) => {
    if (!validateOrigin(request)) {
      return NextResponse.json(
        { error: "Forbidden: Request origin not allowed" },
        { status: 403 }
      );
    }

    if (!validateApiSecret(request)) {
      return createUnauthorizedResponse();
    }

    return handler(request);
  };
}
