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
    const xAxisFieldId = searchParams.get("x_axis_field_id");
    const yAxisFieldId = searchParams.get("y_axis_field_id");
    const aggregation = searchParams.get("aggregation") || "count";
    const sortOrder = (searchParams.get("sort_order") || "asc") as
      | "asc"
      | "desc";
    const accumulate = searchParams.get("accumulate") === "true";

    if (!databaseId || !xAxisFieldId) {
      return NextResponse.json(
        {
          error: "Missing required parameters: database_id and x_axis_field_id",
        },
        { status: 400 }
      );
    }

    if (
      aggregation !== "count" &&
      aggregation !== "sum" &&
      aggregation !== "avg"
    ) {
      return NextResponse.json(
        { error: "Invalid aggregation type. Must be 'count', 'sum', or 'avg'" },
        { status: 400 }
      );
    }

    if ((aggregation === "sum" || aggregation === "avg") && !yAxisFieldId) {
      return NextResponse.json(
        {
          error: `Y axis field is required for aggregation type: ${aggregation}`,
        },
        { status: 400 }
      );
    }

    const database = await notionClient.dataSources.retrieve({
      data_source_id: databaseId,
    });

    const xAxisFieldProperty = database.properties[xAxisFieldId];
    if (!xAxisFieldProperty) {
      return NextResponse.json(
        { error: `X axis field ${xAxisFieldId} not found in database` },
        { status: 404 }
      );
    }

    if (yAxisFieldId) {
      const yAxisFieldProperty = database.properties[yAxisFieldId];
      if (!yAxisFieldProperty) {
        return NextResponse.json(
          { error: `Y axis field ${yAxisFieldId} not found in database` },
          { status: 404 }
        );
      }

      if (
        (aggregation === "sum" || aggregation === "avg") &&
        yAxisFieldProperty.type !== "number"
      ) {
        return NextResponse.json(
          {
            error: `Y axis field must be of type 'number' for aggregation type: ${aggregation}`,
          },
          { status: 400 }
        );
      }
    }

    const allPages = await getAllDatabasePages(databaseId);

    const xAxisFieldType = xAxisFieldProperty.type;
    const chartData = processNotionDataForChart(
      allPages,
      xAxisFieldId,
      xAxisFieldType,
      aggregation as "count" | "sum" | "avg",
      yAxisFieldId || undefined,
      sortOrder,
      accumulate
    );

    return NextResponse.json({
      data: chartData.data,
      xAxisLabel: xAxisFieldProperty.name || "Value",
      yAxisLabel: chartData.yAxisLabel,
      fieldType: xAxisFieldType,
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
