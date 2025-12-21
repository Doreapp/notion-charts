import type { ChartConfig, FilterCondition } from "@/types/notion";

export function configToUrlParams(config: ChartConfig): URLSearchParams {
  const params = new URLSearchParams();
  params.set("database_id", config.databaseId);
  params.set("x_axis_field_id", config.xAxisFieldId);

  if (config.yAxisFieldId) {
    params.set("y_axis_field_id", config.yAxisFieldId);
  }

  params.set("aggregation", config.aggregation);
  params.set("chart_type", config.chartType);

  if (config.sortOrder) {
    params.set("sort_order", config.sortOrder);
  }

  if (config.accumulate) {
    params.set("accumulate", "true");
  }

  if (config.filters && config.filters.length > 0) {
    params.set("filters", encodeURIComponent(JSON.stringify(config.filters)));
  }

  return params;
}

export function urlParamsToConfig(
  searchParams: URLSearchParams
): ChartConfig | null {
  const databaseId = searchParams.get("database_id");
  const xAxisFieldId =
    searchParams.get("x_axis_field_id") || searchParams.get("field_id");
  const yAxisFieldId = searchParams.get("y_axis_field_id") || undefined;
  const aggregation = (searchParams.get("aggregation") || "count") as
    | "count"
    | "sum"
    | "avg";
  const chartType = (searchParams.get("chart_type") || "line") as
    | "line"
    | "pie";
  const sortOrder = (searchParams.get("sort_order") || "asc") as "asc" | "desc";
  const accumulate = searchParams.get("accumulate") === "true";
  const filtersParam = searchParams.get("filters");

  let filters: FilterCondition[] | undefined;
  if (filtersParam) {
    try {
      filters = JSON.parse(decodeURIComponent(filtersParam));
    } catch (e) {
      console.error("Failed to parse filters from URL", e);
    }
  }

  if (databaseId && xAxisFieldId) {
    return {
      databaseId,
      xAxisFieldId,
      yAxisFieldId,
      chartType,
      aggregation,
      sortOrder,
      accumulate,
      filters,
    };
  }

  return null;
}
