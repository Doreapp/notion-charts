import { GetDataSourceResponse, PageObjectResponse } from "@notionhq/client";
import {
  normalizeDateToDay,
  isDateFieldType,
  fillMissingDays,
} from "./date-utils";
import { sortDataPoints } from "./sort-utils";
import { notionClient } from "./client";
import { findTitleProperty } from "./properties";

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
    case "url":
      return property.url || null;
    case "relation":
      return property.relation?.[0]?.id || null;
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

function groupPagesByXAxis(
  pages: Array<PageObjectResponse>,
  xAxisFieldId: string,
  xAxisFieldType: string,
  aggregation: "count" | "sum" | "avg",
  yAxisFieldId?: string
): Map<string, number[]> {
  const groupedData = new Map<string, number[]>();
  const isDateField = isDateFieldType(xAxisFieldType);

  for (const page of pages) {
    const xAxisProperty = page.properties?.[xAxisFieldId];
    if (!xAxisProperty) continue;

    let xValue = extractXAxisValue(xAxisProperty);
    if (xValue === null) continue;

    if (isDateField) {
      const normalizedDate = normalizeDateToDay(xValue);
      if (normalizedDate === null) continue;
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
      if (!yAxisProperty) continue;

      const yValue = extractYAxisNumericValue(yAxisProperty);
      if (yValue === null) continue;

      const current = groupedData.get(xValue) || [];
      groupedData.set(xValue, [...current, yValue]);
    }
  }

  return groupedData;
}

function aggregateGroupedData(
  groupedData: Map<string, number[]>,
  aggregation: "count" | "sum" | "avg"
): ChartDataPoint[] {
  return Array.from(groupedData.entries()).map(([name, values]) => {
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
  });
}

function processDateFields(
  data: ChartDataPoint[],
  xAxisFieldType: string
): ChartDataPoint[] {
  const isDateField = isDateFieldType(xAxisFieldType);
  if (isDateField && data.length > 0) {
    return fillMissingDays(data);
  }
  return data;
}

function getYAxisLabel(aggregation: "count" | "sum" | "avg"): string {
  if (aggregation === "sum") {
    return "Sum";
  }
  if (aggregation === "avg") {
    return "Average";
  }
  return "Count";
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
  const groupedData = groupPagesByXAxis(
    pages,
    xAxisFieldId,
    xAxisFieldType,
    aggregation,
    yAxisFieldId
  );

  const aggregatedData = aggregateGroupedData(groupedData, aggregation);
  const sortedData = sortDataPoints(aggregatedData, xAxisFieldType, sortOrder);
  const dataWithFilledDays = processDateFields(sortedData, xAxisFieldType);
  const finalData = accumulate
    ? applyAccumulation(dataWithFilledDays)
    : dataWithFilledDays;

  return {
    data: finalData,
    xAxisLabel: "Value",
    yAxisLabel: getYAxisLabel(aggregation),
  };
}

export async function enrichRelationData(
  data: ChartData,
  xAxisFieldId: string,
  database: GetDataSourceResponse
): Promise<ChartData> {
  const xAxisFieldProperty = database.properties[xAxisFieldId];
  if (!xAxisFieldProperty || xAxisFieldProperty.type !== "relation") {
    return data;
  }

  const referencedIds = new Set(data.data.map((point) => point.name));
  const referencedPages = await Promise.all(
    [...referencedIds].map(async (id) => {
      const page = await notionClient.pages.retrieve({
        page_id: id,
      });
      return page;
    })
  );
  const idToPage = new Map(referencedPages.map((page) => [page.id, page]));

  if (referencedPages.length === 0) {
    return data;
  }

  const titleProperty = findTitleProperty(referencedPages[0]);
  if (!titleProperty) {
    return data;
  }

  const enrichedData = data.data.map((point) => {
    const page = idToPage.get(point.name);
    if (!page || !("properties" in page)) {
      return point;
    }
    const title = page.properties[titleProperty];
    if (!title || !("title" in title)) {
      return point;
    }
    return {
      ...point,
      name: title.title?.[0]?.plain_text || point.name,
    };
  });

  return { ...data, data: enrichedData };
}
