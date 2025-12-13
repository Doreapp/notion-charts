interface Database {
  id: string;
  title: string;
  url: string;
}

interface Property {
  id: string;
  name: string;
  type: string;
}

export type DatabaseWithProperties = Database & {
  properties: Property[];
};

export interface ChartConfig {
  databaseId: string;
  xAxisFieldId: string;
  yAxisFieldId?: string;
  chartType: "line";
  aggregation: "count" | "sum" | "avg";
  sortOrder?: "asc" | "desc";
  accumulate?: boolean;
}
