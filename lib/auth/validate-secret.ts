import { NextRequest, NextResponse } from "next/server";

const API_SECRET_ENV = "API_SECRET";

function validateApiSecret(request: NextRequest): boolean {
  const apiSecret = process.env[API_SECRET_ENV];

  if (!apiSecret) {
    console.warn(`API is not protected. Use ${API_SECRET_ENV} to protect it.`);
    return true;
  }

  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return false;
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  return token === apiSecret;
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
    if (!validateApiSecret(request)) {
      return createUnauthorizedResponse();
    }

    return handler(request);
  };
}
