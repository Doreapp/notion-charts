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

export function processNotionDataForChart(
  pages: Array<PageObjectResponse>,
  fieldId: string,
  fieldType: string,
  aggregation: "count"
): ChartData {
  if (aggregation !== "count") {
    throw new Error(`Unsupported aggregation: ${aggregation}`);
  }

  const valueCounts = new Map<string, number>();

  pages.forEach((page) => {
    const property = page.properties?.[fieldId];
    if (!property) return;

    let value: string | null = null;

    switch (property.type) {
      case "title":
        value = property.title?.[0]?.plain_text || null;
        break;
      case "rich_text":
        value = property.rich_text?.[0]?.plain_text || null;
        break;
      case "select":
        value = property.select?.name || null;
        break;
      case "status":
        value = property.status?.name || null;
        break;
      case "multi_select":
        property.multi_select?.forEach((item) => {
          const selectValue = item.name;
          valueCounts.set(selectValue, (valueCounts.get(selectValue) || 0) + 1);
        });
        return;
      case "number":
        value = property.number?.toString() || null;
        break;
      case "date":
        value = property.date?.start || null;
        break;
      case "checkbox":
        value = property.checkbox ? "Yes" : "No";
        break;
      case "created_time":
        value = property.created_time || null;
        break;
      case "last_edited_time":
        value = property.last_edited_time || null;
        break;
      default:
        console.warn(`Unsupported field type: ${fieldType}`);
        value = null;
    }

    if (value !== null) {
      valueCounts.set(value, (valueCounts.get(value) || 0) + 1);
    }
  });

  const data: ChartDataPoint[] = Array.from(valueCounts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => {
      if (fieldType === "number") {
        return parseFloat(a.name) - parseFloat(b.name);
      }
      if (fieldType === "date") {
        return new Date(a.name).getTime() - new Date(b.name).getTime();
      }
      return a.name.localeCompare(b.name);
    });

  return {
    data,
    xAxisLabel: "Value",
    yAxisLabel: "Count",
  };
}
