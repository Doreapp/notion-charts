import { PageObjectResponse } from "@notionhq/client";
import {
  normalizeDateToDay,
  isDateFieldType,
  fillMissingDays,
} from "./date-utils";
import { sortDataPoints } from "./sort-utils";

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
  const isDateField = isDateFieldType(xAxisFieldType);

  pages.forEach((page) => {
    const xAxisProperty = page.properties?.[xAxisFieldId];
    if (!xAxisProperty) return;

    let xValue = extractXAxisValue(xAxisProperty);
    if (xValue === null) return;

    if (isDateField) {
      const normalizedDate = normalizeDateToDay(xValue);
      if (normalizedDate === null) return;
      xValue = normalizedDate;
    }

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

  let dataWithFilledDays = sortedData;
  if (isDateField && sortedData.length > 0) {
    dataWithFilledDays = fillMissingDays(sortedData);
  }

  const finalData = accumulate
    ? applyAccumulation(dataWithFilledDays)
    : dataWithFilledDays;

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
