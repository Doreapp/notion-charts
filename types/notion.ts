export interface NotionDatabase {
  id: string;
  title: string;
  url: string;
}

export interface NotionProperty {
  id: string;
  name: string;
  type: string;
}

export interface ChartConfig {
  databaseId: string;
  fieldId: string;
  chartType: "line";
  aggregation: "count";
}
