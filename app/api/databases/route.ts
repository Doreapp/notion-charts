import { NextResponse } from "next/server";
import { getDatabases } from "@/lib/notion/api/databases";
import { parseDatabase } from "@/lib/parsers/database";
import { withAuth } from "@/lib/auth/validate-secret";

async function getDatabasesHandler() {
  try {
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

export const GET = withAuth(getDatabasesHandler);
