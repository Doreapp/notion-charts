import { NextRequest, NextResponse } from "next/server";
import { notionClient } from "@/lib/notion/client";
import { processNotionDataForChart } from "@/lib/notion/chart-processor";
import { getAllDatabasePages } from "@/lib/notion/api/database-pages";
import { withAuth } from "@/lib/auth/validate-secret";

/**
 * API route to fetch chart data from a Notion database.
 */
async function getChartDataHandler(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const databaseId = searchParams.get("database_id");
    const fieldId = searchParams.get("field_id");

    if (!databaseId || !fieldId) {
      return NextResponse.json(
        { error: "Missing required parameters: database_id and field_id" },
        { status: 400 }
      );
    }

    const database = await notionClient.dataSources.retrieve({
      data_source_id: databaseId,
    });

    const fieldProperty = database.properties[fieldId];
    if (!fieldProperty) {
      return NextResponse.json(
        { error: `Field ${fieldId} not found in database` },
        { status: 404 }
      );
    }

    const allPages = await getAllDatabasePages(databaseId);

    const fieldType = fieldProperty.type;
    const chartData = processNotionDataForChart(
      allPages,
      fieldId,
      fieldType,
      "count"
    );

    return NextResponse.json({
      data: chartData.data,
      xAxisLabel: fieldProperty.name || "Value",
      yAxisLabel: chartData.yAxisLabel,
      fieldType,
      totalPages: allPages.length,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch chart data";
    console.error("Error fetching chart data:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export const GET = withAuth(getChartDataHandler);
