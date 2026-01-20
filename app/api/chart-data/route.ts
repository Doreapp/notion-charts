import { NextRequest, NextResponse } from "next/server";
import { notionClient } from "@/lib/notion/client";
import {
  enrichRelationData,
  processNotionDataForChart,
} from "@/lib/notion/chart-processor";
import { getAllDatabasePages } from "@/lib/notion/api/database-pages";
import { withAuth } from "@/lib/auth/validate-secret";
import type { FilterCondition } from "@/types/notion";
import { sanitizeFilters } from "@/lib/notion/filter-sanatize";

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
    const filtersParam = searchParams.get("filters");

    let filters: FilterCondition[] | undefined;
    if (filtersParam) {
      try {
        filters = JSON.parse(decodeURIComponent(filtersParam));
        if (!Array.isArray(filters)) {
          return NextResponse.json(
            { error: "Invalid filters format. Must be an array." },
            { status: 400 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: "Failed to parse filters parameter." },
          { status: 400 }
        );
      }
    }

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

    const { filters: sanatizedFilters, error } = sanitizeFilters(
      filters,
      database
    );
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const filterProperties = [xAxisFieldId, yAxisFieldId ?? ""].filter(Boolean);
    const allPages = await getAllDatabasePages(databaseId, {
      filters: sanatizedFilters,
      filterProperties,
    });

    const xAxisFieldType = xAxisFieldProperty.type;
    let chartData = processNotionDataForChart(
      allPages,
      xAxisFieldId,
      xAxisFieldType,
      aggregation as "count" | "sum" | "avg",
      yAxisFieldId || undefined,
      sortOrder,
      accumulate
    );

    if (xAxisFieldType === "relation") {
      chartData = await enrichRelationData(chartData, xAxisFieldId, database);
    }

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
