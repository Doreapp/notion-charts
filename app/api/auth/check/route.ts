import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/validate-secret";

async function checkAuthHandler() {
  return NextResponse.json({ authenticated: true });
}

export const GET = withAuth(checkAuthHandler);
