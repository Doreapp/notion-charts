import { NextRequest, NextResponse } from "next/server";
import { notionClient } from "@/lib/notion/client";
import {
  enrichRelationData,
  enrichRelationDataMultiSeries,
  processNotionDataForChart,
  processNotionDataForMultiSeriesChart,
} from "@/lib/notion/chart-processor";
import { getAllDatabasePages } from "@/lib/notion/api/database-pages";
import { withAuth } from "@/lib/auth/validate-secret";
import type { FilterCondition, SeriesConfig } from "@/types/notion";
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
    const seriesParam = searchParams.get("series");

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

    let seriesConfigs: SeriesConfig[] | undefined;
    if (seriesParam) {
      try {
        seriesConfigs = JSON.parse(decodeURIComponent(seriesParam));
        if (!Array.isArray(seriesConfigs) || seriesConfigs.length === 0) {
          return NextResponse.json(
            { error: "Invalid series format. Must be a non-empty array." },
            { status: 400 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: "Failed to parse series parameter." },
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

    // Multi-series path
    if (seriesConfigs) {
      // Validate each series config
      for (const [i, config] of seriesConfigs.entries()) {
        if (!["count", "sum", "avg"].includes(config.aggregation)) {
          return NextResponse.json(
            { error: `Series ${i}: invalid aggregation type '${config.aggregation}'` },
            { status: 400 }
          );
        }
        if (
          (config.aggregation === "sum" || config.aggregation === "avg") &&
          !config.yAxisFieldId
        ) {
          return NextResponse.json(
            { error: `Series ${i}: Y axis field is required for aggregation type '${config.aggregation}'` },
            { status: 400 }
          );
        }
        if (config.yAxisFieldId) {
          const yProp = database.properties[config.yAxisFieldId];
          if (!yProp) {
            return NextResponse.json(
              { error: `Series ${i}: Y axis field '${config.yAxisFieldId}' not found` },
              { status: 404 }
            );
          }
          if (
            (config.aggregation === "sum" || config.aggregation === "avg") &&
            yProp.type !== "number"
          ) {
            return NextResponse.json(
              { error: `Series ${i}: Y axis field must be of type 'number' for '${config.aggregation}'` },
              { status: 400 }
            );
          }
        }
      }

      const { filters: sanatizedFilters, error } = sanitizeFilters(
        filters,
        database
      );
      if (error) {
        return NextResponse.json({ error }, { status: 400 });
      }

      // Collect all needed filterProperties across all series
      const filterProperties = new Set<string>([xAxisFieldId]);
      for (const config of seriesConfigs) {
        if (config.yAxisFieldId) filterProperties.add(config.yAxisFieldId);
      }

      const allPages = await getAllDatabasePages(databaseId, {
        filters: sanatizedFilters,
        filterProperties: [...filterProperties],
      });

      const xAxisFieldType = xAxisFieldProperty.type;
      const seriesPropertyNames = seriesConfigs.map((config) => {
        if (config.yAxisFieldId) {
          return database.properties[config.yAxisFieldId]?.name;
        }
        return undefined;
      });

      let chartData = processNotionDataForMultiSeriesChart(
        allPages,
        xAxisFieldId,
        xAxisFieldType,
        seriesConfigs,
        seriesPropertyNames,
        sortOrder,
        accumulate
      );

      if (xAxisFieldType === "relation") {
        chartData = await enrichRelationDataMultiSeries(
          chartData,
          xAxisFieldId,
          database
        );
      }

      return NextResponse.json({
        data: chartData.data,
        seriesLabels: chartData.seriesLabels,
        xAxisLabel: xAxisFieldProperty.name || "Value",
        fieldType: xAxisFieldType,
        totalPages: allPages.length,
      });
    }

    // Single-series path (backward compat)
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
