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
  fieldId: string;
  chartType: "line";
  aggregation: "count";
}
