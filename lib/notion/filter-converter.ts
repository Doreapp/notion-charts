import type {
  FilterCondition,
  TextFilterCondition,
  NumberFilterCondition,
  SelectFilterCondition,
  StatusFilterCondition,
  DateFilterCondition,
  CheckboxFilterCondition,
} from "@/types/notion";
import { QueryDataSourceParameters } from "@notionhq/client";

type NotionFilterProperty = Extract<
  QueryDataSourceParameters["filter"],
  Record<string, unknown> & {
    property: string;
    type?: string;
  }
>;

type NotionFilter = QueryDataSourceParameters["filter"];

function convertTextFilter(
  condition: TextFilterCondition
): NotionFilterProperty {
  let textCondition: {
    equals?: string;
    contains?: string;
    is_empty?: true;
    is_not_empty?: true;
  } = {};

  switch (condition.operator) {
    case "equals":
      if (condition.value !== undefined) {
        textCondition = { equals: condition.value };
      }
      break;
    case "contains":
      if (condition.value !== undefined) {
        textCondition = { contains: condition.value };
      }
      break;
    case "is_empty":
      textCondition = { is_empty: true };
      break;
    case "is_not_empty":
      textCondition = { is_not_empty: true };
      break;
  }

  return {
    property: condition.propertyId,
    type: condition.propertyType,
    [condition.propertyType]: textCondition,
  } as NotionFilterProperty;
}

function convertNumberFilter(
  condition: NumberFilterCondition
): NotionFilterProperty {
  const numberCondition: {
    equals?: number;
    greater_than?: number;
    less_than?: number;
    is_empty?: true;
    is_not_empty?: true;
  } = {};

  switch (condition.operator) {
    case "equals":
      if (condition.value !== undefined) {
        numberCondition.equals = condition.value;
      }
      break;
    case "greater_than":
      if (condition.value !== undefined) {
        numberCondition.greater_than = condition.value;
      }
      break;
    case "less_than":
      if (condition.value !== undefined) {
        numberCondition.less_than = condition.value;
      }
      break;
    case "is_empty":
      numberCondition.is_empty = true;
      break;
    case "is_not_empty":
      numberCondition.is_not_empty = true;
      break;
  }

  return {
    property: condition.propertyId,
    type: condition.propertyType,
    number: numberCondition,
  } as NotionFilterProperty;
}

function convertSelectFilter(
  condition: SelectFilterCondition
): NotionFilterProperty {
  const selectCondition: {
    equals?: string;
    does_not_equal?: string;
    is_empty?: true;
    is_not_empty?: true;
  } = {};

  switch (condition.operator) {
    case "equals":
      if (condition.value !== undefined) {
        selectCondition.equals = condition.value;
      }
      break;
    case "does_not_equal":
      if (condition.value !== undefined) {
        selectCondition.does_not_equal = condition.value;
      }
      break;
    case "is_empty":
      selectCondition.is_empty = true;
      break;
    case "is_not_empty":
      selectCondition.is_not_empty = true;
      break;
  }

  return {
    property: condition.propertyId,
    type: condition.propertyType,
    select: selectCondition,
  } as NotionFilterProperty;
}

function convertStatusFilter(
  condition: StatusFilterCondition
): NotionFilterProperty {
  const statusCondition: {
    equals?: string;
    does_not_equal?: string;
    is_empty?: true;
    is_not_empty?: true;
  } = {};

  switch (condition.operator) {
    case "equals":
      if (condition.value !== undefined) {
        statusCondition.equals = condition.value;
      }
      break;
    case "does_not_equal":
      if (condition.value !== undefined) {
        statusCondition.does_not_equal = condition.value;
      }
      break;
    case "is_empty":
      statusCondition.is_empty = true;
      break;
    case "is_not_empty":
      statusCondition.is_not_empty = true;
      break;
  }

  return {
    property: condition.propertyId,
    type: condition.propertyType,
    status: statusCondition,
  } as NotionFilterProperty;
}

function convertDateFilter(
  condition: DateFilterCondition
): NotionFilterProperty {
  const dateCondition: {
    equals?: string;
    before?: string;
    after?: string;
    is_empty?: true;
    is_not_empty?: true;
  } = {};

  switch (condition.operator) {
    case "equals":
      if (condition.value !== undefined) {
        dateCondition.equals = condition.value;
      }
      break;
    case "before":
      if (condition.value !== undefined) {
        dateCondition.before = condition.value;
      }
      break;
    case "after":
      if (condition.value !== undefined) {
        dateCondition.after = condition.value;
      }
      break;
    case "is_empty":
      dateCondition.is_empty = true;
      break;
    case "is_not_empty":
      dateCondition.is_not_empty = true;
      break;
  }

  return {
    property: condition.propertyId,
    type: condition.propertyType,
    [condition.propertyType]: dateCondition,
  } as NotionFilterProperty;
}

function convertCheckboxFilter(
  condition: CheckboxFilterCondition
): NotionFilterProperty {
  return {
    property: condition.propertyId,
    checkbox: {
      equals: condition.value,
    },
  };
}

function convertFilterConditionToNotionFilter(
  condition: FilterCondition
): NotionFilterProperty {
  switch (condition.propertyType) {
    case "rich_text":
    case "title":
      return convertTextFilter(condition as TextFilterCondition);
    case "number":
      return convertNumberFilter(condition as NumberFilterCondition);
    case "select":
      return convertSelectFilter(condition as SelectFilterCondition);
    case "status":
      return convertStatusFilter(condition as StatusFilterCondition);
    case "date":
    case "created_time":
    case "last_edited_time":
      return convertDateFilter(condition as DateFilterCondition);
    case "checkbox":
      return convertCheckboxFilter(condition as CheckboxFilterCondition);
    default:
      throw new Error(
        `Unsupported property type: ${JSON.stringify(condition)}`
      );
  }
}

export function convertFiltersToNotionFilter(
  filters: FilterCondition[]
): NotionFilter | undefined {
  if (filters.length === 0) {
    return undefined;
  }

  if (filters.length === 1) {
    return convertFilterConditionToNotionFilter(filters[0]);
  }

  return {
    and: filters.map(convertFilterConditionToNotionFilter),
  };
}
