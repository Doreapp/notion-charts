import { NextRequest, NextResponse } from "next/server";
import { getDatabases } from "@/lib/notion/api/databases";
import { parseDatabase } from "@/lib/parsers/database";
import {
  validateApiSecret,
  createUnauthorizedResponse,
} from "@/lib/auth/validate-secret";

export async function GET(request: NextRequest) {
  try {
    if (!validateApiSecret(request)) {
      return createUnauthorizedResponse();
    }

    const databases = await getDatabases();
    const parsedDatabases = databases.map(parseDatabase);

    return NextResponse.json({ databases: parsedDatabases });
  } catch (error) {
    console.error("Error fetching databases:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch databases",
      },
      { status: 500 }
    );
  }
}
