export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface ChartData {
  data: ChartDataPoint[];
  xAxisLabel?: string;
  yAxisLabel?: string;
}

interface NotionPage {
  properties: Record<
    string,
    {
      title?: Array<{ plain_text: string }>;
      rich_text?: Array<{ plain_text: string }>;
      select?: { name: string };
      multi_select?: Array<{ name: string }>;
      number?: number;
      date?: { start: string };
      checkbox?: boolean;
    }
  >;
}

export function processNotionDataForChart(
  pages: Array<Record<string, unknown>>,
  fieldId: string,
  fieldType: string,
  aggregation: "count"
): ChartData {
  if (aggregation !== "count") {
    throw new Error(`Unsupported aggregation: ${aggregation}`);
  }

  const valueCounts = new Map<string, number>();

  pages.forEach((page) => {
    const notionPage = page as unknown as NotionPage;
    const property = notionPage.properties?.[fieldId];
    if (!property) return;

    let value: string | null = null;

    switch (fieldType) {
      case "title":
        value = property.title?.[0]?.plain_text || null;
        break;
      case "rich_text":
        value = property.rich_text?.[0]?.plain_text || null;
        break;
      case "select":
        value = property.select?.name || null;
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
      default:
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
