import { ChartDataPoint } from "@/lib/notion/chart-processor";

export function binDates(
  data: ChartDataPoint[],
  numBins: number,
  fillEmptyWith: number | "previous" = 0
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

  dateValues.forEach(({ date, value }) => {
    const binIndex = Math.min(
      Math.floor((date.getTime() - minTimestamp) / binSize),
      numBins - 1
    );
    const binStart = minTimestamp + binIndex * binSize;
    bins.set(binStart, (bins.get(binStart) || 0) + value);
  });

  fillEmptyBins(bins, minTimestamp, maxTimestamp, binSize, fillEmptyWith);

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

function fillEmptyBins(
  bins: Map<number, number>,
  minTimestamp: number,
  maxTimestamp: number,
  binSize: number,
  fillEmptyWith: number | "previous"
) {
  if (fillEmptyWith === "previous") {
    let currentValue = 0;
    for (let i = minTimestamp; i < maxTimestamp; i += binSize) {
      if (!bins.has(i)) {
        bins.set(i, currentValue || 0);
      } else {
        currentValue = bins.get(i) || currentValue;
      }
    }
  } else {
    for (let i = minTimestamp + binSize; i < maxTimestamp; i += binSize) {
      if (!bins.has(i)) {
        bins.set(i, fillEmptyWith || 0);
      }
    }
  }
}
