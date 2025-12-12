import { NextRequest, NextResponse } from "next/server";
import { notionClient } from "@/lib/notion/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ databaseId: string }> }
) {
  try {
    const { databaseId } = await params;

    const database = await notionClient.dataSources.retrieve({
      data_source_id: databaseId,
    });

    const properties = Object.entries(database.properties).map(([key, prop]: [string, any]) => ({
      id: key,
      name: prop.name,
      type: prop.type,
    }));

    return NextResponse.json({ properties });
  } catch (error: any) {
    console.error("Error fetching database properties:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch database properties" },
      { status: 500 }
    );
  }
}
