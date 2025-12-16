interface Database {
  id: string;
  title: string;
  url: string;
}

interface PropertyOption {
  id: string;
  name: string;
}

interface Property {
  id: string;
  name: string;
  type: string;
  options?: PropertyOption[];
}

export type DatabaseWithProperties = Database & {
  properties: Property[];
};

export type TextFilterOperator =
  | "equals"
  | "contains"
  | "is_empty"
  | "is_not_empty";
export type NumberFilterOperator =
  | "equals"
  | "greater_than"
  | "less_than"
  | "is_empty"
  | "is_not_empty";
export type SelectFilterOperator =
  | "equals"
  | "does_not_equal"
  | "is_empty"
  | "is_not_empty";
export type StatusFilterOperator =
  | "equals"
  | "does_not_equal"
  | "is_empty"
  | "is_not_empty";
export type DateFilterOperator =
  | "equals"
  | "before"
  | "after"
  | "is_empty"
  | "is_not_empty";
export type CheckboxFilterOperator = "equals";

export interface TextFilterCondition {
  propertyId: string;
  propertyType: "rich_text" | "title";
  operator: TextFilterOperator;
  value?: string;
}

export interface NumberFilterCondition {
  propertyId: string;
  propertyType: "number";
  operator: NumberFilterOperator;
  value?: number;
}

export interface SelectFilterCondition {
  propertyId: string;
  propertyType: "select";
  operator: SelectFilterOperator;
  value?: string;
}

export interface StatusFilterCondition {
  propertyId: string;
  propertyType: "status";
  operator: StatusFilterOperator;
  value?: string;
}

export interface DateFilterCondition {
  propertyId: string;
  propertyType: "date" | "created_time" | "last_edited_time";
  operator: DateFilterOperator;
  value?: string;
}

export interface CheckboxFilterCondition {
  propertyId: string;
  propertyType: "checkbox";
  operator: CheckboxFilterOperator;
  value: boolean;
}

export type FilterCondition =
  | TextFilterCondition
  | NumberFilterCondition
  | SelectFilterCondition
  | StatusFilterCondition
  | DateFilterCondition
  | CheckboxFilterCondition;

export interface ChartConfig {
  databaseId: string;
  xAxisFieldId: string;
  yAxisFieldId?: string;
  chartType: "line";
  aggregation: "count" | "sum" | "avg";
  sortOrder?: "asc" | "desc";
  accumulate?: boolean;
  filters?: FilterCondition[];
}
