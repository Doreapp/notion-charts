import { GetDataSourceResponse, PageObjectResponse } from "@notionhq/client";
import {
  normalizeDateToDay,
  isDateFieldType,
  fillMissingDays,
  fillMissingDaysInRange,
} from "./date-utils";
import { sortDataPoints } from "./sort-utils";
import { notionClient } from "./client";
import { findTitleProperty } from "./properties";
import type { SeriesConfig } from "@/types/notion";

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

interface MultiSeriesDataPoint {
  name: string;
  [key: string]: string | number;
}

interface MultiSeriesChartData {
  data: MultiSeriesDataPoint[];
  seriesLabels: string[];
  xAxisLabel?: string;
}

function getSeriesLabel(
  aggregation: "count" | "sum" | "avg",
  propertyName?: string
): string {
  if (aggregation === "count") return "Count";
  const prefix = aggregation === "sum" ? "Sum" : "Average";
  return propertyName ? `${prefix} of ${propertyName}` : prefix;
}

export function processNotionDataForMultiSeriesChart(
  pages: Array<PageObjectResponse>,
  xAxisFieldId: string,
  xAxisFieldType: string,
  seriesConfigs: SeriesConfig[],
  seriesPropertyNames: (string | undefined)[],
  sortOrder: "asc" | "desc" = "asc",
  accumulate: boolean = false
): MultiSeriesChartData {
  const isDateField = isDateFieldType(xAxisFieldType);
  const allSeriesData: ChartDataPoint[][] = [];

  // Process each series independently through the existing pipeline
  for (const config of seriesConfigs) {
    const groupedData = groupPagesByXAxis(
      pages,
      xAxisFieldId,
      xAxisFieldType,
      config.aggregation,
      config.yAxisFieldId
    );
    const aggregatedData = aggregateGroupedData(groupedData, config.aggregation);
    const sortedData = sortDataPoints(aggregatedData, xAxisFieldType, sortOrder);
    allSeriesData.push(sortedData);
  }

  // For date fields: compute global min/max, fill all series to same range
  if (isDateField) {
    let globalMin: string | null = null;
    let globalMax: string | null = null;

    for (const seriesData of allSeriesData) {
      if (seriesData.length > 0) {
        const first = seriesData[0].name;
        const last = seriesData[seriesData.length - 1].name;
        if (globalMin === null || first < globalMin) globalMin = first;
        if (globalMax === null || last > globalMax) globalMax = last;
      }
    }

    if (globalMin && globalMax) {
      for (let i = 0; i < allSeriesData.length; i++) {
        allSeriesData[i] = fillMissingDaysInRange(
          allSeriesData[i],
          globalMin,
          globalMax
        );
      }
    }
  }

  // Apply accumulation per series if requested
  if (accumulate) {
    for (let i = 0; i < allSeriesData.length; i++) {
      allSeriesData[i] = applyAccumulation(allSeriesData[i]);
    }
  }

  // Merge: collect all unique X-axis names preserving order from first series
  const xAxisNames: string[] = [];
  const xAxisSet = new Set<string>();
  for (const seriesData of allSeriesData) {
    for (const point of seriesData) {
      if (!xAxisSet.has(point.name)) {
        xAxisSet.add(point.name);
        xAxisNames.push(point.name);
      }
    }
  }

  // Build lookup maps for each series
  const seriesMaps = allSeriesData.map((seriesData) => {
    const map = new Map<string, number>();
    for (const point of seriesData) {
      map.set(point.name, point.value);
    }
    return map;
  });

  // Build merged data points
  const mergedData: MultiSeriesDataPoint[] = xAxisNames.map((name) => {
    const point: MultiSeriesDataPoint = { name };
    for (let i = 0; i < seriesMaps.length; i++) {
      point[`series_${i}`] = seriesMaps[i].get(name) ?? 0;
    }
    return point;
  });

  // Build series labels
  const seriesLabels = seriesConfigs.map((config, i) =>
    getSeriesLabel(config.aggregation, seriesPropertyNames[i])
  );

  return {
    data: mergedData,
    seriesLabels,
    xAxisLabel: "Value",
  };
}

export async function enrichRelationDataMultiSeries(
  chartData: MultiSeriesChartData,
  xAxisFieldId: string,
  database: GetDataSourceResponse
): Promise<MultiSeriesChartData> {
  const xAxisFieldProperty = database.properties[xAxisFieldId];
  if (!xAxisFieldProperty || xAxisFieldProperty.type !== "relation") {
    return chartData;
  }

  const referencedIds = new Set(chartData.data.map((point) => point.name));
  const referencedPages = await Promise.all(
    [...referencedIds].map(async (id) => {
      const page = await notionClient.pages.retrieve({ page_id: id as string });
      return page;
    })
  );
  const idToPage = new Map(referencedPages.map((page) => [page.id, page]));

  if (referencedPages.length === 0) {
    return chartData;
  }

  const titleProperty = findTitleProperty(referencedPages[0]);
  if (!titleProperty) {
    return chartData;
  }

  const enrichedData = chartData.data.map((point) => {
    const page = idToPage.get(point.name as string);
    if (!page || !("properties" in page)) {
      return point;
    }
    const title = page.properties[titleProperty];
    if (!title || !("title" in title)) {
      return point;
    }
    return {
      ...point,
      name: title.title?.[0]?.plain_text || (point.name as string),
    };
  });

  return { ...chartData, data: enrichedData };
}
