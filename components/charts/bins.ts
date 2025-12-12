import { ChartDataPoint } from "@/lib/notion/chart-processor";

export function binDates(
  data: ChartDataPoint[],
  numBins: number
): ChartDataPoint[] {
  const dateValues: Array<{ date: Date; value: number }> = [];

  data.forEach((point) => {
    const date = new Date(point.name);
    if (!isNaN(date.getTime())) {
      dateValues.push({ date, value: point.value });
    }
  });

  if (dateValues.length === 0) {
    return [];
  }

  const timestamps = dateValues.map((d) => d.date.getTime());
  const minTimestamp = Math.min(...timestamps);
  const maxTimestamp = Math.max(...timestamps);
  const dateRange = maxTimestamp - minTimestamp;

  if (dateRange === 0) {
    return [
      {
        name: new Date(minTimestamp).toISOString().split("T")[0],
        value: dateValues.reduce((sum, d) => sum + d.value, 0),
      },
    ];
  }

  const binSize = dateRange / numBins;
  const bins: Map<number, number> = new Map();

  Array.from({ length: numBins }).forEach((_, index) => {
    bins.set(minTimestamp + index * binSize, 0);
  });

  dateValues.forEach(({ date, value }) => {
    const binIndex = Math.min(
      Math.floor((date.getTime() - minTimestamp) / binSize),
      numBins - 1
    );
    const binStart = minTimestamp + binIndex * binSize;
    bins.set(binStart, (bins.get(binStart) || 0) + value);
  });

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toISOString().split("T")[0];
  };

  const binnedData: ChartDataPoint[] = Array.from(bins.entries())
    .map(([binStart, value]) => ({
      name: formatDate(binStart),
      value,
    }))
    .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());

  return binnedData;
}
