import { ChartDataPoint } from "./chart-processor";

export function sortDataPoints(
  data: ChartDataPoint[],
  xAxisFieldType: string,
  sortOrder: "asc" | "desc"
): ChartDataPoint[] {
  const sortFunction = getSortFunction(xAxisFieldType);
  const sorted = [...data].sort((a, b) => {
    const comparison = sortFunction(a, b);
    return sortOrder === "desc" ? -comparison : comparison;
  });
  return sorted;
}

function getSortFunction(
  xAxisFieldType: string
): (a: ChartDataPoint, b: ChartDataPoint) => number {
  switch (xAxisFieldType) {
    case "number":
      return numberSortFunction;
    case "date":
    case "created_time":
    case "last_edited_time":
      return dateSortFunction;
    default:
      return textSortFunction;
  }
}

const numberSortFunction = (a: ChartDataPoint, b: ChartDataPoint) => {
  const numA = parseFloat(a.name);
  const numB = parseFloat(b.name);
  if (!isNaN(numA) && !isNaN(numB)) {
    return numA - numB;
  } else {
    return a.name.localeCompare(b.name);
  }
};

const dateSortFunction = (a: ChartDataPoint, b: ChartDataPoint) => {
  const dateA = new Date(a.name).getTime();
  const dateB = new Date(b.name).getTime();
  if (!isNaN(dateA) && !isNaN(dateB)) {
    return dateA - dateB;
  } else {
    return a.name.localeCompare(b.name);
  }
};

const textSortFunction = (a: ChartDataPoint, b: ChartDataPoint) => {
  return a.name.localeCompare(b.name);
};
