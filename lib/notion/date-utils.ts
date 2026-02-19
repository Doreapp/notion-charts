import type { ChartDataPoint } from "./chart-processor";

export function normalizeDateToDay(dateString: string): string | null {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString().split("T")[0];
}

export function isDateFieldType(fieldType: string): boolean {
  return (
    fieldType === "date" ||
    fieldType === "created_time" ||
    fieldType === "last_edited_time"
  );
}

export function getAllDaysInRange(
  startDate: string,
  endDate: string
): string[] {
  const days: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const current = new Date(start);

  while (current <= end) {
    days.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  return days;
}

export function fillMissingDaysInRange(
  data: ChartDataPoint[],
  startDate: string,
  endDate: string
): ChartDataPoint[] {
  if (data.length === 0) {
    const allDays = getAllDaysInRange(startDate, endDate);
    return allDays.map((day) => ({ name: day, value: 0 }));
  }

  const allDays = getAllDaysInRange(startDate, endDate);
  const dataMap = new Map<string, number>();
  data.forEach((point) => {
    dataMap.set(point.name, point.value);
  });

  return allDays.map((day) => ({
    name: day,
    value: dataMap.get(day) ?? 0,
  }));
}

export function fillMissingDays(data: ChartDataPoint[]): ChartDataPoint[] {
  if (data.length === 0) return data;

  const firstDate = data[0].name;
  const lastDate = data[data.length - 1].name;
  const allDays = getAllDaysInRange(firstDate, lastDate);

  const dataMap = new Map<string, number>();
  data.forEach((point) => {
    dataMap.set(point.name, point.value);
  });

  const filledData: ChartDataPoint[] = allDays.map((day) => {
    if (dataMap.has(day)) {
      return { name: day, value: dataMap.get(day)! };
    } else {
      return { name: day, value: 0 };
    }
  });

  return filledData;
}
