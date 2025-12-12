import { NextResponse } from "next/server";
import { notionClient } from "@/lib/notion";

export async function GET() {
  try {
    const response = await notionClient.search({
      filter: {
        property: "object",
        value: "data_source",
      },
    });

    const databases = response.results.map((result: any) => {
      const title = result.title?.[0]?.plain_text || "Untitled";
      return {
        id: result.id,
        title,
        url: result.url,
      };
    });

    return NextResponse.json({ databases });
  } catch (error: any) {
    console.error("Error fetching databases:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch databases" },
      { status: 500 }
    );
  }
}
