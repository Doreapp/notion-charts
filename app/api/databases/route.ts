import { NextResponse } from "next/server";
import { getDatabases } from "@/lib/notion/api/databases";
import { parseDatabase } from "@/lib/parsers/database";
import { withAuth } from "@/lib/auth/validate-secret";
import { enrichProperties } from "@/lib/notion/properties";

async function getDatabasesHandler() {
  try {
    const databases = await getDatabases();
    const enrichedDatabases = await Promise.all(
      databases.map(enrichProperties)
    );
    const parsedDatabases = enrichedDatabases.map(parseDatabase);

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
