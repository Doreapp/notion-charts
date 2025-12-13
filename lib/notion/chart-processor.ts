import { PageObjectResponse } from "@notionhq/client";

export interface ChartDataPoint {
  name: string;
  value: number;
}

interface ChartData {
  data: ChartDataPoint[];
  xAxisLabel?: string;
  yAxisLabel?: string;
}

function extractXAxisValue(
  property: PageObjectResponse["properties"][string]
): string | null {
  if (!property) return null;

  switch (property.type) {
    case "title":
      return property.title?.[0]?.plain_text || null;
    case "rich_text":
      return property.rich_text?.[0]?.plain_text || null;
    case "select":
      return property.select?.name || null;
    case "status":
      return property.status?.name || null;
    case "number":
      return property.number?.toString() || null;
    case "date":
      return property.date?.start || null;
    case "checkbox":
      return property.checkbox ? "Yes" : "No";
    case "created_time":
      return property.created_time || null;
    case "last_edited_time":
      return property.last_edited_time || null;
    default:
      return null;
  }
}

function extractYAxisNumericValue(
  property: PageObjectResponse["properties"][string]
): number | null {
  if (!property) return null;

  if (property.type === "number") {
    return property.number ?? null;
  }

  return null;
}

function sortDataPoints(
  data: ChartDataPoint[],
  xAxisFieldType: string,
  sortOrder: "asc" | "desc"
): ChartDataPoint[] {
  const sorted = [...data].sort((a, b) => {
    let comparison = 0;

    if (xAxisFieldType === "number") {
      const numA = parseFloat(a.name);
      const numB = parseFloat(b.name);
      if (!isNaN(numA) && !isNaN(numB)) {
        comparison = numA - numB;
      } else {
        comparison = a.name.localeCompare(b.name);
      }
    } else if (
      xAxisFieldType === "date" ||
      xAxisFieldType === "created_time" ||
      xAxisFieldType === "last_edited_time"
    ) {
      const dateA = new Date(a.name).getTime();
      const dateB = new Date(b.name).getTime();
      if (!isNaN(dateA) && !isNaN(dateB)) {
        comparison = dateA - dateB;
      } else {
        comparison = a.name.localeCompare(b.name);
      }
    } else {
      comparison = a.name.localeCompare(b.name);
    }

    return sortOrder === "desc" ? -comparison : comparison;
  });

  return sorted;
}

function applyAccumulation(data: ChartDataPoint[]): ChartDataPoint[] {
  let runningSum = 0;
  return data.map((point) => {
    runningSum += point.value;
    return { ...point, value: runningSum };
  });
}

export function processNotionDataForChart(
  pages: Array<PageObjectResponse>,
  xAxisFieldId: string,
  xAxisFieldType: string,
  aggregation: "count" | "sum" | "avg",
  yAxisFieldId?: string,
  sortOrder: "asc" | "desc" = "asc",
  accumulate: boolean = false
): ChartData {
  const groupedData = new Map<string, number[]>();

  pages.forEach((page) => {
    const xAxisProperty = page.properties?.[xAxisFieldId];
    if (!xAxisProperty) return;

    const xValue = extractXAxisValue(xAxisProperty);
    if (xValue === null) return;

    if (aggregation === "count") {
      const current = groupedData.get(xValue) || [];
      groupedData.set(xValue, [...current, 1]);
    } else {
      if (!yAxisFieldId) {
        throw new Error(
          `Y axis field is required for aggregation type: ${aggregation}`
        );
      }

      const yAxisProperty = page.properties?.[yAxisFieldId];
      if (!yAxisProperty) return;

      const yValue = extractYAxisNumericValue(yAxisProperty);
      if (yValue === null) return;

      const current = groupedData.get(xValue) || [];
      groupedData.set(xValue, [...current, yValue]);
    }
  });

  const data: ChartDataPoint[] = Array.from(groupedData.entries()).map(
    ([name, values]) => {
      let aggregatedValue: number;

      if (aggregation === "count") {
        aggregatedValue = values.length;
      } else if (aggregation === "sum") {
        aggregatedValue = values.reduce((sum, val) => sum + val, 0);
      } else {
        aggregatedValue =
          values.reduce((sum, val) => sum + val, 0) / values.length;
      }

      return { name, value: aggregatedValue };
    }
  );

  const sortedData = sortDataPoints(data, xAxisFieldType, sortOrder);
  const finalData = accumulate ? applyAccumulation(sortedData) : sortedData;

  let yAxisLabel = "Count";
  if (aggregation === "sum") {
    yAxisLabel = "Sum";
  } else if (aggregation === "avg") {
    yAxisLabel = "Average";
  }

  return {
    data: finalData,
    xAxisLabel: "Value",
    yAxisLabel,
  };
}
