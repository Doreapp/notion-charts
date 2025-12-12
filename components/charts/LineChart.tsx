"use client";

import { useMemo } from "react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { ChartDataPoint } from "@/lib/chart-processor";

interface LineChartProps {
  data: ChartDataPoint[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  fieldType?: string;
}

function binDates(data: ChartDataPoint[], numBins: number): ChartDataPoint[] {
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
    const binIndex = Math.min(Math.floor((date.getTime() - minTimestamp) / binSize), numBins - 1);
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

export default function LineChart({ data, xAxisLabel, yAxisLabel, fieldType }: LineChartProps) {
  const isDates =
    fieldType === "date" || fieldType === "created_time" || fieldType === "last_edited_time";

  const processedData = useMemo(() => {
    if (data.length === 0) {
      return [];
    }

    if (isDates) {
      return binDates(data, 10);
    }

    return data;
  }, [data, isDates]);

  if (processedData.length === 0) {
    return null;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart data={processedData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.09)" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: "rgba(255, 255, 255, 0.65)" }}
          stroke="rgba(255, 255, 255, 0.09)"
          label={{
            value: xAxisLabel,
            position: "insideBottom",
            offset: -5,
            style: { fontSize: 12, fill: "rgba(255, 255, 255, 0.65)" },
          }}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "rgba(255, 255, 255, 0.65)" }}
          stroke="rgba(255, 255, 255, 0.09)"
          label={{
            value: yAxisLabel,
            angle: -90,
            position: "insideLeft",
            style: { fontSize: 12, fill: "rgba(255, 255, 255, 0.65)" },
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1F1F1F",
            border: "1px solid rgba(255, 255, 255, 0.09)",
            borderRadius: "3px",
            color: "#FFFFFF",
            fontSize: "12px",
          }}
          labelStyle={{
            color: "rgba(255, 255, 255, 0.65)",
            marginBottom: "4px",
          }}
          itemStyle={{
            color: "#FFFFFF",
          }}
        />
        <Line type="monotone" dataKey="value" stroke="#2383E2" strokeWidth={2} dot={false} />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
