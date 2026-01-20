import { NextRequest, NextResponse } from "next/server";
import { API_SECRET_ENV, validateOrigin } from "@/lib/auth/validate-secret";

export async function POST(request: NextRequest) {
  try {
    if (!validateOrigin(request)) {
      return NextResponse.json(
        { error: "Forbidden: Request origin not allowed" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { secret } = body;

    if (!secret || typeof secret !== "string") {
      return NextResponse.json(
        { error: "Secret is required" },
        { status: 400 }
      );
    }

    const apiSecret = process.env[API_SECRET_ENV];

    if (!apiSecret) {
      console.warn(
        `API is not protected. Use ${API_SECRET_ENV} to protect it.`
      );
      return NextResponse.json({ success: true });
    }

    if (secret !== apiSecret) {
      return NextResponse.json(
        { error: "Invalid API secret" },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in login route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
