"use client";

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { ChartDataPoint } from "@/lib/notion/chart-processor";

interface LineChartProps {
  data: ChartDataPoint[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  fieldType?: string;
  accumulate?: boolean;
  onChartClick?: () => void;
}

export default function LineChart({
  data,
  xAxisLabel,
  yAxisLabel,
  fieldType,
  accumulate,
  onChartClick,
}: LineChartProps) {
  if (data.length === 0) {
    return null;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart
        data={data}
        margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
        onClick={onChartClick}
        style={{ cursor: onChartClick ? "pointer" : "default" }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255, 255, 255, 0.09)"
        />
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
        <Line
          type="monotone"
          dataKey="value"
          stroke="#2383E2"
          strokeWidth={2}
          dot={false}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
